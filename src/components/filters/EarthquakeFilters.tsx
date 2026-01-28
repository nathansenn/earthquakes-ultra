'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface FilterState {
  minMagnitude: number;
  maxMagnitude: number;
  minDepth: number;
  maxDepth: number;
  dateRange: string;
  felt: boolean;
  tsunami: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const defaultFilters: FilterState = {
  minMagnitude: 2.5,
  maxMagnitude: 10,
  minDepth: 0,
  maxDepth: 700,
  dateRange: '7d',
  felt: false,
  tsunami: false,
  sortBy: 'time',
  sortOrder: 'desc',
};

export default function EarthquakeFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>(() => ({
    minMagnitude: Number(searchParams.get('minMag')) || defaultFilters.minMagnitude,
    maxMagnitude: Number(searchParams.get('maxMag')) || defaultFilters.maxMagnitude,
    minDepth: Number(searchParams.get('minDepth')) || defaultFilters.minDepth,
    maxDepth: Number(searchParams.get('maxDepth')) || defaultFilters.maxDepth,
    dateRange: searchParams.get('range') || defaultFilters.dateRange,
    felt: searchParams.get('felt') === 'true',
    tsunami: searchParams.get('tsunami') === 'true',
    sortBy: searchParams.get('sortBy') || defaultFilters.sortBy,
    sortOrder: (searchParams.get('order') as 'asc' | 'desc') || defaultFilters.sortOrder,
  }));

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.minMagnitude !== defaultFilters.minMagnitude) params.set('minMag', filters.minMagnitude.toString());
    if (filters.maxMagnitude !== defaultFilters.maxMagnitude) params.set('maxMag', filters.maxMagnitude.toString());
    if (filters.minDepth !== defaultFilters.minDepth) params.set('minDepth', filters.minDepth.toString());
    if (filters.maxDepth !== defaultFilters.maxDepth) params.set('maxDepth', filters.maxDepth.toString());
    if (filters.dateRange !== defaultFilters.dateRange) params.set('range', filters.dateRange);
    if (filters.felt) params.set('felt', 'true');
    if (filters.tsunami) params.set('tsunami', 'true');
    if (filters.sortBy !== defaultFilters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder !== defaultFilters.sortOrder) params.set('order', filters.sortOrder);
    
    router.push(`?${params.toString()}`);
  }, [filters, router]);

  const resetFilters = () => {
    setFilters(defaultFilters);
    router.push('');
  };

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Quick Filters Bar */}
      <div className="p-4 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Filters:</span>
        
        {/* Magnitude Quick Select */}
        <div className="flex gap-1">
          {[2.5, 4, 5, 6, 7].map(mag => (
            <button
              key={mag}
              onClick={() => {
                updateFilter('minMagnitude', mag);
                setTimeout(applyFilters, 0);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filters.minMagnitude === mag
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30'
              }`}
            >
              M{mag}+
            </button>
          ))}
        </div>

        {/* Date Range Quick Select */}
        <div className="flex gap-1 ml-2">
          {[
            { label: '24h', value: '1d' },
            { label: '7 Days', value: '7d' },
            { label: '30 Days', value: '30d' },
          ].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => {
                updateFilter('dateRange', value);
                setTimeout(applyFilters, 0);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filters.dateRange === value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1"></div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-2"
        >
          <svg 
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Advanced Filters
        </button>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Magnitude Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Magnitude Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.minMagnitude}
                  onChange={e => updateFilter('minMagnitude', Number(e.target.value))}
                  className="w-20 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.maxMagnitude}
                  onChange={e => updateFilter('maxMagnitude', Number(e.target.value))}
                  className="w-20 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                />
              </div>
            </div>

            {/* Depth Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Depth (km)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="700"
                  value={filters.minDepth}
                  onChange={e => updateFilter('minDepth', Number(e.target.value))}
                  className="w-20 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="number"
                  min="0"
                  max="700"
                  value={filters.maxDepth}
                  onChange={e => updateFilter('maxDepth', Number(e.target.value))}
                  className="w-20 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <div className="flex gap-2">
                <select
                  value={filters.sortBy}
                  onChange={e => updateFilter('sortBy', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="time">Time</option>
                  <option value="magnitude">Magnitude</option>
                  <option value="depth">Depth</option>
                </select>
                <button
                  onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                  title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {filters.sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            {/* Special Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Special Filters
              </label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.felt}
                    onChange={e => updateFilter('felt', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Felt reports only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.tsunami}
                    onChange={e => updateFilter('tsunami', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Tsunami potential</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Reset All
            </button>
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
