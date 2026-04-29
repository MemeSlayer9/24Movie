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
  number_of_seasons?: number;
  seasons?: { season_number: number; name: string; episode_count: number }[];
}

interface Episode {
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
}

type EmbedSource = "vidsrc" | "vidjoy";

export default function VideoEmbed() {
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<MovieDetail | null>(null);
  const [activeSource, setActiveSource] = useState<EmbedSource>("vidjoy");

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState({ season: 1, episode: 1 });
  const [episodesLoading, setEpisodesLoading] = useState(false);

  const [iframeUrl, setIframeUrl] = useState("");
  const [iframeUrl2, setIframeUrl2] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?api_key=699be86b7a4ca2c8bc77525cb4938dc0`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data: MovieDetail = await res.json();
        if (!cancelled) {
          setDetail(data);
          // Default to S1E1
          setIframeUrl(`https://vidsrc.xyz/embed/tv?tmdb=${id}&season=1&episode=1`);
          setIframeUrl2(`https://embed.filmu.in/tv/${id}/1/1`);
        }
      } catch (err) {
        console.error("Error fetching detail:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDetail();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    getEpisodes(1);
  }, [id]);

 // ✅ Define BEFORE the useEffect that uses it

const getEpisodes = async (seasonNumber: number) => {
  setEpisodesLoading(true);
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}?api_key=699be86b7a4ca2c8bc77525cb4938dc0`
    );
    const data = await res.json();
    setEpisodes(data.episodes ?? []);
    setSelectedSeason(seasonNumber);
  } catch (error) {
    console.error("Error getting episodes:", error);
  } finally {
    setEpisodesLoading(false);
  }
};

useEffect(() => {
  if (!id) return;
  getEpisodes(1);
}, [id]);

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const seasonNumber = parseInt(e.target.value, 10);
    getEpisodes(seasonNumber);
  };

  const handleEpisodeClick = (seasonNumber: number, episodeNumber: number) => {
    setIframeUrl(`https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${seasonNumber}&episode=${episodeNumber}`);
    setIframeUrl2(`https://embed.filmu.in/tv/${id}/${seasonNumber}/${episodeNumber}`);
    setSelectedEpisode({ season: seasonNumber, episode: episodeNumber });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatRuntime = (min?: number) => {
    if (!min) return null;
    return `${Math.floor(min / 60)}h ${min % 60}m`;
  };

  const formatRating = (r?: number) => (r ? r.toFixed(1) : null);

  const activeSrc = activeSource === "vidjoy" ? iframeUrl2 : iframeUrl;

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

  // Seasons list, excluding season 0 (Specials) if desired
  const seasons = detail?.seasons?.filter((s) => s.season_number > 0) ?? [];

  return (
    <div className="min-h-screen bg-[#080808] text-white">
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

        {/* Now Playing badge */}
        <div className="flex items-center gap-2 text-sm text-amber-400 border border-amber-400/20 bg-amber-400/5 rounded-lg px-4 py-2 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="tracking-wide font-medium">
            Now Playing — Season {selectedEpisode.season}, Episode {selectedEpisode.episode}
          </span>
          {episodes.find((e) => e.episode_number === selectedEpisode.episode) && (
            <span className="text-white/40 font-light">
              · {episodes.find((e) => e.episode_number === selectedEpisode.episode)?.name}
            </span>
          )}
        </div>

        {/* Player */}
        <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8)] bg-black">
          <iframe
            key={`${activeSource}-${selectedEpisode.season}-${selectedEpisode.episode}`}
            src={activeSrc}
            title={`${detail?.original_title ?? "TV Show"} S${selectedEpisode.season}E${selectedEpisode.episode}`}
            className="w-full h-full border-none"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>

        {/* Movie details */}
        {detail && (
          <div className="flex gap-6 mt-2">
            <div className="hidden lg:block flex-shrink-0">
              <img
                src={`https://image.tmdb.org/t/p/w500/${detail.poster_path}`}
                alt={detail.original_title}
                className="w-[160px] h-[240px] object-cover rounded-lg border border-white/10"
              />
            </div>
            <div className="flex-1 space-y-3 pt-1">
              <h1
                className="text-3xl lg:text-4xl font-bold leading-tight"
                style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}
              >
                {detail.original_name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/40 uppercase tracking-widest">
                {detail.release_date && <span>{detail.release_date.slice(0, 4)}</span>}
                {detail.runtime && (
                  <>
                    <span className="text-white/20">·</span>
                    <span>{formatRuntime(detail.runtime)}</span>
                  </>
                )}
                {detail.vote_average ? (
                  <>
                    <span className="text-white/20">·</span>
                    <span className="text-amber-400 font-semibold">★ {formatRating(detail.vote_average)}</span>
                  </>
                ) : null}
              </div>
              {detail.genres && detail.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {detail.genres.map((g) => (
                    <span key={g.id} className="px-2.5 py-0.5 text-xs text-white/60 border border-white/15 rounded-full">
                      {g.name}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-white/60 text-sm leading-relaxed max-w-2xl font-light">{detail.overview}</p>
            </div>
          </div>
        )}

        {/* ── Season & Episode Browser ── */}
        <div className="border-t border-white/10 pt-6 space-y-5">

          {/* Season selector */}
          <div className="flex items-center gap-4">
            <span className="text-white/30 text-xs tracking-widest uppercase">Season</span>
            {seasons.length > 0 ? (
              <select
                value={selectedSeason}
                onChange={handleSeasonChange}
                className="bg-white/[0.05] border border-white/10 text-white text-sm rounded-md px-3 py-1.5 outline-none focus:border-amber-400/50 transition-colors cursor-pointer"
              >
                {seasons.map((s) => (
                  <option key={s.season_number} value={s.season_number} className="bg-[#1a1a1a]">
                    {s.name} ({s.episode_count} eps)
                  </option>
                ))}
              </select>
            ) : (
              // fallback: numeric picker if seasons array not in detail
              <select
                value={selectedSeason}
                onChange={handleSeasonChange}
                className="bg-white/[0.05] border border-white/10 text-white text-sm rounded-md px-3 py-1.5 outline-none focus:border-amber-400/50 transition-colors cursor-pointer"
              >
                {Array.from({ length: detail?.number_of_seasons ?? 1 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n} className="bg-[#1a1a1a]">
                    Season {n}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Episodes grid */}
          {episodesLoading ? (
            <div className="flex items-center gap-3 text-white/30 text-sm py-4">
              <div className="w-4 h-4 border border-white/20 border-t-amber-400 rounded-full animate-spin" />
              Loading episodes…
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {episodes.map((ep) => {
                const isActive =
                  selectedEpisode.season === selectedSeason &&
                  selectedEpisode.episode === ep.episode_number;

                return (
                  <button
                    key={ep.episode_number}
                    onClick={() => handleEpisodeClick(selectedSeason, ep.episode_number)}
                    className={`group relative text-left rounded-lg border overflow-hidden transition-all duration-200 ${
                      isActive
                        ? "border-amber-400/60 bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.1)]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.07]"
                    }`}
                  >
                    {/* Thumbnail */}
                    {ep.still_path ? (
                      <div className="relative w-full aspect-video overflow-hidden">
                        <img
                          src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                          alt={ep.name}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        {isActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center">
                              <span className="text-black text-xs font-bold ml-0.5">▶</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`w-full aspect-video flex items-center justify-center text-2xl ${isActive ? "bg-amber-400/20" : "bg-white/5"}`}>
                        {isActive ? <span className="text-amber-400">▶</span> : <span className="text-white/20">□</span>}
                      </div>
                    )}

                    {/* Episode info */}
                    <div className="p-2.5 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-semibold tracking-wider ${isActive ? "text-amber-400" : "text-white/40"}`}>
                          E{ep.episode_number}
                        </span>
                        {isActive && (
                          <span className="text-[10px] text-amber-400/70 border border-amber-400/30 rounded px-1 py-0.5 leading-none">
                            Playing
                          </span>
                        )}
                      </div>
                      <p className="text-white/80 text-xs font-medium leading-snug line-clamp-1">
                        {ep.name}
                      </p>
                      {ep.air_date && (
                        <p className="text-white/25 text-[10px]">{ep.air_date}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}