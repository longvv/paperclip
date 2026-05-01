import React, { useEffect, useState, useRef, useMemo } from "react";
import { useCompany } from "../context/CompanyContext";
import { type LiveEvent, type Agent } from "@paperclipai/shared";
import { redactHomePathUserSegments } from "@paperclipai/adapter-utils";
import { useQuery } from "@tanstack/react-query";
import { agentsApi } from "../api/agents";
import { queryKeys } from "../lib/queryKeys";
import { ScrollToBottom } from "./ScrollToBottom";
import { cn } from "../lib/utils";
import { Terminal, Bot, Clock, AlertCircle } from "lucide-react";

interface LiveLogEntry {
  ts: string;
  agentId: string;
  agentName: string;
  runId: string;
  type: "log" | "event";
  stream?: string;
  level?: string;
  content: string;
  eventType?: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  return value.trim();
}

export function LiveLogViewer() {
  const { selectedCompanyId } = useCompany();
  const [entries, setEntries] = useState<LiveLogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const entriesRef = useRef<LiveLogEntry[]>([]);
  entriesRef.current = entries;

  const { data: agents } = useQuery({
    queryKey: queryKeys.agents(selectedCompanyId!),
    queryFn: () => agentsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const agentMap = useMemo(() => {
    const map = new Map<string, Agent>();
    agents?.forEach(a => map.set(a.id, a));
    return map;
  }, [agents]);

  useEffect(() => {
    if (!selectedCompanyId) return;

    let closed = false;
    let reconnectTimer: number | null = null;
    let socket: WebSocket | null = null;

    const connect = () => {
      if (closed) return;
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const url = `${protocol}://${window.location.host}/api/companies/${encodeURIComponent(selectedCompanyId)}/events/ws`;
      socket = new WebSocket(url);

      socket.onopen = () => setIsConnected(true);
      socket.onmessage = (message) => {
        const raw = typeof message.data === "string" ? message.data : "";
        if (!raw) return;

        try {
          const event = JSON.parse(raw) as LiveEvent;
          if (event.companyId !== selectedCompanyId) return;

          const payload = asRecord(event.payload);
          if (!payload) return;

          const runId = asNonEmptyString(payload.runId);
          const agentId = asNonEmptyString(payload.agentId);
          if (!runId || !agentId) return;

          const agent = agentMap.get(agentId);
          const agentName = agent?.name ?? "Unknown Agent";

          if (event.type === "heartbeat.run.log") {
            const chunk = typeof payload.chunk === "string" ? payload.chunk : "";
            if (!chunk) return;
            const stream = asNonEmptyString(payload.stream) ?? "stdout";
            const ts = asNonEmptyString(payload.ts) ?? event.createdAt;
            
            setEntries(prev => [...prev.slice(-999), {
              ts,
              agentId,
              agentName,
              runId,
              type: "log",
              stream,
              content: chunk
            }]);
          } else if (event.type === "heartbeat.run.event") {
            const msg = asNonEmptyString(payload.message);
            if (!msg) return;
            const ts = event.createdAt;
            const eventType = asNonEmptyString(payload.eventType) ?? "event";
            const level = asNonEmptyString(payload.level) ?? "info";

            setEntries(prev => [...prev.slice(-999), {
              ts,
              agentId,
              agentName,
              runId,
              type: "event",
              level,
              content: msg,
              eventType
            }]);
          }
        } catch (err) {
          console.error("LiveLogViewer: failed to parse message", err);
        }
      };

      socket.onerror = () => socket?.close();
      socket.onclose = () => {
        setIsConnected(false);
        if (!closed) {
          reconnectTimer = window.setTimeout(connect, 1500);
        }
      };
    };

    connect();
    return () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [selectedCompanyId, agentMap]);

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-neutral-950 text-neutral-200 font-mono text-[11px] rounded-lg overflow-hidden border border-border shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02] shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-cyan-500" />
          <span className="font-bold tracking-tight text-neutral-400">LIVE CONSOLE</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1.5">
            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isConnected ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-red-500")} />
            <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-0.5 custom-scrollbar bg-[#0a0a0a]">
        {entries.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-neutral-600 gap-3">
            <Bot className="h-8 w-8 opacity-20 animate-bounce" />
            <p className="italic text-[13px] tracking-wide">Waiting for agent activity in {selectedCompanyId}...</p>
          </div>
        ) : (
          entries.map((entry, idx) => (
            <div key={idx} className="flex gap-3 group hover:bg-white/[0.03] -mx-4 px-4 py-0.5 transition-colors items-baseline">
              <span className="text-neutral-600 shrink-0 select-none w-20 text-[10px]">
                {new Date(entry.ts).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-cyan-500/80 font-bold shrink-0 w-28 truncate" title={entry.agentName}>
                {entry.agentName}
              </span>
              <span className={cn(
                "flex-1 break-all whitespace-pre-wrap leading-relaxed",
                entry.type === "event" ? (
                  entry.level === "error" ? "text-red-400 font-bold" : 
                  entry.level === "warn" ? "text-yellow-400" : "text-blue-400 italic"
                ) : (
                   entry.stream === "stderr" ? "text-red-400" : "text-neutral-300"
                )
              )}>
                {entry.type === "event" && <AlertCircle className="inline h-3 w-3 mr-1 opacity-50 mb-0.5" />}
                {redactHomePathUserSegments(entry.content)}
              </span>
            </div>
          ))
        )}
        <ScrollToBottom />
      </div>
    </div>
  );
}
