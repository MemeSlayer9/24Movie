"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
const TMDB_API_KEY = "699be86b7a4ca2c8bc77525cb4938dc0";

interface TMDBItem {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  media_type: "movie" | "tv" | "person";
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
}

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 53: "Thriller",
  10770: "TV Movie", 10752: "War", 37: "Western",
  10759: "Action & Adventure", 10762: "Kids", 10763: "News",
  10764: "Reality", 10765: "Sci-Fi & Fantasy", 10766: "Soap",
  10767: "Talk", 10768: "War & Politics",
};

function Carousel() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [items, setItems] = useState<TMDBItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchTrending() {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_API_KEY}`
        );
        const results: TMDBItem[] = (response.data.results as TMDBItem[]).filter(
          (item) => item.media_type !== "person" && item.backdrop_path
        );
        setItems(results.slice(0, 10));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchTrending();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || items.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, items.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setIsAutoPlaying(false);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setIsAutoPlaying(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > 50) distance > 0 ? goToNext() : goToPrev();
    setIsSwiping(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (width > 768) return;
    setTouchStart(e.clientX);
    setTouchEnd(e.clientX);
    setIsSwiping(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSwiping) return;
    setTouchEnd(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isSwiping) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > 50) distance > 0 ? goToNext() : goToPrev();
    setIsSwiping(false);
  };

  if (loading) {
    return (
      <div className="relative w-full h-[600px] bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-lg">Loading trending titles...</p>
        </div>
      </div>
    );
  }

  if (error || items.length === 0) {
    return (
      <div className="relative w-full h-[600px] bg-black flex items-center justify-center">
        <div className="text-red-500 text-xl">{error || "No data available"}</div>
      </div>
    );
  }

  const isMobile = width <= 768;
  const current = items[currentIndex];
  const title = current.title || current.name || current.original_title || current.original_name || "Unknown";
  const releaseYear = (current.release_date || current.first_air_date || "").slice(0, 4);
  const genres = current.genre_ids
    .slice(0, 4)
    .map((id) => GENRE_MAP[id])
    .filter(Boolean);

  return (
    <div
      ref={carouselRef}
      className="relative w-full overflow-hidden select-none"
      style={{ height: isMobile ? "500px" : "700px" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsSwiping(false)}
    >
      {/* Background Images */}
      {items.map((item, index) => {
        const bg = isMobile
          ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}`
          : `${TMDB_IMAGE_BASE}/original${item.backdrop_path}`;
        const fallback = isMobile
          ? `${TMDB_IMAGE_BASE}/original${item.backdrop_path}`
          : `${TMDB_IMAGE_BASE}/w500${item.poster_path}`;

        return (
          <div
            key={item.id}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{
              opacity: index === currentIndex ? 1 : 0,
              pointerEvents: index === currentIndex ? "auto" : "none",
            }}
          >
            <img
              src={bg}
              alt={item.title || item.name || ""}
              className="w-full h-full object-cover"
              draggable="false"
              onError={(e) => {
                if (fallback && e.currentTarget.src !== fallback) {
                  e.currentTarget.src = fallback;
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
          </div>
        );
      })}

      {/* Content */}
      <div className="relative h-full flex items-end pb-20 md:pb-32 pointer-events-none">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="max-w-3xl space-y-4 md:space-y-6">
            <h1
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight"
              style={{ textShadow: "2px 2px 20px rgba(0,0,0,0.8)" }}
            >
              {title}
            </h1>

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
              {current.vote_average > 0 && (
                <div className="flex items-center gap-1 bg-yellow-500/90 text-black px-2 py-0.5 rounded-full font-semibold">
                  <StarIcon />
                  <span>{current.vote_average.toFixed(1)}</span>
                </div>
              )}
              <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full font-medium uppercase">
                {current.media_type}
              </span>
              {releaseYear && (
                <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full font-medium">
                  {releaseYear}
                </span>
              )}
            </div>

            {/* Genres — desktop only */}
            {!isMobile && genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {genres.map((genre, idx) => (
                  <span
                    key={idx}
                    className="text-xs text-white/80 border border-white/30 px-2 py-0.5 rounded-full backdrop-blur-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Overview — desktop only */}
            {!isMobile && (
              <p className="text-sm md:text-base text-gray-200 leading-relaxed line-clamp-2 max-w-2xl">
                {current.overview || "No description available."}
              </p>
            )}

            {/* CTA */}
            <div className="flex flex-wrap gap-4 pt-4 pointer-events-auto">
              <button
                onClick={() =>
                  router.push(
                    current.media_type === "tv"
                      ? `/watch/series/${current.id}`
                      : `/watch/movie/${current.id}`
                  )
                }
                className="group flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-red-500/50"
              >
                <span className="group-hover:translate-x-1 transition-transform inline-block">
                  <PlayIcon />
                </span>
                Watch Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nav arrows — desktop only */}
      {!isMobile && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-10"
            aria-label="Next slide"
          >
            <ChevronRightIcon />
          </button>
        </>
      )}

      {/* Pagination dots — desktop only */}
      {!isMobile && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsAutoPlaying(false);
              }}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? "bg-red-600 w-8 h-2"
                  : "bg-white/40 hover:bg-white/60 w-2 h-2"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Carousel;