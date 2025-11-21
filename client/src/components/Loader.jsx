const SportsBuddyLoader = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 transition-colors duration-300 bg-white dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-8">
        {/* Spinner Ring */}
        <div className="relative w-16 h-16">
          {/* Outer Ring */}
          <div className="absolute inset-0 border-4 rounded-full border-zinc-200 dark:border-zinc-800" />
          
          {/* Spinning Accent Ring */}
          <div className="absolute inset-0 border-4 border-transparent rounded-full border-t-blue-600 dark:border-t-blue-500 animate-spin" />
          
          {/* Inner Circle */}
          <div className="absolute inset-2 rounded-full bg-blue-600 dark:bg-blue-500 animate-pulse" />
        </div>

        {/* Brand Name */}
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-2xl font-semibold mb-2 text-zinc-900 dark:text-white">
            SportsBuddy
          </h1>
          
          {/* Loading Message */}
          <div className="flex items-center gap-2 justify-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {message}
            </p>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-[200px] rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
          <div className="h-full rounded-full bg-blue-600 dark:bg-blue-500 animate-[shimmer_1.5s_infinite] w-full origin-left-right" />
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default SportsBuddyLoader;