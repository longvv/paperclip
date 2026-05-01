import { useState, useEffect, useCallback } from "react";
import { FileText, Save, RotateCcw, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { agentsApi } from "../api/agents";

interface InstructionsContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  companyId?: string;
}

export function InstructionsContentModal({
  open,
  onOpenChange,
  agentId,
  companyId,
}: InstructionsContentModalProps) {
  const [content, setContent] = useState("");
  const [resolvedPath, setResolvedPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [originalContent, setOriginalContent] = useState("");

  const fetchContent = useCallback(async () => {
    if (!agentId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await agentsApi.getInstructionsContent(agentId, companyId);
      setContent(result.content);
      setOriginalContent(result.content);
      setResolvedPath(result.path);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load instructions file.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [agentId, companyId]);

  useEffect(() => {
    if (open) {
      void fetchContent();
      setSaved(false);
    }
  }, [open, fetchContent]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await agentsApi.saveInstructionsContent(agentId, content, companyId);
      setOriginalContent(content);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to save instructions file.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setContent(originalContent);
    setSaved(false);
  };

  const isDirty = content !== originalContent;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <DialogTitle className="text-base">Instructions File</DialogTitle>
          </div>
          {resolvedPath && (
            <DialogDescription className="font-mono text-xs text-muted-foreground break-all">
              {resolvedPath}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0 px-6 py-4 gap-3">
          {loading && (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading…</span>
            </div>
          )}

          {error && !loading && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && (
            <textarea
              className="flex-1 w-full resize-none rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs leading-relaxed outline-none focus:ring-1 focus:ring-ring focus:border-ring placeholder:text-muted-foreground/40"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setSaved(false);
              }}
              placeholder="Instructions file content will appear here…"
              spellCheck={false}
            />
          )}
        </div>

        <div className="px-6 pb-6 pt-3 border-t border-border shrink-0 flex items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            {!loading && !error && resolvedPath && (
              <span>
                {content.length.toLocaleString()} chars
                {isDirty && " · unsaved changes"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isDirty && (
              <Button variant="ghost" size="sm" onClick={handleReset} disabled={saving}>
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reset
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              {isDirty ? "Discard" : "Close"}
            </Button>
            <Button
              size="sm"
              onClick={() => void handleSave()}
              disabled={saving || !isDirty || loading || !!error}
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 mr-1.5" />
              )}
              {saved ? "Saved!" : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
