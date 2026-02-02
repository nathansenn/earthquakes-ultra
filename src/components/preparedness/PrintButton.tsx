"use client";

export function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm transition-colors print:hidden"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
      Print Guide
    </button>
  );
}

export function StickyNav() {
  return (
    <div className="sticky top-16 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 py-2 print:hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
          <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">Jump to:</span>
          <a href="#drop-cover-hold" className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-medium whitespace-nowrap hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
            🛡️ Drop-Cover-Hold
          </a>
          <a href="#emergency-kit" className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium whitespace-nowrap hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors">
            🎒 Emergency Kit
          </a>
          <a href="#during" className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium whitespace-nowrap hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors">
            ⚠️ During
          </a>
          <a href="#after" className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium whitespace-nowrap hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
            ✅ After
          </a>
          <a href="#tsunami" className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full text-xs font-medium whitespace-nowrap hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors">
            🌊 Tsunami
          </a>
        </div>
      </div>
    </div>
  );
}
