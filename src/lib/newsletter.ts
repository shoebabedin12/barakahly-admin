import { apiDelete, apiDownload, apiGet, apiPost } from "./api";
import type { Paginated } from "./types";

export interface Subscriber {
  id: number;
  email: string;
  status: boolean;
  location: string | null;
  device: string | null;
  browser: string | null;
  operatingSystem: string | null;
  source: string | null;
  campaign: string | null;
  subscribedAt: string | null;
  createdAt: string | null;
}

export interface NewsletterLog {
  id: number;
  email: string;
  subject: string;
  type: "broadcast" | "individual";
  batchId: string | null;
  status: "sent" | "failed";
  error: string | null;
  createdAt: string;
}

export interface NewsletterBatch {
  batchId: string;
  subject: string;
  sentAt: string;
  sentCount: number;
  failedCount: number;
}

export interface NewsletterMessage {
  subject: string;
  body: string;
}

export const newsletterApi = {
  list: (page = 1) =>
    apiGet<
      Paginated<Subscriber> & { locationBreakdown: { location: string; total: number }[]; activeCount: number }
    >(`/api/v1/admin/newsletter?page=${page}`),
  get: (id: number) => apiGet<Subscriber>(`/api/v1/admin/newsletter/${id}`),
  remove: (id: number) => apiDelete<{ message: string }>(`/api/v1/admin/newsletter/${id}`),
  exportCsv: () => apiDownload("/api/v1/admin/newsletter/export", "newsletter-subscribers.csv"),
  broadcast: (message: NewsletterMessage) =>
    apiPost<{ batchId: string; count: number }>("/api/v1/admin/newsletter/send", message),
  sendOne: (id: number, message: NewsletterMessage) =>
    apiPost<{ sent: boolean; message: string }>(`/api/v1/admin/newsletter/${id}/send`, message),
  logs: (batchesPage = 1, individualPage = 1) =>
    apiGet<{ batches: Paginated<NewsletterBatch>; individual: Paginated<NewsletterLog> }>(
      `/api/v1/admin/newsletter/logs?batches=${batchesPage}&individual=${individualPage}`,
    ),
  batch: (batchId: string, page = 1) =>
    apiGet<
      Paginated<NewsletterLog> & {
        batchId: string;
        subject: string | null;
        sentCount: number;
        failedCount: number;
      }
    >(`/api/v1/admin/newsletter/logs/${batchId}?page=${page}`),
};
