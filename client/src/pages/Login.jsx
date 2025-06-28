import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

const Login = () => {
  const { user, login, loading } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    if (user) {
      navigate("/dashboard")
    }
  }, [user, navigate])

  useEffect(() => {
    document.title = "Login - SportsBuddy"
  }, [])

  const onSubmit = async (data) => {
    try {
      setAuthError("")
      await login({
        email: data.email,
        password: data.password,
      })
    } catch (error) {
      setAuthError(error.message || "Login failed. Please try again.")
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark relative overflow-hidden">
      {/* Background Sports SVG */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <svg viewBox="0 0 1200 800" className="w-full h-full object-cover" fill="currentColor">
          {/* Soccer Ball */}
          <circle cx="200" cy="150" r="40" className="text-primary-light dark:text-primary-dark" />
          <path
            d="M200 110 L220 130 L210 150 L190 150 L180 130 Z"
            className="text-background-light dark:text-background-dark"
          />

          {/* Basketball */}
          <circle cx="1000" cy="200" r="35" className="text-accent-light dark:text-accent-dark" />
          <path
            d="M965 200 Q1000 170 1035 200 M965 200 Q1000 230 1035 200 M1000 165 L1000 235"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-background-light dark:text-background-dark"
          />

          {/* Tennis Racket */}
          <ellipse cx="150" cy="600" rx="25" ry="40" className="text-secondary-light dark:text-secondary-dark" />
          <rect x="145" y="640" width="10" height="60" className="text-secondary-light dark:text-secondary-dark" />

          {/* Dumbbell */}
          <rect x="950" y="650" width="80" height="8" className="text-primary-light dark:text-primary-dark" />
          <rect x="945" y="640" width="15" height="28" className="text-primary-light dark:text-primary-dark" />
          <rect x="1020" y="640" width="15" height="28" className="text-primary-light dark:text-primary-dark" />
        </svg>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex lg:w-1/2 bg-primary-light dark:bg-primary-dark items-center justify-center p-12"
        >
          <div className="max-w-md text-center text-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="mb-8"
            >
              <svg viewBox="0 0 200 200" className="w-32 h-32 mx-auto mb-6" fill="currentColor">
                {/* SportsBuddy Logo */}
                <circle cx="100" cy="100" r="90" className="text-white/20" />
                <circle cx="100" cy="100" r="60" className="text-white" />
                <path d="M70 85 Q100 60 130 85 Q100 110 70 85" className="text-primary-light dark:text-primary-dark" />
                <circle cx="85" cy="90" r="8" className="text-primary-light dark:text-primary-dark" />
                <circle cx="115" cy="90" r="8" className="text-primary-light dark:text-primary-dark" />
                <path
                  d="M80 120 Q100 135 120 120"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className="text-primary-light dark:text-primary-dark"
                />
              </svg>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-4xl font-bold mb-4"
            >
              Welcome Back!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-xl opacity-90 mb-8"
            >
              Connect with sports enthusiasts and discover amazing events in your area.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex justify-center space-x-8"
            >
              {/* Sports Icons */}
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2 L12 22 M2 12 L22 12" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </div>
                <span className="text-sm">Football</span>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2 Q18 8 12 12 Q6 8 12 2 M12 12 Q18 16 12 22 Q6 16 12 12" />
                  </svg>
                </div>
                <span className="text-sm">Basketball</span>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                    <ellipse cx="12" cy="12" rx="8" ry="4" />
                    <rect x="11" y="16" width="2" height="6" />
                  </svg>
                </div>
                <span className="text-sm">Tennis</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md">
            <Card className="backdrop-blur-lg border-border-light dark:border-border-dark bg-card-light/95 dark:bg-card-dark/95 shadow-2xl">
              <CardHeader className="space-y-1 pb-6">
                <motion.div variants={itemVariants} className="text-center mb-2">
                  <CardTitle className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">
                    Sign In
                  </CardTitle>
                  <p className="text-muted-foreground-light dark:text-muted-foreground-dark mt-2">
                    Enter your credentials to access your account
                  </p>
                </motion.div>
              </CardHeader>

              <CardContent className="space-y-6">
                {authError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    variants={itemVariants}
                  >
                    <Alert className="border-destructive-light dark:border-destructive-dark">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-destructive-light dark:text-destructive-dark">
                        {authError}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="email" className="text-foreground-light dark:text-foreground-dark">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground-light dark:text-muted-foreground-dark" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className={cn(
                          "pl-10 h-12 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark",
                          errors.email && "border-destructive-light dark:border-destructive-dark",
                        )}
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive-light dark:text-destructive-dark">
                        {errors.email.message}
                      </p>
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="password" className="text-foreground-light dark:text-foreground-dark">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground-light dark:text-muted-foreground-dark" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className={cn(
                          "pl-10 pr-10 h-12 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark",
                          errors.password && "border-destructive-light dark:border-destructive-dark",
                        )}
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground-light dark:text-muted-foreground-dark hover:text-foreground-light dark:hover:text-foreground-dark"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive-light dark:text-destructive-dark">
                        {errors.password.message}
                      </p>
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex items-center justify-between">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary-light dark:text-primary-dark hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Button
                      type="submit"
                      disabled={isSubmitting || loading}
                      className="w-full h-12 bg-primary-light dark:bg-primary-dark hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 text-white font-semibold text-base group"
                    >
                      {isSubmitting || loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Signing In...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>Sign In</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </form>

                <motion.div
                  variants={itemVariants}
                  className="text-center pt-4 border-t border-border-light dark:border-border-dark"
                >
                  <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="text-primary-light dark:text-primary-dark hover:underline font-semibold"
                    >
                      Sign up here
                    </Link>
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Login
