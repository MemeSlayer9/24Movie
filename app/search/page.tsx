"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";  // ← changed
import Link from "next/link";

const TMDB_API_KEY = "699be86b7a4ca2c8bc77525cb4938dc0";
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

interface MediaItem {
  id: number;
  type: "tv" | "movie";
  poster_path: string | null;
  name?: string;
  title?: string;
  popularity?: number;
  vote_average?: number;
  first_air_date?: string;
  release_date?: string;
}

const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="w-[160px] h-[235px] bg-gray-800 rounded-lg" />
    <div className="h-3 bg-gray-800 rounded mt-2 mx-2" />
    <div className="h-3 bg-gray-800 rounded mt-1 mx-6" />
  </div>
);

function SearchResultsInner() {
  const searchParams = useSearchParams();              // ← changed
  const query = searchParams.get("q") ?? "";          // ← reads ?q=batman

  const [page, setPage] = useState<number>(1);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!query.trim()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const p = new URLSearchParams({
        api_key: TMDB_API_KEY,
        query: query.trim(),
        page: String(page),
      });

      const [tvRes, movieRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/search/tv?${p}`),
        fetch(`https://api.themoviedb.org/3/search/movie?${p}`),
      ]);

      const [tvData, movieData] = await Promise.all([
        tvRes.json(),
        movieRes.json(),
      ]);

      const tvResults: MediaItem[] = (tvData.results ?? []).map((item: any) => ({
        ...item,
        type: "tv" as const,
      }));

      const movieResults: MediaItem[] = (movieData.results ?? []).map((item: any) => ({
        ...item,
        type: "movie" as const,
      }));

      const combined = [...tvResults, ...movieResults].sort(
        (a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)
      );

      setResults(combined);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch results. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset page when query changes
  useEffect(() => {
    setPage(1);
  }, [query]);

  // Fetch when query or page changes
  useEffect(() => {
    fetchData();
  }, [query, page]);

  return (
    <div style={{ backgroundColor: "#0a0a0a", minHeight: "100vh" }}>
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-semibold text-white mb-6">
          <span className="font-bold text-red-500">Search</span> Results
          {query && (
            <span className="text-gray-400 text-lg font-normal ml-2">
              for &quot;{query}&quot;
            </span>
          )}
        </h1>

        {error && (
          <div className="flex flex-col items-center justify-center py-12 text-red-400">
            <p className="text-lg">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 px-6 py-2 border border-red-500 rounded-lg hover:bg-red-500/20 transition-colors text-white"
            >
              Retry
            </button>
          </div>
        )}

        {!error && (
          <>
            {loading ? (
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, 160px)" }}>
                {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                <svg className="w-16 h-16 mb-4 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <p className="text-lg">No results found for &quot;{query}&quot;</p>
              </div>
            ) : (
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, 160px)" }}>
                {results.map((item) => {
                  const title = item.name ?? item.title ?? "Unknown";
                  const year = (item.first_air_date ?? item.release_date ?? "").slice(0, 4);
                  const poster = item.poster_path
                    ? `${TMDB_IMG}${item.poster_path}`
                    : "/placeholder.png";

                  return (
                    <Link
                      key={`${item.type}-${item.id}`}
                      href={item.type === "tv" ? `/watch/series/${item.id}` : `/watch/movie/${item.id}`}
                      className="group block rounded-lg overflow-hidden transition-transform duration-200 hover:scale-105"
                    >
                      <div className="relative">
                        <img
                          src={poster}
                          alt={title}
                          className="w-[160px] h-[235px] object-cover rounded-lg"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
                          }}
                        />
                        <span className={`absolute top-2 left-2 text-white text-[10px] font-semibold px-2 py-0.5 rounded ${item.type === "tv" ? "bg-blue-600/90" : "bg-red-600/90"}`}>
                          {item.type === "tv" ? "TV" : "Movie"}
                        </span>
                        {item.vote_average && item.vote_average > 0 && (
                          <span className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                            ★ {item.vote_average.toFixed(1)}
                          </span>
                        )}
                        <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                      </div>
                      <p className="text-gray-300 text-sm text-center mt-2 px-1 truncate group-hover:text-white transition-colors">
                        {title}
                      </p>
                      {year && <p className="text-gray-500 text-xs text-center">{year}</p>}
                    </Link>
                  );
                })}
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="flex items-center justify-center gap-4 mt-10 mb-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-2 text-white border-2 border-gray-700 rounded-lg hover:border-red-500 hover:text-red-400 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-white font-semibold bg-gray-800 px-4 py-2 rounded-lg min-w-[3rem] text-center">
                  {page}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-6 py-2 text-white border-2 border-gray-700 rounded-lg hover:border-red-500 hover:text-red-400 transition-all duration-200"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// useSearchParams requires Suspense in Next.js App Router
export default function SearchResults() {
  return (
    <Suspense fallback={
      <div style={{ backgroundColor: "#0a0a0a", minHeight: "100vh" }} className="flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    }>
      <SearchResultsInner />
    </Suspense>
  );
}