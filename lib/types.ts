// Ortak veri tipleri

export type Category = {
  id: number;
  name: string;
  slug: string;
  emoji: string | null;
  business_count?: number;
  services?: { id: number; name: string; slug: string }[];
};

export type Province = {
  id: number;
  name: string;
  slug: string;
};

export type District = {
  id: number;
  name: string;
  slug: string;
  province_id: number;
};

export type BusinessCard = {
  id: string;
  name: string;
  slug: string;
  category_name: string | null;
  province_name: string | null;
  district_name: string | null;
  cover_url: string | null;
  services: string[];
  created_at: string;
};
