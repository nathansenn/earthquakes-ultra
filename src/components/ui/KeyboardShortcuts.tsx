"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Show help: ?
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowHelp(true);
        return;
      }

      // Close modals: Escape
      if (e.key === "Escape") {
        setShowHelp(false);
        return;
      }

      // Navigation shortcuts (without modifiers)
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case "g":
            // Go to... (press g then another key)
            break;
          case "h":
            router.push("/");
            break;
          case "e":
            router.push("/earthquakes");
            break;
          case "m":
            router.push("/map");
            break;
          case "3":
            router.push("/globe");
            break;
          case "v":
            router.push("/volcanoes");
            break;
          case "s":
            router.push("/preparedness");
            break;
          case "n":
            router.push("/near-me");
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  if (!showHelp) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowHelp(false)} />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-lg w-full p-6">
        <button
          onClick={() => setShowHelp(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
          Keyboard Shortcuts
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Navigation</h3>
            <div className="space-y-2">
              <ShortcutRow keys={["H"]} action="Go to Home" />
              <ShortcutRow keys={["E"]} action="All Earthquakes" />
              <ShortcutRow keys={["M"]} action="Live Map" />
              <ShortcutRow keys={["3"]} action="3D Globe" />
              <ShortcutRow keys={["V"]} action="Volcanoes" />
              <ShortcutRow keys={["S"]} action="Safety Guide" />
              <ShortcutRow keys={["N"]} action="Near Me" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Actions</h3>
            <div className="space-y-2">
              <ShortcutRow keys={["⌘", "K"]} action="Search" />
              <ShortcutRow keys={["?"]} action="Show shortcuts" />
              <ShortcutRow keys={["Esc"]} action="Close modal" />
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">?</kbd> anytime to show this help
        </p>
      </div>
    </div>
  );
}

function ShortcutRow({ keys, action }: { keys: string[]; action: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700 dark:text-gray-300">{action}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <span key={i}>
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-600 dark:text-gray-400 min-w-[24px] text-center inline-block">
              {key}
            </kbd>
            {i < keys.length - 1 && <span className="text-gray-400 mx-0.5">+</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
