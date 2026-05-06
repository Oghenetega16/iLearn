// mobile/hooks/content/useHomeData.ts
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Course {
  id: string;
  title: string;
  author_name: string;
  price: number;
  rating: number;
  review_count: number;
  image_url: string;
  is_bestseller: boolean;
  is_featured: boolean;
  is_trending: boolean;
}

export interface Promotion {
  id: string;
  header: string;
  sub_header: string;
  description: string;
  image_url: string;
}

export function useHomeData() {
  // Use Generic types <T[]>
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    setLoading(true);
    try {
      const [catRes, courseRes, promoRes] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('courses').select('*').order('created_at', { ascending: false }),
        supabase.from('promotions').select('*').eq('active', true)
      ]);

      // Use Type Casting (as Category[]) to bridge Supabase's 'any' response
      if (catRes.data) setCategories(catRes.data as Category[]);
      if (courseRes.data) setCourses(courseRes.data as Course[]);
      if (promoRes.data) setPromotions(promoRes.data as Promotion[]);
      
    } catch (error) {
      console.error("Error fetching home content:", error);
    } finally {
      setLoading(false);
    }
  };

  return { categories, courses, promotions, loading };
}