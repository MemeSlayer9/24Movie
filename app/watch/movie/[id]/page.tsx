"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface MovieDetail {
  original_title: string;
  overview: string;
  release_date: string;
  poster_path: string;
  original_name?: string;
  runtime?: number;
  vote_average?: number;
  genres?: { id: number; name: string }[];
}

type EmbedSource = "vidsrc" | "vidjoy";

export default function VideoEmbed() {
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<MovieDetail | null>(null);
  const [activeSource, setActiveSource] = useState<EmbedSource>("vidjoy");

  const embedUrl = `https://vidsrc.xyz/embed/movie?tmdb=${id}`;
  const embedUrl2 = `https://embed.filmu.in/movie/${id}`;

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=699be86b7a4ca2c8bc77525cb4938dc0`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data: MovieDetail = await res.json();
        if (!cancelled) setDetail(data);
      } catch (err) {
        console.error("Error fetching movie:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDetail();
    return () => { cancelled = true; };
  }, [id]);

  const formatRuntime = (min?: number) => {
    if (!min) return null;
    return `${Math.floor(min / 60)}h ${min % 60}m`;
  };

  const formatRating = (r?: number) => r ? r.toFixed(1) : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/10 border-t-amber-400 rounded-full animate-spin" />
          <p className="text-white/40 text-sm font-light tracking-widest uppercase">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white">

      {/* Hero backdrop blur (poster as background) */}
      {detail?.poster_path && (
        <div
          className="fixed inset-0 opacity-[0.06] bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/w1280/${detail.poster_path})`,
            filter: "blur(60px) saturate(1.5)",
          }}
        />
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-6">

        {/* Source switcher */}
        <div className="flex items-center gap-3">
          <span className="text-white/30 text-xs tracking-widest uppercase">Source</span>
          <div className="flex bg-white/[0.05] border border-white/10 rounded-md overflow-hidden">
            {(["vidjoy", "vidsrc"] as EmbedSource[]).map((src) => (
              <button
                key={src}
                onClick={() => setActiveSource(src)}
                className={`px-4 py-1.5 text-xs tracking-widest uppercase transition-all duration-200 ${
                  activeSource === src
                    ? "bg-amber-400 text-black font-semibold"
                    : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                {src === "vidjoy" ? "Vidjoy" : "Vidsrc"}
              </button>
            ))}
          </div>
        </div>

        {/* Player */}
        <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8)] bg-black">
          <iframe
            key={activeSource}
            src={activeSource === "vidjoy" ? embedUrl2 : embedUrl}
            title={`${detail?.original_title ?? "Movie"} — ${activeSource}`}
            className="w-full h-full border-none"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>

        {/* Movie details */}
        {detail && (
          <div className="flex gap-6 mt-2">
            {/* Poster */}
            <div className="hidden lg:block flex-shrink-0">
              <img
                src={`https://image.tmdb.org/t/p/w500/${detail.poster_path}`}
                alt={detail.original_title}
                className="w-[160px] h-[240px] object-cover rounded-lg border border-white/10"
              />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3 pt-1">
              {/* Title */}
              <h1
                className="text-3xl lg:text-4xl font-bold leading-tight"
                style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}
              >
                {detail.original_title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/40 uppercase tracking-widest">
                {detail.release_date && (
                  <span>{detail.release_date.slice(0, 4)}</span>
                )}
                {detail.runtime && (
                  <>
                    <span className="text-white/20">·</span>
                    <span>{formatRuntime(detail.runtime)}</span>
                  </>
                )}
                {detail.vote_average ? (
                  <>
                    <span className="text-white/20">·</span>
                    <span className="text-amber-400 font-semibold">
                      ★ {formatRating(detail.vote_average)}
                    </span>
                  </>
                ) : null}
              </div>

              {/* Genres */}
              {detail.genres && detail.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {detail.genres.map((g) => (
                    <span
                      key={g.id}
                      className="px-2.5 py-0.5 text-xs text-white/60 border border-white/15 rounded-full"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              <p className="text-white/60 text-sm leading-relaxed max-w-2xl font-light">
                {detail.overview}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}