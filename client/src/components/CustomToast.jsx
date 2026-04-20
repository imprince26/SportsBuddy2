import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useTheme } from "@/context/ThemeProvider";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  Medal,
  Sparkles,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";

const TOAST_TYPES = {
  success: {
    icon: CheckCircle2,
    tone: {
      light: "border-emerald-300 bg-emerald-50 text-emerald-900",
      dark: "border-emerald-400/40 bg-emerald-950/55 text-emerald-100",
    },
    iconTone: {
      light: "bg-emerald-500/15 text-emerald-700",
      dark: "bg-emerald-400/20 text-emerald-200",
    },
    rail: "from-emerald-400 via-emerald-500 to-emerald-600",
  },
  error: {
    icon: XCircle,
    tone: {
      light: "border-red-300 bg-red-50 text-red-900",
      dark: "border-red-400/45 bg-red-950/50 text-red-100",
    },
    iconTone: {
      light: "bg-red-500/15 text-red-700",
      dark: "bg-red-400/20 text-red-200",
    },
    rail: "from-red-400 via-red-500 to-rose-600",
  },
  warning: {
    icon: AlertTriangle,
    tone: {
      light: "border-amber-300 bg-amber-50 text-amber-900",
      dark: "border-amber-400/45 bg-amber-950/45 text-amber-100",
    },
    iconTone: {
      light: "bg-amber-500/15 text-amber-800",
      dark: "bg-amber-400/20 text-amber-200",
    },
    rail: "from-amber-400 via-amber-500 to-orange-600",
  },
  info: {
    icon: Info,
    tone: {
      light: "border-blue-300 bg-blue-50 text-blue-900",
      dark: "border-blue-400/45 bg-blue-950/45 text-blue-100",
    },
    iconTone: {
      light: "bg-blue-500/15 text-blue-800",
      dark: "bg-blue-400/20 text-blue-200",
    },
    rail: "from-blue-400 via-blue-500 to-cyan-600",
  },
  loading: {
    icon: Loader2,
    tone: {
      light: "border-slate-300 bg-slate-50 text-slate-900",
      dark: "border-slate-400/35 bg-slate-900/75 text-slate-100",
    },
    iconTone: {
      light: "bg-slate-600/10 text-slate-700",
      dark: "bg-slate-300/15 text-slate-200",
    },
    rail: "from-slate-400 via-slate-500 to-slate-600",
  },
  achievement: {
    icon: Trophy,
    tone: {
      light: "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-900",
      dark: "border-fuchsia-400/40 bg-fuchsia-950/45 text-fuchsia-100",
    },
    iconTone: {
      light: "bg-fuchsia-500/15 text-fuchsia-800",
      dark: "bg-fuchsia-400/20 text-fuchsia-200",
    },
    rail: "from-fuchsia-400 via-pink-500 to-rose-600",
  },
  sports: {
    icon: Zap,
    tone: {
      light: "border-indigo-300 bg-indigo-50 text-indigo-900",
      dark: "border-indigo-400/40 bg-indigo-950/45 text-indigo-100",
    },
    iconTone: {
      light: "bg-indigo-500/15 text-indigo-800",
      dark: "bg-indigo-400/20 text-indigo-200",
    },
    rail: "from-indigo-400 via-indigo-500 to-blue-600",
  },
};

const resolveTheme = (theme) => {
  if (typeof window === "undefined") {
    return "light";
  }

  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return theme;
};

const getToastConfig = (type) => {
  return TOAST_TYPES[type] || TOAST_TYPES.info;
};

const ToastCard = ({ t, resolvedTheme }) => {
  const config = getToastConfig(t.type);
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative w-full max-w-[380px] overflow-hidden rounded-2xl border shadow-[0_20px_50px_-28px_rgba(15,23,42,0.5)]",
        "backdrop-blur-xl",
        resolvedTheme === "dark" ? config.tone.dark : config.tone.light,
        t.visible ? "animate-in slide-in-from-right-5 fade-in duration-300" : "animate-out slide-out-to-right-8 fade-out duration-200"
      )}
    >
      <div className={cn("absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b", config.rail)} />
      <div className="relative flex items-start gap-3 px-4 py-3.5">
        <div
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            resolvedTheme === "dark" ? config.iconTone.dark : config.iconTone.light
          )}
        >
          <Icon className={cn("h-4 w-4", t.type === "loading" && "animate-spin")} />
        </div>

        <div className="min-w-0 flex-1 text-sm leading-relaxed">
          {typeof t.message === "string" ? (
            <p className="font-medium">{t.message}</p>
          ) : (
            <div>{t.message}</div>
          )}
        </div>

        {t.type !== "loading" ? (
          <button
            onClick={() => toast.dismiss(t.id)}
            className={cn(
              "rounded-md px-1.5 py-1 text-xs font-semibold transition-colors",
              resolvedTheme === "dark"
                ? "text-slate-300 hover:bg-white/10 hover:text-white"
                : "text-slate-600 hover:bg-black/5 hover:text-slate-900"
            )}
          >
            Close
          </button>
        ) : null}
      </div>
    </div>
  );
};

const CustomToast = () => {
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(theme));

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    if (theme !== "system") {
      setResolvedTheme(resolveTheme(theme));
      return undefined;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applySystemTheme = () => {
      setResolvedTheme(media.matches ? "dark" : "light");
    };

    applySystemTheme();
    media.addEventListener("change", applySystemTheme);

    return () => media.removeEventListener("change", applySystemTheme);
  }, [theme]);

  return (
    <Toaster
      position="bottom-right"
      gutter={10}
      containerStyle={{ bottom: 20, right: 20, zIndex: 10000 }}
      toastOptions={{
        duration: 4200,
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
          margin: 0,
          maxWidth: "380px",
        },
      }}
    >
      {(t) => <ToastCard t={t} resolvedTheme={resolvedTheme} />}
    </Toaster>
  );
};

const richBlock = (title, description, icon = null) => (
  <div className="space-y-0.5">
    <div className="flex items-center gap-2">
      {icon}
      <p className="text-sm font-semibold leading-tight">{title}</p>
    </div>
    <p className="text-xs opacity-90">{description}</p>
  </div>
);

export const showToast = {
  success: (message, options = {}) =>
    toast.success(message, {
      duration: 4000,
      ...options,
    }),

  error: (message, options = {}) =>
    toast.error(message, {
      duration: 5000,
      ...options,
    }),

  warning: (message, options = {}) =>
    toast(message, {
      type: "warning",
      duration: 4500,
      ...options,
    }),

  info: (message, options = {}) =>
    toast(message, {
      type: "info",
      duration: 4200,
      ...options,
    }),

  loading: (message, options = {}) =>
    toast.loading(message, {
      duration: Infinity,
      ...options,
    }),

  achievement: (message, options = {}) =>
    toast(message, {
      type: "achievement",
      duration: 5200,
      ...options,
    }),

  sports: (message, options = {}) =>
    toast(message, {
      type: "sports",
      duration: 4600,
      ...options,
    }),

  richSuccess: (title, description, options = {}) =>
    toast.success(richBlock(title, description, <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />), {
      duration: 5000,
      ...options,
    }),

  richError: (title, description, options = {}) =>
    toast.error(richBlock(title, description, <XCircle className="h-4 w-4 text-red-600 dark:text-red-300" />), {
      duration: 5600,
      ...options,
    }),

  richInfo: (title, description, options = {}) =>
    toast(richBlock(title, description, <Info className="h-4 w-4 text-blue-600 dark:text-blue-300" />), {
      type: "info",
      duration: 5000,
      ...options,
    }),

  richWarning: (title, description, options = {}) =>
    toast(richBlock(title, description, <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-300" />), {
      type: "warning",
      duration: 5000,
      ...options,
    }),

  eventJoined: (eventName, options = {}) =>
    toast(
      richBlock("Event joined", `You are now registered for ${eventName}.`, <Medal className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />),
      {
        type: "sports",
        duration: 5200,
        ...options,
      }
    ),

  eventCreated: (eventName, options = {}) =>
    toast(
      richBlock("Event created", `${eventName} is live for participants.`, <Sparkles className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-300" />),
      {
        type: "achievement",
        duration: 5200,
        ...options,
      }
    ),

  goalAchieved: (goalName, options = {}) =>
    toast(
      richBlock("Goal achieved", goalName, <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-300" />),
      {
        type: "achievement",
        duration: 5400,
        ...options,
      }
    ),

  newAchievement: (achievementName, options = {}) =>
    toast(
      richBlock("New achievement unlocked", achievementName, <Trophy className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-300" />),
      {
        type: "achievement",
        duration: 5600,
        ...options,
      }
    ),

  dismiss: (toastId) => toast.dismiss(toastId),
  dismissAll: () => toast.dismiss(),
};

export default CustomToast;
