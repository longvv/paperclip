import React, { useEffect, useState, useRef, useMemo } from "react";
import { type LiveEvent, type Agent } from "@paperclipai/shared";
import { redactHomePathUserSegments } from "@paperclipai/adapter-utils";
import { ScrollToBottom } from "./ScrollToBottom";
import { cn } from "../lib/utils";
import { Terminal, Bot, Clock, AlertCircle, Zap } from "lucide-react";
import { useCompany } from "../context/CompanyContext";

interface TraceEntry {
  ts: string;
  companyId: string;
  agentId?: string;
  agentName?: string;
  runId?: string;
  type: "log" | "event" | "system";
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

export function MasterTraceViewer() {
  const { selectedCompanyId } = useCompany(); // Used only for fetching agent names if possible
  const [entries, setEntries] = useState<TraceEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Fetch initial trace history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/master-trace");
        if (!res.ok) throw new Error("Failed to fetch trace history");
        
        // The API returns a JSON array, not NDJSON
        const data = await res.json();
        if (!Array.isArray(data)) {
           throw new Error("Trace history is not an array");
        }

        const historicalEntries: TraceEntry[] = data.map((event: LiveEvent) => {
          try {
            return parseLiveEvent(event);
          } catch (err) {
            console.error("MasterTraceViewer: failed to parse historical event", err, event);
            return null;
          }
        }).filter((e): e is TraceEntry => !!e);
        
        // Entries are returned latest-first from API (usually), 
        // but we want to maintain the correct order in state if we append.
        // Actually MasterTraceService returns events.reverse().slice(...) 
        // which means it's returning the LATEST entries, but in REVERSE order (oldest last?).
        // Wait, events.reverse() makes [latest, ..., oldest].
        // We want to show them in chronological order in the viewer (oldest top, latest bottom).
        setEntries(historicalEntries.reverse());
      } catch (err) {
        console.error("MasterTraceViewer: failed to fetch history", err);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchHistory();
  }, []);

  function parseLiveEvent(event: LiveEvent): TraceEntry {
    const payload = asRecord(event.payload);
    const ts = event.createdAt || new Date().toISOString();
    const companyId = event.companyId || "unknown";

    if (event.type === "heartbeat.run.log") {
      return {
        ts: asNonEmptyString(payload?.ts) ?? ts,
        companyId,
        agentId: asNonEmptyString(payload?.agentId) ?? undefined,
        runId: asNonEmptyString(payload?.runId) ?? undefined,
        type: "log",
        stream: asNonEmptyString(payload?.stream) ?? "stdout",
        content: typeof payload?.chunk === "string" ? payload.chunk : JSON.stringify(payload ?? {})
      };
    }

    if (event.type === "heartbeat.run.event") {
      return {
        ts,
        companyId,
        agentId: asNonEmptyString(payload?.agentId) ?? undefined,
        runId: asNonEmptyString(payload?.runId) ?? undefined,
        type: "event",
        level: asNonEmptyString(payload?.level) ?? "info",
        content: asNonEmptyString(payload?.message) ?? JSON.stringify(payload ?? {}),
        eventType: asNonEmptyString(payload?.eventType) ?? "event"
      };
    }

    // Default for other events
    return {
      ts,
      companyId,
      type: "system",
      content: `${event.type || "unknown"}: ${JSON.stringify(event.payload ?? {})}`
    };
  }

  useEffect(() => {
    let closed = false;
    let reconnectTimer: number | null = null;
    let socket: WebSocket | null = null;

    const connect = () => {
      if (closed) return;
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const url = `${protocol}://${window.location.host}/api/master-trace/ws`;
      socket = new WebSocket(url);

      socket.onopen = () => setIsConnected(true);
      socket.onmessage = (message) => {
        const raw = typeof message.data === "string" ? message.data : "";
        if (!raw) return;

        try {
          const event = JSON.parse(raw) as LiveEvent;
          const entry = parseLiveEvent(event);
          setEntries(prev => [...prev.slice(-1999), entry]);
        } catch (err) {
          console.error("MasterTraceViewer: failed to parse message", err);
        }
      };

      socket.onerror = () => socket?.close();
      socket.onclose = () => {
        setIsConnected(false);
        if (!closed) {
          reconnectTimer = window.setTimeout(connect, 2000);
        }
      };
    };

    connect();
    return () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, []);

  const renderTimestamp = (ts: string) => {
    try {
      const date = new Date(ts);
      if (isNaN(date.getTime())) return "??:??:??";
      return date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return "??:??:??";
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-neutral-950 text-neutral-200 font-mono text-[11px] rounded-lg overflow-hidden border border-border shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02] shrink-0">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span className="font-bold tracking-tight text-neutral-400">MASTER AUDIT LOG</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1.5">
            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isConnected ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-red-500")} />
            <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-0.5 custom-scrollbar bg-[#0a0a0a]">
        {isInitialLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-neutral-600 gap-3">
             <Clock className="h-8 w-8 animate-spin opacity-20" />
             <p className="italic text-[13px] tracking-wide">Loading audit history...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-neutral-600 gap-3">
            <Bot className="h-8 w-8 opacity-20" />
            <p className="italic text-[13px] tracking-wide">No audit events recorded yet.</p>
          </div>
        ) : (
          entries.map((entry, idx) => (
            <div key={idx} className="flex gap-3 group hover:bg-white/[0.03] -mx-4 px-4 py-0.5 transition-colors items-baseline">
              <span className="text-neutral-600 shrink-0 select-none w-20 text-[10px]">
                {renderTimestamp(entry.ts)}
              </span>
              <span className="text-amber-500/80 font-bold shrink-0 w-24 truncate" title={`Company: ${entry.companyId}`}>
                {(entry.companyId || "unknown").slice(0, 8)}
              </span>
              {entry.agentId && (
                <span className="text-cyan-500/80 shrink-0 w-24 truncate" title={`Agent: ${entry.agentId}`}>
                  {entry.agentId.slice(0, 8)}
                </span>
              )}
              <span className={cn(
                "flex-1 break-all whitespace-pre-wrap leading-relaxed",
                entry.type === "event" ? (
                  entry.level === "error" ? "text-red-400 font-bold" : 
                  entry.level === "warn" ? "text-yellow-400" : "text-blue-400 italic"
                ) : entry.type === "system" ? "text-purple-400 opacity-80" : (
                   entry.stream === "stderr" ? "text-red-400" : "text-neutral-300"
                )
              )}>
                {entry.type === "event" && <AlertCircle className="inline h-3 w-3 mr-1 opacity-50 mb-0.5" />}
                {entry.type === "system" && <Zap className="inline h-3 w-3 mr-1 opacity-50 mb-0.5" />}
                {redactHomePathUserSegments(entry.content || "")}
              </span>
            </div>
          ))
        )}
        <ScrollToBottom />
      </div>
    </div>
  );
}
