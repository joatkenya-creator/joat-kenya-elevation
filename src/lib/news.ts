const SUPABASE_URL = "https://prkdfkkhqncxkyehokop.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBya2Rma2tocW5jeGt5ZWhva29wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjA3NzEsImV4cCI6MjA4OTkzNjc3MX0.401RvhF8C4D5K3J20m7vXLpKpBp39M6vn3TmRkHXe48";

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  cover_image: string | null;
  category: string;
  content: string;
  created_at: string;
};

/**
 * Browser-side fetch of blog/news articles from JOAT's Supabase. The anon key is
 * public (designed to be embedded). Read access is governed by Supabase RLS.
 */
export async function fetchNewsArticles(): Promise<
  { ok: true; posts: BlogPost[] } | { ok: false; posts: [] }
> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/blog_posts?select=id,title,excerpt,cover_image,category,content,created_at&order=created_at.desc&limit=20`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) {
      console.error("News fetch error", res.status);
      return { ok: false, posts: [] };
    }
    const posts = (await res.json()) as BlogPost[];
    return { ok: true, posts };
  } catch (err) {
    console.error("News fetch transport error", err);
    return { ok: false, posts: [] };
  }
}
