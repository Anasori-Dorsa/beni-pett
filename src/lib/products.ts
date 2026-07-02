import { supabase } from "@/integrations/supabase/client";

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
};

export type Category = {
  id: string;
  slug: string;
  name_fa: string;
  name_en: string;
  sort_order: number;
};

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(slug)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((p: any) => ({ ...p, category_slug: p.categories?.slug ?? null }));
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(slug)")
    .eq("is_active", true)
    .eq("is_featured", true)
    .limit(3);
  if (error) throw error;
  return (data ?? []).map((p: any) => ({ ...p, category_slug: p.categories?.slug ?? null }));
}