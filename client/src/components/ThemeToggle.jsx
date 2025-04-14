import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react'; // Optional: Icons (install lucide-react)

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-full ${
          theme === 'light' ? 'bg-primary-light text-white' : 'bg-gray-200 dark:bg-gray-700'
        }`}
        aria-label="Light mode"
      >
        <Sun className="w-5 h-5" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-full ${
          theme === 'dark' ? 'bg-primary-dark text-white' : 'bg-gray-200 dark:bg-gray-700'
        }`}
        aria-label="Dark mode"
      >
        <Moon className="w-5 h-5" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-full ${
          theme === 'system' ? 'bg-primary-light dark:bg-primary-dark text-white' : 'bg-gray-200 dark:bg-gray-700'
        }`}
        aria-label="System mode"
      >
        <Monitor className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ThemeToggle;