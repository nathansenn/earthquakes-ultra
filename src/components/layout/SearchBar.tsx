"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { philippineCities } from "@/data/philippine-cities";
import { seismicCountries } from "@/data/countries";
import { PHILIPPINE_VOLCANOES } from "@/data/philippine-volcanoes";

interface SearchResult {
  type: "city" | "country" | "volcano";
  name: string;
  slug: string;
  subtitle?: string;
}

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const close = () => {
    setIsOpen(false);
    setQuery("");
  };

  // Reset the highlighted row whenever the result set changes.
  useEffect(() => {
    setActiveIndex(0);
  }, [results]);

  // Arrow-key navigation + Enter to open the highlighted result.
  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      const target = results[activeIndex];
      if (target) {
        e.preventDefault();
        close();
        router.push(target.slug);
      }
    }
  };

  // Keyboard shortcut to open search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const matches: SearchResult[] = [];

    // Search cities
    philippineCities.slice(0, 50).forEach((city) => {
      if (city.name.toLowerCase().includes(q) || city.province.toLowerCase().includes(q)) {
        matches.push({
          type: "city",
          name: city.name,
          slug: `/philippines/${city.slug}`,
          subtitle: `${city.province}, Philippines`,
        });
      }
    });

    // Search countries
    seismicCountries.forEach((country) => {
      if (country.name.toLowerCase().includes(q)) {
        matches.push({
          type: "country",
          name: country.name,
          slug: `/country/${country.slug}`,
          subtitle: `${country.riskLevel.toUpperCase()} risk`,
        });
      }
    });

    // Search volcanoes
    PHILIPPINE_VOLCANOES.forEach((volcano) => {
      if (volcano.name.toLowerCase().includes(q) || volcano.province.toLowerCase().includes(q)) {
        matches.push({
          type: "volcano",
          name: volcano.name,
          slug: `/volcanoes/${volcano.name.toLowerCase().replace(/\s+/g, "-")}`,
          subtitle: `${volcano.province}, ${volcano.status}`,
        });
      }
    });

    setResults(matches.slice(0, 10));
  }, [query]);

  const getIcon = (type: string) => {
    switch (type) {
      case "city": return "🏙️";
      case "country": return "🌍";
      case "volcano": return "🌋";
      default: return "📍";
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">⌘K</kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          {/* Search Panel */}
          <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Input */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Search cities, countries, volcanoes..."
                className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
                autoComplete="off"
                role="combobox"
                aria-expanded={results.length > 0}
                aria-controls="search-results"
                aria-autocomplete="list"
              />
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-500">ESC</kbd>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div id="search-results" role="listbox" className="max-h-80 overflow-y-auto p-2">
                {results.map((result, index) => (
                  <Link
                    key={`${result.type}-${result.slug}-${index}`}
                    href={result.slug}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={close}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      index === activeIndex ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className="text-xl">{getIcon(result.type)}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{result.name}</p>
                      {result.subtitle && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{result.subtitle}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 capitalize">{result.type}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* No Results */}
            {query && results.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <p>No results found for &ldquo;{query}&rdquo;</p>
              </div>
            )}

            {/* Scope disclosure */}
            <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 dark:text-gray-500 flex items-center justify-between gap-2">
              <span>Searches Philippine cities &amp; volcanoes and major seismic countries.</span>
              {results.length > 0 && <span className="hidden sm:inline">↑↓ to navigate · ↵ to open</span>}
            </div>

            {/* Empty State */}
            {!query && (
              <div className="p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Quick Links</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/philippines" onClick={() => setIsOpen(false)} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-lg">🇵🇭</span>
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Philippines</span>
                  </Link>
                  <Link href="/country/japan" onClick={() => setIsOpen(false)} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-lg">🇯🇵</span>
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Japan</span>
                  </Link>
                  <Link href="/volcanoes" onClick={() => setIsOpen(false)} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-lg">🌋</span>
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Volcanoes</span>
                  </Link>
                  <Link href="/preparedness" onClick={() => setIsOpen(false)} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-lg">🛡️</span>
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Safety Guide</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
