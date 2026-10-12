import { API_BASE } from "@berea/core";
import { readingApiClient } from "./readingApiClient";
import type { ReadingBook, ReadingBookWrite } from "./bookTypes";

export const readingBookApi = {
  list: () => readingApiClient.get<ReadingBook[]>("/v1/reading/books"),

  get: (id: string) => readingApiClient.get<ReadingBook>(`/v1/reading/books/${id}`),

  create: (body: ReadingBookWrite) => readingApiClient.post<ReadingBook>("/v1/reading/books", body),

  update: (id: string, body: ReadingBookWrite) =>
    readingApiClient.patch<ReadingBook>(`/v1/reading/books/${id}`, body),

  remove: (id: string) => readingApiClient.delete(`/v1/reading/books/${id}`),

  uploadCover: (id: string, image: Blob) => {
    const form = new FormData();
    form.append("cover", image, "cover.jpg");
    return readingApiClient.putForm<ReadingBook>(`/v1/reading/books/${id}/cover`, form);
  },

  removeCover: (id: string) => readingApiClient.delete<ReadingBook>(`/v1/reading/books/${id}/cover`),
};

/** Uploaded covers come back as API-relative paths; pasted covers are already absolute URLs. */
export function bookCoverSrc(coverUrl: string | null): string | null {
  if (!coverUrl) return null;
  return coverUrl.startsWith("/") ? `${API_BASE}${coverUrl}` : coverUrl;
}

export interface BookOfMonthResult {
  book:                 ReadingBook;
  chosen_by_percent:    number;
  your_page:            number;
  team_average_percent: number;
}

export const readingBookOfMonthApi = {
  get: () => readingApiClient.get<BookOfMonthResult | null>("/v1/reading/book-of-the-month"),

  logProgress: (currentPage: number) =>
    readingApiClient.put<BookOfMonthResult>("/v1/reading/book-of-the-month/progress", { current_page: currentPage }),
};
