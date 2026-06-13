"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error for debugging/monitoring.
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <p className="text-6xl mb-4" aria-hidden>⚠️</p>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Something went wrong</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          An unexpected error occurred while loading this page. The earthquake data feeds can be briefly
          unavailable — trying again often fixes it.
        </p>
        {error?.digest && (
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 font-mono">Ref: {error.digest}</p>
        )}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
