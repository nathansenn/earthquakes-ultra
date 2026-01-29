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
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:animate-shake shadow-lg">
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
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600">
                .ph
              </span>
              <span className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">
                Every Tremor. Everywhere.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              href="/earthquakes"
              className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium flex items-center gap-1"
            >
              <span>📊</span>
              <span>All Earthquakes</span>
            </Link>
            <Link
              href="/philippines"
              className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium flex items-center gap-1"
            >
              <span>🇵🇭</span>
              <span>Philippines</span>
            </Link>
            <div className="relative group">
              <button className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium flex items-center gap-1">
                Regions
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <Link href="/region/ncr" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">NCR (Metro Manila)</Link>
                  <Link href="/region/calabarzon" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">CALABARZON</Link>
                  <Link href="/region/central-visayas" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Central Visayas</Link>
                  <Link href="/region/davao-region" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Davao Region</Link>
                  <Link href="/region/western-visayas" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Western Visayas</Link>
                  <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">
                    <Link href="/philippines" className="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800">All Regions →</Link>
                  </div>
                </div>
              </div>
            </div>
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
              <span>🌐</span>
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
              href="/preparedness"
              className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium"
            >
              Safety
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/near-me"
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
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
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col gap-3">
              <Link
                href="/earthquakes"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>📊</span>
                <span>All Earthquakes (M1+)</span>
              </Link>
              <Link
                href="/philippines"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>🇵🇭</span>
                <span>Philippines</span>
              </Link>
              
              <div className="py-2 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Popular Regions</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/region/ncr" className="text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 py-1" onClick={() => setIsMenuOpen(false)}>NCR</Link>
                  <Link href="/region/calabarzon" className="text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 py-1" onClick={() => setIsMenuOpen(false)}>CALABARZON</Link>
                  <Link href="/region/central-visayas" className="text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 py-1" onClick={() => setIsMenuOpen(false)}>Central Visayas</Link>
                  <Link href="/region/davao-region" className="text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 py-1" onClick={() => setIsMenuOpen(false)}>Davao Region</Link>
                </div>
              </div>

              <Link
                href="/map"
                className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Live Map
              </Link>
              <Link
                href="/globe"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>🌐</span>
                <span>3D Globe</span>
              </Link>
              <Link
                href="/volcanoes"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>🌋</span>
                <span>Volcanoes</span>
              </Link>
              <Link
                href="/preparedness"
                className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Safety & Preparedness
              </Link>

              <Link
                href="/near-me"
                className="mt-2 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white rounded-lg font-medium transition-all text-center flex items-center justify-center gap-2"
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
