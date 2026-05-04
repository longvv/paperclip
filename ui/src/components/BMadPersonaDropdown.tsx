import { useQuery } from "@tanstack/react-query";
import { bmadApi } from "../api/bmad";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";

interface BMadPersonaDropdownProps {
  onSelect: (key: string) => void;
  selectedKey?: string;
}

export function BMadPersonaDropdown({ onSelect, selectedKey }: BMadPersonaDropdownProps) {
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["bmad", "roles"],
    queryFn: bmadApi.listRoles,
  });

  if (roles.length === 0 && !isLoading) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3 w-3 text-amber-500" />
        <span className="text-xs font-medium text-amber-200/80">Adopt BMad Persona</span>
      </div>
      <Select value={selectedKey} onValueChange={onSelect} disabled={isLoading}>
        <SelectTrigger className="w-full bg-amber-500/5 border-amber-500/20 text-amber-100/90 h-9 font-mono text-sm">
          <SelectValue placeholder={isLoading ? "Loading roles..." : "Select a persona to adopt"} />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a1a] border-amber-500/20">
          {roles.map((role) => (
            <SelectItem 
              key={role} 
              value={role}
              className="text-amber-100/80 focus:bg-amber-500/10 focus:text-amber-100 font-mono text-sm"
            >
              {role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-[10px] text-amber-500/60 italic px-1">
        Adopting a persona will update the agent's title, capabilities, and system prompt.
      </p>
    </div>
  );
}
