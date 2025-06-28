import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Mail, Lock, User, AtSign, ArrowRight, AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

const Register = () => {
  const { user, register: registerUser, loading } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [authError, setAuthError] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm()

  const password = watch("password")

  useEffect(() => {
    if (user) {
      navigate("/dashboard")
    }
  }, [user, navigate])

  useEffect(() => {
    document.title = "Register - SportsBuddy"
  }, [])

  const onSubmit = async (data) => {
    if (!agreedToTerms) {
      setAuthError("Please agree to the Terms of Service and Privacy Policy")
      return
    }

    try {
      setAuthError("")
      await registerUser({
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
      })
    } catch (error) {
      setAuthError(error.message || "Registration failed. Please try again.")
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

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" }

    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"]
    const colors = [
      "bg-destructive-light",
      "bg-accent-light",
      "bg-warning-light",
      "bg-secondary-light",
      "bg-success-light",
    ]

    return {
      strength,
      label: labels[strength - 1] || "",
      color: colors[strength - 1] || "",
    }
  }

  const passwordStrength = getPasswordStrength(password)

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark relative overflow-hidden">
      {/* Background Sports SVG */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <svg viewBox="0 0 1200 800" className="w-full h-full object-cover" fill="currentColor">
          {/* Running Track */}
          <ellipse
            cx="600"
            cy="400"
            rx="300"
            ry="150"
            fill="none"
            stroke="currentColor"
            strokeWidth="20"
            className="text-secondary-light dark:text-secondary-dark"
          />
          <ellipse
            cx="600"
            cy="400"
            rx="250"
            ry="100"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-secondary-light dark:text-secondary-dark"
          />

          {/* Volleyball */}
          <circle cx="150" cy="150" r="30" className="text-accent-light dark:text-accent-dark" />
          <path
            d="M120 150 Q150 120 180 150 M120 150 Q150 180 180 150 M150 120 L150 180"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-background-light dark:text-background-dark"
          />

          {/* Swimming Waves */}
          <path
            d="M50 650 Q100 630 150 650 T250 650 T350 650"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-primary-light dark:text-primary-dark"
          />
          <path
            d="M50 670 Q100 650 150 670 T250 670 T350 670"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-primary-light dark:text-primary-dark opacity-60"
          />

          {/* Cycling Wheel */}
          <circle
            cx="1050"
            cy="150"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-secondary-light dark:text-secondary-dark"
          />
          <path
            d="M1010 150 L1090 150 M1050 110 L1050 190 M1025 125 L1075 175 M1075 125 L1025 175"
            stroke="currentColor"
            strokeWidth="2"
            className="text-secondary-light dark:text-secondary-dark"
          />
        </svg>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md">
            <Card className="backdrop-blur-lg border-border-light dark:border-border-dark bg-card-light/95 dark:bg-card-dark/95 shadow-2xl">
              <CardHeader className="space-y-1 pb-6">
                <motion.div variants={itemVariants} className="text-center mb-2">
                  <CardTitle className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">
                    Join SportsBuddy
                  </CardTitle>
                  <p className="text-muted-foreground-light dark:text-muted-foreground-dark mt-2">
                    Create your account and start connecting with sports enthusiasts
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
                    <Label htmlFor="name" className="text-foreground-light dark:text-foreground-dark">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground-light dark:text-muted-foreground-dark" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        className={cn(
                          "pl-10 h-12 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark",
                          errors.name && "border-destructive-light dark:border-destructive-dark",
                        )}
                        {...register("name", {
                          required: "Full name is required",
                          minLength: {
                            value: 2,
                            message: "Name must be at least 2 characters",
                          },
                        })}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-destructive-light dark:text-destructive-dark">{errors.name.message}</p>
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="username" className="text-foreground-light dark:text-foreground-dark">
                      Username
                    </Label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground-light dark:text-muted-foreground-dark" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Choose a username"
                        className={cn(
                          "pl-10 h-12 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark",
                          errors.username && "border-destructive-light dark:border-destructive-dark",
                        )}
                        {...register("username", {
                          required: "Username is required",
                          minLength: {
                            value: 3,
                            message: "Username must be at least 3 characters",
                          },
                          pattern: {
                            value: /^[a-zA-Z0-9_]+$/,
                            message: "Username can only contain letters, numbers, and underscores",
                          },
                        })}
                      />
                    </div>
                    {errors.username && (
                      <p className="text-sm text-destructive-light dark:text-destructive-dark">
                        {errors.username.message}
                      </p>
                    )}
                  </motion.div>

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
                        placeholder="Create a password"
                        className={cn(
                          "pl-10 pr-10 h-12 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark",
                          errors.password && "border-destructive-light dark:border-destructive-dark",
                        )}
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters",
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

                    {password && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-muted-light dark:bg-muted-dark rounded-full h-2">
                            <div
                              className={cn("h-2 rounded-full transition-all duration-300", passwordStrength.color)}
                              style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">
                            {passwordStrength.label}
                          </span>
                        </div>
                      </div>
                    )}

                    {errors.password && (
                      <p className="text-sm text-destructive-light dark:text-destructive-dark">
                        {errors.password.message}
                      </p>
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground-light dark:text-foreground-dark">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground-light dark:text-muted-foreground-dark" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className={cn(
                          "pl-10 pr-10 h-12 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark",
                          errors.confirmPassword && "border-destructive-light dark:border-destructive-dark",
                        )}
                        {...register("confirmPassword", {
                          required: "Please confirm your password",
                          validate: (value) => value === password || "Passwords do not match",
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-muted-foreground-light dark:text-muted-foreground-dark hover:text-foreground-light dark:hover:text-foreground-dark"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive-light dark:text-destructive-dark">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={setAgreedToTerms}
                      className="border-input-light dark:border-input-dark"
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark cursor-pointer"
                    >
                      I agree to the{" "}
                      <Link to="/terms" className="text-primary-light dark:text-primary-dark hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-primary-light dark:text-primary-dark hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Button
                      type="submit"
                      disabled={isSubmitting || loading || !agreedToTerms}
                      className="w-full h-12 bg-primary-light dark:bg-primary-dark hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 text-white font-semibold text-base group disabled:opacity-50"
                    >
                      {isSubmitting || loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Creating Account...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>Create Account</span>
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
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-primary-light dark:text-primary-dark hover:underline font-semibold"
                    >
                      Sign in here
                    </Link>
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex lg:w-1/2 bg-secondary-light dark:bg-secondary-dark items-center justify-center p-12"
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
                <path
                  d="M70 85 Q100 60 130 85 Q100 110 70 85"
                  className="text-secondary-light dark:text-secondary-dark"
                />
                <circle cx="85" cy="90" r="8" className="text-secondary-light dark:text-secondary-dark" />
                <circle cx="115" cy="90" r="8" className="text-secondary-light dark:text-secondary-dark" />
                <path
                  d="M80 120 Q100 135 120 120"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className="text-secondary-light dark:text-secondary-dark"
                />
              </svg>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-4xl font-bold mb-4"
            >
              Start Your Journey!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-xl opacity-90 mb-8"
            >
              Join thousands of sports enthusiasts and discover your next adventure.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="space-y-4"
            >
              {/* Benefits List */}
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-white" />
                <span>Connect with local sports communities</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-white" />
                <span>Discover events and tournaments</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-white" />
                <span>Track your fitness progress</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-white" />
                <span>Find training partners</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Register
