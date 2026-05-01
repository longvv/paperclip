import { useParams, Link } from "@/lib/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { assetsApi } from "@/api/assets";
import { documentsApi } from "@/api/documents";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Image as ImageIcon, ExternalLink, Download, Clock, Database, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompany } from "@/context/CompanyContext";
import { Badge } from "@/components/ui/badge";

export function Artifacts() {
  const { companyPrefix } = useParams<{ companyPrefix: string }>();
  const { selectedCompany: company } = useCompany();

  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ["assets", company?.id, "list"],
    queryFn: () => assetsApi.list(company!.id),
    enabled: !!company?.id,
  });

  const { data: documents, isLoading: docsLoading } = useQuery({
    queryKey: ["documents", company?.id, "list"],
    queryFn: () => documentsApi.list(company!.id),
    enabled: !!company?.id,
  });

  const queryClient = useQueryClient();

  const isLoading = assetsLoading || docsLoading;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["assets", company?.id] });
    queryClient.invalidateQueries({ queryKey: ["documents", company?.id] });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Artifact Vault</h1>
            <p className="text-xs text-muted-foreground font-medium">Browse agent-generated assets and documents</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[10px] bg-muted/50 border border-border px-3 py-1.5 rounded-full flex items-center gap-4 font-bold uppercase tracking-widest text-muted-foreground">
            <div className="flex items-center gap-1.5 border-r border-border pr-3">
              <ImageIcon className="w-3 h-3 text-cyan-500" />
              {assets?.length || 0} Assets
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-amber-500" />
              {documents?.length || 0} Docs
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2 font-bold text-[11px] uppercase tracking-wider h-8">
            <RotateCcw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="assets" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="assets" className="gap-2 px-4 py-2">
              <ImageIcon className="w-4 h-4" />
              Assets & Images
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2 px-4 py-2">
              <FileText className="w-4 h-4" />
              Issue Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="mt-0">
            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
                {assets?.map((asset: any) => (
                  <Card key={asset.id} className="overflow-hidden group border-border/50 hover:border-primary/50 transition-all shadow-none">
                    <div className="aspect-video relative bg-muted flex items-center justify-center overflow-hidden">
                      <img 
                        src={`/api/assets/${asset.id}/content`} 
                        alt={asset.id} 
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="icon" variant="secondary" className="h-8 w-8" asChild>
                          <a href={`/api/assets/${asset.id}/content`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => {
                          const a = window.document.createElement('a');
                          a.href = `/api/assets/${asset.id}/content`;
                          a.download = `asset-${asset.id}`;
                          a.click();
                        }}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardHeader className="p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs truncate font-mono text-muted-foreground">
                          {asset.id.slice(0, 12)}...
                        </CardTitle>
                      </div>
                      <CardDescription className="text-[10px] flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {format(new Date(asset.createdAt), "MMM d, yyyy HH:mm")}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
                {assets?.length === 0 && (
                  <div className="col-span-full py-20 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                    <ImageIcon className="w-12 h-12 mx-auto opacity-10 mb-4" />
                    <p className="text-sm font-medium">No assets found for this company.</p>
                    <p className="text-xs opacity-60 mt-1">Images uploaded via comments or issues will appear here.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="documents" className="mt-0">
            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-10">
                {documents?.map((doc: any) => (
                  <Card key={doc.id} className="border-border/50 hover:border-primary/50 transition-all shadow-none group">
                    <CardHeader className="p-4 flex flex-row items-start justify-between space-y-0">
                      <div className="space-y-1 pr-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] uppercase font-mono px-1.5 py-0">
                            {doc.key}
                          </Badge>
                          <CardTitle className="text-sm truncate">
                            {doc.title || "Untitled Document"}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Updated {format(new Date(doc.updatedAt), "MMM d, HH:mm")}
                          </span>
                          <span className="flex items-center gap-1">
                            v{doc.latestRevisionNumber}
                          </span>
                        </CardDescription>
                      </div>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                        <Link to={`/${companyPrefix}/issues/${doc.issueId}`}>
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </Button>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="bg-muted/30 rounded-md p-3 text-[11px] font-mono line-clamp-3 text-muted-foreground overflow-hidden h-[60px]">
                        {doc.body?.slice(0, 300) || "No content."}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {documents?.length === 0 && (
                  <div className="col-span-full py-20 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                    <FileText className="w-12 h-12 mx-auto opacity-10 mb-4" />
                    <p className="text-sm font-medium">No documents found for this company.</p>
                    <p className="text-xs opacity-60 mt-1">Agent-generated plans and reports will appear here.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
