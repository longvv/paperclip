import type { IssueDocument } from "@paperclipai/shared";
import { api } from "./client";

export const documentsApi = {
  list: (companyId: string) => api.get<IssueDocument[]>(`/companies/${companyId}/artifacts/documents`),
};
