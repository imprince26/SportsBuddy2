import { useState, useEffect } from 'react';

/**
 * A custom hook that debounces a value for a specified delay.
 * 
 * @param {any} value - The value to be debounced
 * @param {number} delay - The delay in milliseconds
 * @returns {any} - The debounced value
 * 
 * @example
 * const searchTerm = "sports";
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 */
const useDebounce = (value, delay = 500) => {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Create a timer that will update the debounced value after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer when the value changes or the component unmounts
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]); // Only re-run the effect if value or delay changes

  return debouncedValue;
};

export default useDebounce;