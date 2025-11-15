import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Mail,
  Lock,
  User,
  AtSign,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Trophy,
  Zap,
  Users,
  Target,
  Sparkles,
  Shield,
  Activity,
  UserPlus,
  Heart,
  Globe
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import ModernInput from "@/components/ModernInput"
import { cn } from "@/lib/utils"
import { defaultRegisterValues, registerSchema } from "@/schemas/authSchema"

// Compact Password Strength Component
const PasswordStrength = ({ password }) => {
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
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-blue-500",
      "bg-green-500",
    ]

    return {
      strength,
      label: labels[strength - 1] || "",
      color: colors[strength - 1] || "",
    }
  }

  const passwordStrength = getPasswordStrength(password)

  if (!password) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-1"
    >
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <motion.div
            className={cn("h-1.5 rounded-full transition-all duration-300", passwordStrength.color)}
            initial={{ width: "0%" }}
            animate={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium min-w-[55px]">
          {passwordStrength.label}
        </span>
      </div>
    </motion.div>
  )
}

const Register = () => {
  const { user, register: registerUser, loading, authError } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: defaultRegisterValues
  })

  const watchPassword = form.watch("password")

  useEffect(() => {
    if (user) {
      navigate("/dashboard")
    }
  }, [user, navigate])

  useEffect(() => {
    document.title = "Join SportsBuddy - Create Account"
  }, [])

  const onSubmit = async (data) => {
    if (!agreedToTerms) {
      return
    }

    try {
      await registerUser({
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
      })
    } catch (error) {
      console.log("Registration error:", error?.message)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.08,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      },
    },
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-blue-50/20 to-purple-50/30 dark:from-purple-950/20 dark:via-blue-950/10 dark:to-purple-950/20" />

        {/* Animated Particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 dark:bg-purple-300/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Floating Sports Icons */}
        {[UserPlus, Trophy, Users, Target].map((Icon, i) => (
          <motion.div
            key={i}
            className="absolute text-purple-200/10 dark:text-purple-400/15"
            style={{
              left: `${20 + (i * 20) % 60}%`,
              top: `${25 + (i * 25) % 50}%`,
            }}
            animate={{
              y: [0, -8, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Icon size={25 + (i % 2) * 10} />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 h-full flex">
        {/* Left Side - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center mb-16 p-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md"
          >
            <Card className="backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-900/90 shadow-xl rounded-2xl">
              <CardHeader className="pb-3 pt-4">
                <motion.div variants={itemVariants} className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <motion.div
                      className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                      <UserPlus className="w-5 h-5 text-white" />
                    </motion.div>
                  </div>
                  <CardTitle className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                    Join SportsBuddy
                  </CardTitle>
                  <p className="text-neutral-600 dark:text-gray-400 text-xs">
                    Create your account and start your sports journey
                  </p>
                </motion.div>
              </CardHeader>

              <CardContent className="space-y-3 px-6 pb-4">
                {authError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    variants={itemVariants}
                  >
                    <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-xl py-2">
                      <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                      <AlertTitle className="text-red-800 dark:text-red-200 font-semibold text-xs">
                        Registration Error
                      </AlertTitle>
                      <AlertDescription className="text-red-700 dark:text-red-300 text-xs">
                        {authError}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                    <motion.div variants={itemVariants}>
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <ModernInput
                                icon={User}
                                type="text"
                                placeholder="Full Name"
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                                error={form.formState.errors.name?.message}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <ModernInput
                                icon={AtSign}
                                type="text"
                                placeholder="Username"
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                                error={form.formState.errors.username?.message}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <ModernInput
                                icon={Mail}
                                type="email"
                                placeholder="Email Address"
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                                error={form.formState.errors.email?.message}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="space-y-1">
                                <ModernInput
                                  icon={Lock}
                                  type="password"
                                  placeholder="Password"
                                  value={field.value}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  name={field.name}
                                  error={form.formState.errors.password?.message}
                                  showPassword={showPassword}
                                  onTogglePassword={() => setShowPassword(!showPassword)}
                                />
                                <PasswordStrength password={watchPassword} />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <ModernInput
                                icon={Lock}
                                type="password"
                                placeholder="Confirm Password"
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                                error={form.formState.errors.confirmPassword?.message}
                                showPassword={showConfirmPassword}
                                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex items-start space-x-2 pt-1">
                      <Checkbox
                        id="terms"
                        checked={agreedToTerms}
                        onCheckedChange={setAgreedToTerms}
                        className="mt-0.5 h-4 w-4"
                      />
                      <label
                        htmlFor="terms"
                        className="text-xs text-neutral-600 dark:text-gray-400 cursor-pointer leading-relaxed"
                      >
                        I agree to the{" "}
                        <Link to="/terms" className="text-primary dark:text-primary hover:underline font-medium">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" className="text-primary dark:text-primary hover:underline font-medium">
                          Privacy Policy
                        </Link>
                      </label>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <Button
                        type="submit"
                        disabled={form.formState.isSubmitting || loading || !agreedToTerms}
                        className="w-full h-10 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 hover:from-purple-700 hover:via-blue-700 hover:to-purple-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl group relative overflow-hidden disabled:opacity-50 text-sm"
                      >
                        <div className="relative z-10 flex items-center justify-center">
                          {form.formState.isSubmitting || loading ? (
                            <div className="flex items-center space-x-2">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full"
                              />
                              <span>Creating Account...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span>Create Account</span>
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </div>
                          )}
                        </div>
                      </Button>
                    </motion.div>
                  </form>
                </Form>

                <motion.div
                  variants={itemVariants}
                  className="text-center pt-2 border-t border-gray-200 dark:border-gray-700"
                >
                  <p className="text-neutral-600 dark:text-gray-400 text-xs">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-primary dark:text-primary hover:text-primary/90 dark:hover:text-blue-300 font-semibold hover:underline transition-colors"
                    >
                      Sign in here
                    </Link>
                  </p>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-center space-x-4 pt-1"
                >
                  {[
                    { icon: Shield, text: "Secure", color: "text-green-500" },
                    { icon: CheckCircle, text: "Trusted", color: "text-blue-500" },
                    { icon: Sparkles, text: "Free", color: "text-purple-500" },
                  ].map((item, index) => (
                    <motion.div
                      key={item.text}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 + index * 0.1 }}
                      className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400"
                    >
                      <item.icon className={`w-3 h-3 ${item.color}`} />
                      <span className="font-medium">{item.text}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>

            {/* Mobile Logo */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="lg:hidden text-center mt-4"
            >
              <div className="flex items-center justify-center space-x-1">
                <Trophy className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-base text-neutral-900 dark:text-white">SportsBuddy</span>
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Your sports community awaits
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 items-center justify-center p-8 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 0%, transparent 50%),
                  radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 0%, transparent 50%)
                `
              }}
            />
          </div>

          <div className="max-w-md text-center text-white relative z-10">
            <motion.div
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              {/* SportsBuddy Logo */}
              <div className="relative mx-auto w-20 h-20 mb-4">
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-full"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-1 bg-white rounded-full flex items-center justify-center shadow-xl"
                  whileHover={{ scale: 1.05 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-7 h-7 text-purple-600"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="m22 21-3-3" />
                    <path d="m16 16 3 3" />
                  </svg>
                </motion.div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-2xl font-bold mb-3 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent"
            >
              Start Your Journey!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-base opacity-90 mb-6 leading-relaxed"
            >
              Join thousands of sports enthusiasts and discover amazing opportunities.
            </motion.p>

            {/* Benefits List */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="space-y-3 text-left"
            >
              {[
                { icon: Users, text: "Connect with local sports communities" },
                { icon: Trophy, text: "Discover events and tournaments" },
                { icon: Activity, text: "Track your fitness progress" },
                { icon: Heart, text: "Find training partners" },
              ].map((benefit, index) => (
                <motion.div
                  key={benefit.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                    <benefit.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-medium">{benefit.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-8 grid grid-cols-3 gap-3 text-center"
            >
              {[
                { number: "50K+", label: "Athletes", icon: Users },
                { number: "1000+", label: "Events", icon: Trophy },
                { number: "100+", label: "Cities", icon: Globe },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.3 + index * 0.1 }}
                  className="bg-white/10 rounded-xl p-3 backdrop-blur-sm"
                >
                  <stat.icon className="w-5 h-5 mx-auto mb-1 text-white/80" />
                  <div className="text-base font-bold text-white">{stat.number}</div>
                  <div className="text-xs text-white/80">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Register
