import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type BusinessSettings = {
  id: string;
  company_name: string;
  tagline: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  working_hours: string | null;
  emergency_message: string | null;
  about_text: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  linkedin_url: string | null;
  x_url: string | null;
  terms_text: string | null;
  privacy_text: string | null;
  footer_text: string | null;
  payment_instructions: string | null;
};

export type Service = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  pricing_type: string;
  starting_price: number | null;
  price_public: boolean;
  is_active: boolean;
  sort_order: number;
};

export const settingsQuery = queryOptions({
  queryKey: ["business_settings"],
  queryFn: async (): Promise<BusinessSettings | null> => {
    const { data, error } = await supabase
      .from("business_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data as BusinessSettings | null;
  },
  staleTime: 5 * 60 * 1000,
});

export const servicesQuery = queryOptions({
  queryKey: ["services"],
  queryFn: async (): Promise<Service[]> => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as Service[];
  },
  staleTime: 5 * 60 * 1000,
});

export const serviceAreasQuery = queryOptions({
  queryKey: ["service_areas"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("service_areas")
      .select("id,name")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },
  staleTime: 5 * 60 * 1000,
});

export const faqsQuery = queryOptions({
  queryKey: ["faqs"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("faqs")
      .select("id,question,answer,service_id")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },
  staleTime: 5 * 60 * 1000,
});

export const projectsQuery = queryOptions({
  queryKey: ["projects"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .order("completed_on", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const approvedReviewsQuery = queryOptions({
  queryKey: ["reviews", "approved"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("id,author_name,rating,body,created_at,service_id,is_demo")
      .eq("status", "APPROVED")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

/** Digits-only phone for tel:/wa.me links. */
export function phoneDigits(value: string | null | undefined) {
  return (value ?? "").replace(/[^\d]/g, "");
}

export function whatsappLink(number: string | null | undefined, message: string) {
  const digits = phoneDigits(number);
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function telLink(number: string | null | undefined) {
  const digits = phoneDigits(number);
  if (!digits) return null;
  return `tel:+${digits}`;
}

export const DEFAULT_WHATSAPP_MESSAGE =
  "Hello Zentric Electrical Services, I would like to request a quote for ";
