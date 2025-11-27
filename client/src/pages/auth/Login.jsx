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
    <div className="h-screen bg-background relative overflow-hidden -mt-8">
        {/* Login Form */}
        <div className="relative z-10 h-full flex w-full flex items-center justify-center p-6">
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
                {/* <div className="flex items-center justify-center space-x-6 pt-2">
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
                </div> */}
              </CardContent>
            </Card>

            {/* Mobile Logo */}
            <div className="lg:hidden text-center mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
              <div className="flex items-center justify-center space-x-2">
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
  )
}

export default Login
