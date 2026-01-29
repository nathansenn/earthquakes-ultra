"use client";

import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center group-hover:animate-shake">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Lindol
              </span>
              <span className="text-xl font-bold text-red-600">.ph</span>
              <span className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">
                Philippine Earthquake Tracker
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/earthquakes"
              className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium"
            >
              Recent Earthquakes
            </Link>
            <Link
              href="/philippines"
              className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium"
            >
              By Location
            </Link>
            <Link
              href="/map"
              className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium"
            >
              Live Map
            </Link>
            <Link
              href="/globe"
              className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium flex items-center gap-1"
            >
              <span>🌍</span>
              <span>3D Globe</span>
            </Link>
            <Link
              href="/volcanoes"
              className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium flex items-center gap-1"
            >
              <span>🌋</span>
              <span>Volcanoes</span>
            </Link>
            <Link
              href="/alerts"
              className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium"
            >
              Alerts
            </Link>
            <Link
              href="/preparedness"
              className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium"
            >
              Preparedness
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/near-me"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Near Me
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col gap-4">
              <Link
                href="/earthquakes"
                className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Recent Earthquakes
              </Link>
              <Link
                href="/philippines"
                className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                By Location
              </Link>
              <Link
                href="/map"
                className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Live Map
              </Link>
              <Link
                href="/globe"
                className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium flex items-center gap-1"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>🌍</span>
                <span>3D Globe</span>
              </Link>
              <Link
                href="/volcanoes"
                className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium flex items-center gap-1"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>🌋</span>
                <span>Volcanoes</span>
              </Link>
              <Link
                href="/alerts"
                className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Alerts
              </Link>
              <Link
                href="/preparedness"
                className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Preparedness
              </Link>
              <Link
                href="/near-me"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-center flex items-center justify-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Earthquakes Near Me
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
