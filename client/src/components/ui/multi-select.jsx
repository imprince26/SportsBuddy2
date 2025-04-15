import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const MultiSelect = ({ options = [], value = [], onChange, maxSelected = 3, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const toggleSelect = (item) => {
    if (disabled) return;

    if (value.includes(item)) {
      onChange(value.filter((v) => v !== item));
    } else if (value.length < maxSelected) {
      onChange([...value, item]);
    }
  };

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <div
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          'w-full p-2 border border-border-light dark:border-border-dark rounded-lg bg-muted-light/30 dark:bg-muted-dark/30 cursor-pointer text-foreground-light dark:text-foreground-dark flex items-center justify-between',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="flex flex-wrap gap-1 text-sm">
          {value.length > 0 ? (
            value.map((item) => (
              <span
                key={item}
                className="bg-primary-light/20 dark:bg-primary-dark/20 px-2 py-1 rounded-full"
              >
                {item}
              </span>
            ))
          ) : (
            <span className="text-muted-foreground">Select sports</span>
          )}
        </div>
        <ChevronDown className="w-4 h-4" />
      </div>

      {open && !disabled && (
        <div className="absolute z-50 mt-2 w-full max-h-60 overflow-y-auto rounded-md border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full px-3 py-2 border-b border-border-light dark:border-border-dark bg-muted-light/20 dark:bg-muted-dark/20 text-foreground-light dark:text-foreground-dark focus:outline-none"
          />
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
              const isSelected = value.includes(opt);
              const isMaxed = !isSelected && value.length >= maxSelected;

              return (
                <div
                  key={opt}
                  onClick={() => !isMaxed && toggleSelect(opt)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 hover:bg-muted-light/30 dark:hover:bg-muted-dark/30 cursor-pointer',
                    isMaxed && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <span>{opt}</span>
                  {isSelected && <Check className="w-4 h-4 text-green-500" />}
                </div>
              );
            })
          ) : (
            <div className="px-3 py-2 text-muted-foreground">No matches found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
