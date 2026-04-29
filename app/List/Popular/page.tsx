'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  original_language: string;
  adult: boolean;
  video: boolean;
}

const TMDB_API_KEY = '699be86b7a4ca2c8bc77525cb4938dc0';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';

export default function MovieGrid() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [pageInput, setPageInput] = useState('1');

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${currentPage}&api_key=${TMDB_API_KEY}`
        );
        const data = await res.json();
        setMovies(data.results || []);
        setTotalPages(data.total_pages || 1);
        setHasNextPage(currentPage < (data.total_pages || 1));
      } catch (err) {
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      setPageInput(newPage.toString());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      setPageInput(newPage.toString());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPageInput(value);
    const pageNumber = parseInt(value);
    if (!isNaN(pageNumber) && pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
  };

  const handlePageInputBlur = () => {
    if (!pageInput || isNaN(parseInt(pageInput)) || parseInt(pageInput) <= 0) {
      setPageInput(currentPage.toString());
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#151929]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-yellow-400 mb-4" />
          <div className="text-white text-base font-semibold tracking-wide">Loading Movies...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151929] px-3 py-5 md:px-6 md:py-7">
      <div className="max-w-screen-2xl mx-auto">

        {/* Header */}
        <div className="mb-4">
          <h1 className="text-white text-xl md:text-2xl font-bold tracking-wide">
            Popular Movies
          </h1>
        </div>

        {/* Grid — 8 columns desktop, scales down */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
          {movies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => router.push(`/watch/movie/${movie.id}`)}
              className="group cursor-pointer flex flex-col"
            >
              {/* Poster wrapper */}
              <div className="relative w-full rounded-md overflow-hidden bg-[#1e2538]" style={{ paddingBottom: '148%' }}>
                <img
                  src={
                    movie.poster_path
                      ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
                      : 'https://via.placeholder.com/342x513?text=No+Image'
                  }
                  alt={movie.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* HD Badge */}
                <div className="absolute top-1.5 right-1.5 bg-yellow-400 text-black text-[9px] font-extrabold px-1 py-0.5 rounded-sm leading-none tracking-wider z-10">
                  HD
                </div>

                {/* Hover play overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2.5">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Title below poster */}
              <p className="mt-1.5 text-white text-[11px] font-semibold leading-tight line-clamp-2 text-center px-0.5 group-hover:text-yellow-400 transition-colors duration-200">
                {movie.title}
              </p>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 mt-10 mb-6">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            style={{ backgroundColor: '#facc15', color: '#000', opacity: currentPage === 1 ? 0.4 : 1 }}
            className="disabled:cursor-not-allowed px-6 py-2.5 rounded-lg font-extrabold text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.3)' }} className="flex items-center px-4 py-2.5 rounded-lg gap-2">
            <span style={{ color: '#fff' }} className="text-sm font-medium">Page</span>
            <input
              type="text"
              value={pageInput}
              onChange={handlePageInputChange}
              onKeyDown={handlePageInputSubmit}
              onBlur={handlePageInputBlur}
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
              className="text-sm font-bold text-center rounded px-2 py-0.5 w-12 focus:outline-none"
            />
            <span style={{ color: 'rgba(255,255,255,0.6)' }} className="text-sm">/ {totalPages}</span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={!hasNextPage}
            style={{ backgroundColor: '#facc15', color: '#000', opacity: !hasNextPage ? 0.4 : 1 }}
            className="disabled:cursor-not-allowed px-6 py-2.5 rounded-lg font-extrabold text-sm flex items-center gap-2"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}