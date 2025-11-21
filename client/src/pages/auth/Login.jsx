import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
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
  KeyRound,
  Loader2
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import ModernInput from "@/components/ModernInput"
import { loginSchema,defaultLoginValues } from "@/schemas/authSchema"
import HeroBg from "@/components/HeroBg"

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

  return (
    <div className="h-screen bg-background relative overflow-hidden">
      <HeroBg />

      <div className="relative z-10 h-full flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 items-center justify-center p-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 opacity-50" />
          
          <div className="max-w-sm text-center text-white relative z-10 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="mb-6">
              {/* SportsBuddy Logo */}
              <div className="relative mx-auto w-24 h-24 mb-4">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-spin-slow" />
                <div className="absolute inset-1 bg-background rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-105 border border-primary/20">
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
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-3 text-foreground dark:text-white">
              Welcome Back!
            </h1>

            <p className="text-lg text-muted-foreground dark:text-zinc-400 mb-6 leading-relaxed">
              Connect with sports enthusiasts and discover amazing events.
            </p>

            {/* Sports Icons */}
            <div className="flex justify-center space-x-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-backwards">
              {[
                { icon: "⚽", name: "Football" },
                { icon: "🏀", name: "Basketball" },
                { icon: "🎾", name: "Tennis" },
                { icon: "🏐", name: "Volleyball" },
              ].map((sport, index) => (
                <div
                  key={sport.name}
                  className="text-center group cursor-pointer transition-transform hover:-translate-y-1"
                >
                  <div className="w-10 h-10 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center mb-1 group-hover:bg-white/10 transition-all duration-300 border border-white/10">
                    <span className="text-lg">{sport.icon}</span>
                  </div>
                  <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">{sport.name}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-backwards">
              {[
                { number: "50K+", label: "Athletes" },
                { number: "1000+", label: "Events" },
                { number: "100+", label: "Cities" },
              ].map((stat, index) => (
                <div key={stat.label}>
                  <div className="text-lg font-bold text-white">{stat.number}</div>
                  <div className="text-xs text-zinc-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <div className="w-full max-w-sm animate-in fade-in zoom-in-95 duration-500">
            <Card className="border-border bg-card shadow-2xl shadow-black/5 rounded-3xl">
              <CardHeader className="pb-6 pt-8">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shadow-sm transition-transform hover:scale-105 hover:rotate-3">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground mb-2">
                    Welcome Back
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Sign in to continue your sports journey
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 px-6 pb-6">
                {authError && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <Alert className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 rounded-xl">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <AlertTitle className="text-red-800 dark:text-red-200 font-semibold text-sm">
                        Authentication Error
                      </AlertTitle>
                      <AlertDescription className="text-red-700 dark:text-red-300 text-sm">
                        {authError}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <div>
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
                    </div>

                    <div>
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
                    </div>

                    <div className="flex justify-end">
                      <Link
                        to="/forgot-password"
                        className="text-sm text-muted-foreground hover:text-primary font-medium hover:underline transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <div>
                      <Button
                        type="submit"
                        disabled={form.formState.isSubmitting || loading}
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm hover:shadow-md transition-all duration-300 rounded-xl group relative overflow-hidden"
                      >
                        <div className="relative z-10 flex items-center justify-center">
                          {form.formState.isSubmitting || loading ? (
                            <div className="flex items-center space-x-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
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
                    </div>
                  </form>
                </Form>

                <div className="text-center pt-4 border-t border-border">
                  <p className="text-muted-foreground text-sm">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="text-primary hover:underline font-semibold transition-colors"
                    >
                      Sign up here
                    </Link>
                  </p>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center justify-center space-x-6 pt-2">
                  {[
                    { icon: Shield, text: "Secure", color: "text-green-600" },
                    { icon: CheckCircle, text: "Trusted", color: "text-blue-600" },
                    { icon: Sparkles, text: "Premium", color: "text-purple-600" },
                  ].map((item, index) => (
                    <div
                      key={item.text}
                      className="flex items-center space-x-1 text-xs text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards"
                      style={{ animationDelay: `${index * 100 + 500}ms` }}
                    >
                      <item.icon className={`w-3 h-3 ${item.color}`} />
                      <span className="font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mobile Logo */}
            <div className="lg:hidden text-center mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
              <div className="flex items-center justify-center space-x-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="font-bold text-lg text-foreground">SportsBuddy</span>
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Your sports community awaits
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
