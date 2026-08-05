// src/lib/products.ts
import { apiFetch } from "@/lib/api-client";

export type Product = {
  id: string;
  slug: string;
  category_id: string | null;
  category_slug?: string | null;
  name_fa: string;
  name_en: string;
  brand: string | null;
  description_fa: string | null;
  description_en: string | null;
  price_toman: number;
  compare_at_price_toman: number | null;
  stock: number;
  images: string[];
  features: Record<string, unknown>;
  is_active: boolean;
  is_featured: boolean;
  is_on_sale: boolean;
  discount_percent: number | null;
};

export type Category = {
  id: string;
  slug: string;
  name_fa: string;
  name_en: string;
  sort_order: number;
};

export async function fetchCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/api/categories");
}

export async function fetchProducts(): Promise<Product[]> {
  return apiFetch<Product[]>("/api/products");
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  return apiFetch<Product[]>("/api/products/featured");
}

export async function fetchOffers(limit?: number): Promise<Product[]> {
  const qs = limit ? `?limit=${limit}` : "";
  return apiFetch<Product[]>(`/api/products/offers${qs}`);
}
