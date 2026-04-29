"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Movie {
  id: number;
  title?: string;
  original_name?: string;
  poster_path: string;
  media_type: "movie" | "tv";
}

interface TMDBResponse {
  results: Movie[];
  total_pages: number;
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function AnimeCardsSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="w-full aspect-[2/3] rounded-lg bg-white/10 animate-pulse" />
          <div className="w-3/4 h-4 rounded bg-white/10 animate-pulse mx-auto" />
        </div>
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AnimeCards() {
  const router = useRouter();
  const [anime, setAnime] = useState<TMDBResponse>({ results: [], total_pages: 1 });
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    const getAnime = async (): Promise<void> => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://api.themoviedb.org/3/trending/movie/day?api_key=699be86b7a4ca2c8bc77525cb4938dc0&page=${page}`
        );
        const data: TMDBResponse = await res.json();
        setAnime(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getAnime();
  }, [page]);

  return (
    <div>
      <h1 className="text-white text-xl font-semibold mb-4">Recent Movies</h1>

      {loading ? (
        <AnimeCardsSkeleton />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
          {anime.results.map((item: Movie) => (
            <div
              key={item.id}
              onClick={() =>
                router.push(
                  item.media_type === "tv"
                    ? `/watch/series/${item.id}`
                    : `/watch/movie/${item.id}`
                )
              }
              className="group cursor-pointer"
            >
              {/* Poster */}
              <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden ring-0 group-hover:ring-2 group-hover:ring-white/40 transition-all duration-300">
                <Image
                  src={`https://image.tmdb.org/t/p/w500/${item.poster_path}`}
                  alt={item.title ?? item.original_name ?? "Poster"}
                  fill
                  sizes="(max-width: 400px) 50vw, (max-width: 768px) 33vw, 160px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Title */}
              <p className="mt-2 text-white text-center text-sm font-normal leading-snug line-clamp-2">
                {item.title ?? item.original_name}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      <div className="flex items-center justify-center gap-3 mt-8">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          ← Prev
        </button>

        <span className="text-white/60 text-sm">
          Page <span className="text-white font-semibold">{page}</span> of{" "}
          <span className="text-white font-semibold">{anime.total_pages}</span>
        </span>

        <button
          onClick={() => setPage((p) => Math.min(anime.total_pages, p + 1))}
          disabled={page === anime.total_pages}
          className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          Next →
        </button>
      </div>
    </div>
  );
}