export type UUID = string;
export type ISODateString = string;

export type Nullable<T>  = T | null;
export type Optional<T>  = T | undefined;

export type Prettify<T> = { [K in keyof T]: T[K] } & {};

export type ValueOf<T> = T[keyof T];

export type ApiResponse<T> = {
  data:     T;
  message?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page:  number;
  size:  number;
};

export interface ApiError {
  detail: string;
  status: number;
}
