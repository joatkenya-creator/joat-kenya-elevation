import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Calendar, Loader2, X } from "lucide-react";
import { fetchNewsArticles, type BlogPost } from "@/lib/news";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function readingTime(html: string) {
  const words = stripHtml(html).split(" ").filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 220))} min`;
}

function PostCover({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={`relative bg-linear-to-br from-(--joat-red)/30 via-(--joat-navy-deep) to-(--joat-gold)/30 ${className ?? ""}`}
      >
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" className={`object-cover ${className ?? ""}`} />;
}

export function News() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [error, setError] = useState(false);
  const [active, setActive] = useState<BlogPost | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchNewsArticles()
      .then((res) => {
        if (cancelled) return;
        if (res.ok && res.posts.length > 0) setPosts(res.posts);
        else setError(true);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  const featured = posts?.[0];
  const rest = posts?.slice(1) ?? [];

  return (
    <section className="relative py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
        >
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Latest Insights</div>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">News & Articles</h2>
          </div>
          <p className="text-sm text-muted-foreground sm:text-right max-w-xs leading-relaxed">
            Perspectives on technology, work culture and the modern digital workplace.
          </p>
        </motion.div>

        {posts === null && !error && (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-3 text-(--joat-gold)" />
            Loading insights…
          </div>
        )}

        {error && (
          <div className="glass rounded-2xl p-10 text-center text-muted-foreground">
            We couldn't load articles right now. Please refresh in a moment.
          </div>
        )}

        {posts && posts.length > 0 && (
          <>
            {/* Featured article */}
            {featured && (
              <motion.button
                type="button"
                onClick={() => setActive(featured)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="block w-full text-left glass rounded-3xl overflow-hidden mb-8 group hover:border-(--joat-gold)/40 transition-all"
              >
                <div className="md:flex">
                  <div className="md:w-2/5 relative">
                    <PostCover
                      src={featured.cover_image}
                      alt={featured.title}
                      className="w-full h-64 md:h-full"
                    />
                  </div>
                  <div className="md:w-3/5 p-7 md:p-10 flex flex-col justify-center">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-(--joat-gold) uppercase tracking-wider">
                      Featured · {featured.category}
                    </div>
                    <h3 className="mt-3 text-2xl lg:text-4xl font-bold text-foreground leading-tight">
                      {featured.title}
                    </h3>
                    <p className="mt-4 text-muted-foreground leading-relaxed">{featured.excerpt}</p>
                    <div className="mt-5 flex items-center justify-between gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(featured.created_at)}
                        </span>
                        <span>{readingTime(featured.content)} read</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-(--joat-gold) text-(--joat-navy-deep) flex items-center justify-center group-hover:rotate-45 transition-transform">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            )}

            {/* Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {rest.map((p, i) => (
                <motion.button
                  type="button"
                  key={p.id}
                  onClick={() => setActive(p)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (i % 3) * 0.05 }}
                  className="text-left glass rounded-2xl overflow-hidden hover:border-(--joat-gold)/40 transition-all group"
                >
                  <PostCover src={p.cover_image} alt={p.title} className="w-full h-28 sm:h-48" />
                  <div className="p-3 sm:p-6">
                    <div className="text-[10px] sm:text-xs font-semibold text-(--joat-gold) uppercase tracking-wider">
                      {p.category}
                    </div>
                    <h3 className="mt-1.5 sm:mt-3 text-sm sm:text-lg font-bold text-foreground leading-snug line-clamp-2 group-hover:text-(--joat-gold) transition-colors">
                      {p.title}
                    </h3>
                    <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3">
                      {p.excerpt}
                    </p>
                    <div className="mt-2.5 sm:mt-4 flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
                      <span>
                        {formatDate(p.created_at)} · {readingTime(p.content)} read
                      </span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform shrink-0" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Article modal */}
      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="article-title"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
          onClick={() => setActive(null)}
        >
          <motion.article
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl my-12 bg-card text-card-foreground rounded-3xl shadow-2xl overflow-hidden"
          >
            <button
              type="button"
              aria-label="Close article"
              onClick={() => setActive(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-foreground/10 hover:bg-foreground/20 backdrop-blur flex items-center justify-center text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <PostCover
              src={active.cover_image}
              alt={active.title}
              className="w-full h-60 md:h-80"
            />

            <div className="p-7 md:p-10">
              <div className="text-xs font-semibold text-(--joat-gold) uppercase tracking-widest">
                {active.category}
              </div>
              <h1 id="article-title" className="mt-3 text-3xl md:text-4xl font-bold leading-tight">
                {active.title}
              </h1>
              <div className="mt-3 text-xs text-muted-foreground">
                {formatDate(active.created_at)} · {readingTime(active.content)} read
              </div>
              <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed">
                {active.excerpt}
              </p>
              <div
                className="news-content mt-6 text-foreground leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: active.content }}
              />
            </div>
          </motion.article>
        </div>
      )}
    </section>
  );
}
