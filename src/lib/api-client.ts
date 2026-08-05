// src/lib/api-client.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown; // اگر FormData باشه عیناً ارسال میشه، در غیر این صورت JSON.stringify میشه
};

export async function apiFetch<T = unknown>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const finalHeaders: HeadersInit = isFormData
    ? { ...(headers ?? {}) }
    : { "Content-Type": "application/json", ...(headers ?? {}) };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include", // کوکی httpOnly حاوی JWT همراه هر درخواست ارسال میشه
    headers: finalHeaders,
    body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });

  const text = await res.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && (data.message || data.error)) ||
      (typeof data === "string" && data) ||
      `درخواست ناموفق بود (کد ${res.status})`;
    throw new ApiError(String(message), res.status);
  }

  return data as T;
}
