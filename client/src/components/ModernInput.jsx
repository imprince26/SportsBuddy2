import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const ModernInput = ({
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  name,
  error,
  showPassword,
  onTogglePassword,
  className,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)

  useEffect(() => {
    setHasValue(value && value.length > 0)
  }, [value])

  // Determine if label should be in "up" position
  const shouldLabelBeUp = isFocused || hasValue || error

  return (
    <div className="relative group">
      {/* Floating Label */}
      <motion.label
        initial={false}
        animate={{
          y: shouldLabelBeUp ? -38 : -12,
          scale: shouldLabelBeUp ? 0.75 : 1,
          color: error
            ? "#ef4444"
            : isFocused
              ? "#3b82f6"
              : "#6b7280"
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "absolute left-12 top-1/2 -translate-y-1/2 pointer-events-none font-medium z-20 px-2 origin-left",
          "bg-white dark:bg-gray-900",
          shouldLabelBeUp && "bg-white dark:bg-gray-900"
        )}
        style={{ transformOrigin: "left center" }}
      >
        {placeholder}
      </motion.label>

      {/* Input Container */}
      <div className="relative">
        {/* Gradient Border Container */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-xl p-[2px]",
            error
              ? "bg-gradient-to-r from-red-400 to-red-600"
              : isFocused
                ? "bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600"
                : "bg-gray-200 dark:bg-gray-700"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-full h-full bg-white dark:bg-gray-900 rounded-xl" />
        </motion.div>

        {/* Input Field Container */}
        <div className={cn(
          "relative bg-white dark:bg-gray-900 rounded-xl",
          "border-2 transition-all duration-300",
          error
            ? "border-red-300 dark:border-red-700"
            : isFocused
              ? "border-transparent shadow-lg shadow-blue-500/20 dark:shadow-blue-400/30"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
        )}>
          {/* Icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <motion.div
              animate={{
                scale: isFocused ? 1.1 : 1,
                color: error
                  ? "#ef4444"
                  : isFocused
                    ? "#3b82f6"
                    : "#6b7280"
              }}
              transition={{ duration: 0.2 }}
            >
              <Icon className="w-5 h-5" />
            </motion.div>
          </div>

          {/* Input Field */}
          <Input
            type={type === "password" && showPassword ? "text" : type}
            value={value}
            onChange={(e) => {
              onChange(e)
              setHasValue(e.target.value.length > 0)
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              setIsFocused(false)
              onBlur && onBlur(e)
            }}
            name={name}
            placeholder=""
            className={cn(
              "w-full h-12 pl-12 bg-transparent border-0",
              "text-gray-900 dark:text-purple-50 text-base",
              "placeholder:text-transparent",
              "focus:outline-none focus:ring-0 rounded-xl",
              "transition-all duration-300",
              type === "password" && "pr-12",
              !type.includes("password") && "pr-4",
              className
            )}
            {...props}
          />

          {/* Password Toggle */}
          {type === "password" && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30">
              <motion.button
                type="button"
                onClick={onTogglePassword}
                className="flex items-center justify-center w-6 h-6 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded"
                whileHover={{
                  scale: 1.1,
                  backgroundColor: "rgba(59, 130, 246, 0.1)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  initial={false}
                  animate={{
                    rotate: showPassword ? 180 : 0,
                    scale: showPassword ? 1.05 : 1
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex items-center justify-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </motion.div>
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="mt-2 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  )
}

export default ModernInput
