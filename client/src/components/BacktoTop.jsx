import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    const scrolled = document.documentElement.scrollTop;
    setIsVisible(scrolled > 200);
  };

  // Set the scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50",
        "w-12 h-12 sm:w-14 sm:h-14",
        "rounded-full",
        "bg-zinc-900 dark:bg-zinc-100",
        "text-white dark:text-zinc-900",
        "shadow-lg hover:shadow-xl",
        "border border-zinc-800 dark:border-zinc-200",
        "flex items-center justify-center",
        "transition-all duration-300",
        "hover:scale-110 active:scale-95",
        "animate-in fade-in zoom-in duration-300"
      )}
      aria-label="Back to top"
    >
      <ArrowUp className="w-6 h-6" />
    </button>
  );
};

export default BackToTop;