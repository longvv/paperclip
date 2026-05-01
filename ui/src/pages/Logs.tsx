import { useState } from "react";
import { useParams, Link } from "@/lib/router";
import { useQuery } from "@tanstack/react-query";
import { heartbeatsApi } from "@/api/heartbeats";
import { queryKeys } from "@/lib/queryKeys";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Activity, Clock, Bot, History } from "lucide-react";
import { useCompany } from "@/context/CompanyContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiveLogViewer } from "@/components/LiveLogViewer";

export function Logs() {
  const { companyPrefix } = useParams<{ companyPrefix: string }>();
  const { selectedCompany: company } = useCompany();
  const [activeTab, setActiveTab] = useState("live");

  const { data: runs, isLoading } = useQuery({
    queryKey: ["heartbeat-runs", company?.id, "all"],
    queryFn: () => heartbeatsApi.list(company!.id),
    enabled: !!company?.id,
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Terminal className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Monitoring Hub</h1>
            <p className="text-xs text-muted-foreground font-medium">Centralized agent observability and logs</p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-border">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Live Monitoring Active</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-6 border-b border-border bg-muted/10">
            <TabsList className="h-12 bg-transparent gap-6 p-0">
              <TabsTrigger 
                value="live" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 gap-2 text-sm font-semibold transition-all hover:text-foreground"
              >
                <Terminal className="w-4 h-4" />
                Live Console
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 gap-2 text-sm font-semibold transition-all hover:text-foreground"
              >
                <History className="w-4 h-4" />
                Run History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="live" className="flex-1 p-6 m-0 focus-visible:outline-none overflow-hidden">
            <LiveLogViewer />
          </TabsContent>

          <TabsContent value="history" className="flex-1 m-0 focus-visible:outline-none overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest text-[9px]">Status</th>
                        <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest text-[9px]">Agent</th>
                        <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest text-[9px]">Trigger</th>
                        <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest text-[9px]">Started</th>
                        <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest text-[9px]">Duration</th>
                        <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest text-[9px] text-right">Run ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {runs?.map((run: any) => (
                        <tr key={run.id} className="hover:bg-muted/30 transition-colors group cursor-default">
                          <td className="px-4 py-3">
                            <Badge 
                              variant={run.status === "running" ? "default" : run.status === "failed" ? "destructive" : "secondary"}
                              className={cn(
                                "capitalize text-[10px] py-0 px-2 font-bold tracking-wide border-none",
                                run.status === "running" && "bg-cyan-500 hover:bg-cyan-600 shadow-[0_0_8px_#06b6d444]"
                              )}
                            >
                              {run.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Link 
                              to={`/${companyPrefix}/agents/${run.agentId}`}
                              className="flex items-center gap-2 hover:text-primary transition-colors font-bold text-foreground/80"
                            >
                              <Bot className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                              {run.agentName || "Unknown Agent"}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground font-medium">
                            <div className="flex items-center gap-2">
                              <Activity className="w-3.5 h-3.5 opacity-60" />
                              {run.invocationSource}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground tabular-nums font-medium">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 opacity-60" />
                              {formatDistanceToNow(new Date(run.createdAt), { addSuffix: true })}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground tabular-nums font-medium">
                            {run.finishedAt 
                              ? `${Math.round((new Date(run.finishedAt).getTime() - new Date(run.createdAt).getTime()) / 1000)}s`
                              : run.status === "running" ? <span className="text-cyan-500 animate-pulse font-bold italic">In progress...</span> : "-"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link 
                              to={`/${companyPrefix}/agents/${run.agentId}/runs/${run.id}`}
                              className="text-[10px] font-mono font-bold text-muted-foreground hover:text-primary transition-colors underline decoration-dotted decoration-border hover:decoration-primary"
                            >
                              {run.id.slice(0, 8)}
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {runs?.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-24 text-center text-muted-foreground">
                            <div className="flex flex-col items-center gap-4 opacity-40">
                              <Bot className="w-12 h-12" />
                              <div className="space-y-1">
                                <p className="text-lg font-bold">No Activity Recorded</p>
                                <p className="text-sm">Heartbeat runs for this company will appear here.</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

