import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Mail,
  ArrowRight,
  AlertCircle,
  Trophy,
  Zap,
  Users,
  Target,
  Sparkles,
  Shield,
  CheckCircle,
  KeyRound
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import ModernInput from "@/components/ModernInput"
import { loginSchema,defaultLoginValues } from "@/schemas/authSchema"

const Login = () => {
  const { user, login, loading, authError } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: defaultLoginValues
  })

  useEffect(() => {
    if (user) {
      navigate("/dashboard")
    }
  }, [user, navigate])

  useEffect(() => {
    document.title = "Sign In - SportsBuddy"
  }, [])

  const onSubmit = async (data) => {
    try {
      await login({
        email: data.email,
        password: data.password,
      })
    } catch (error) {
      console.log("Login error:", error?.message)
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
      transition: {
        duration: 0.5,
        ease: "easeOut"
      },
    },
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-blue-50/30 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-blue-950/20" />

        {/* Animated Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-primary/30 dark:bg-primary/70/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.7, 0.3],
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
        {[Trophy, Zap, Users, Target].map((Icon, i) => (
          <motion.div
            key={i}
            className="absolute text-primary/50/15 dark:text-primary/20"
            style={{
              left: `${20 + (i * 20) % 60}%`,
              top: `${25 + (i * 20) % 50}%`,
            }}
            animate={{
              y: [0, -8, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Icon size={30 + (i % 2) * 10} />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 h-full flex">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 items-center justify-center p-8 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 50%),
                  radial-gradient(circle at 70% 70%, rgba(255,255,255,0.2) 0%, transparent 50%)
                `
              }}
            />
          </div>

          <div className="max-w-sm text-center text-white relative z-10">
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              {/* SportsBuddy Logo */}
              <div className="relative mx-auto w-24 h-24 mb-4">
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
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
                    className="w-8 h-8 text-primary"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m4.93 4.93 4.24 4.24" />
                    <path d="m14.83 9.17 4.24-4.24" />
                    <path d="m14.83 14.83 4.24 4.24" />
                    <path d="m9.17 14.83-4.24 4.24" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                </motion.div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent"
            >
              Welcome Back!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-lg opacity-90 mb-6 leading-relaxed"
            >
              Connect with sports enthusiasts and discover amazing events.
            </motion.p>

            {/* Sports Icons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center space-x-6"
            >
              {[
                { icon: "⚽", name: "Football" },
                { icon: "🏀", name: "Basketball" },
                { icon: "🎾", name: "Tennis" },
                { icon: "🏐", name: "Volleyball" },
              ].map((sport, index) => (
                <motion.div
                  key={sport.name}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.1, y: -3 }}
                  className="text-center group cursor-pointer"
                >
                  <motion.div
                    className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-1 group-hover:bg-white/30 transition-all duration-300"
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                  >
                    <span className="text-lg">{sport.icon}</span>
                  </motion.div>
                  <span className="text-xs font-medium opacity-90">{sport.name}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-8 grid grid-cols-3 gap-4 text-center"
            >
              {[
                { number: "50K+", label: "Athletes" },
                { number: "1000+", label: "Events" },
                { number: "100+", label: "Cities" },
              ].map((stat, index) => (
                <div key={stat.label}>
                  <div className="text-lg font-bold text-white">{stat.number}</div>
                  <div className="text-xs text-white/80">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-sm"
          >
            <Card className="backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-900/90 shadow-xl rounded-2xl">
              <CardHeader className="pb-6 pt-6">
                <motion.div variants={itemVariants} className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                      <Shield className="w-6 h-6 text-white" />
                    </motion.div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                    Welcome Back
                  </CardTitle>
                  <p className="text-neutral-600 dark:text-gray-400 text-sm">
                    Sign in to continue your sports journey
                  </p>
                </motion.div>
              </CardHeader>

              <CardContent className="space-y-6 px-6 pb-6">
                {authError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    variants={itemVariants}
                  >
                    <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-xl">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <AlertTitle className="text-red-800 dark:text-red-200 font-semibold text-sm">
                        Authentication Error
                      </AlertTitle>
                      <AlertDescription className="text-red-700 dark:text-red-300 text-sm">
                        {authError}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                              <ModernInput
                                icon={KeyRound}
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
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex justify-end">
                      <Link
                        to="/forgot-password"
                        className="text-sm text-primary dark:text-primary hover:text-primary/90 dark:hover:text-primary font-medium hover:underline transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <Button
                        type="submit"
                        disabled={form.formState.isSubmitting || loading}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl group relative overflow-hidden"
                      >
                        <div className="relative z-10 flex items-center justify-center">
                          {form.formState.isSubmitting || loading ? (
                            <div className="flex items-center space-x-2">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                              />
                              <span>Signing In...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span>Sign In</span>
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          )}
                        </div>
                      </Button>
                    </motion.div>
                  </form>
                </Form>

                <motion.div
                  variants={itemVariants}
                  className="text-center pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                  <p className="text-neutral-600 dark:text-gray-400 text-sm">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="text-primary dark:text-primary hover:text-primary/90 dark:hover:text-primary font-semibold hover:underline transition-colors"
                    >
                      Sign up here
                    </Link>
                  </p>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-center space-x-6 pt-2"
                >
                  {[
                    { icon: Shield, text: "Secure", color: "text-green-500" },
                    { icon: CheckCircle, text: "Trusted", color: "text-blue-500" },
                    { icon: Sparkles, text: "Premium", color: "text-purple-500" },
                  ].map((item, index) => (
                    <motion.div
                      key={item.text}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
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
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="lg:hidden text-center mt-6"
            >
              <div className="flex items-center justify-center space-x-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="font-bold text-lg text-neutral-900 dark:text-white">SportsBuddy</span>
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Your sports community awaits
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Login
