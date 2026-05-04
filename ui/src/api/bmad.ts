import { api } from "./client";

export interface BMadPersona {
  key: string;
  name?: string;
  role: string;
  capabilities: string;
  systemPrompt: string;
}

export const bmadApi = {
  listRoles: async (): Promise<string[]> => {
    return api.get<string[]>("/bmad/roles");
  },
  getPersona: async (key: string): Promise<BMadPersona> => {
    return api.get<BMadPersona>(`/bmad/persona/${key}`);
  },
};
