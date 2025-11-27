import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
    <div
      className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-secondary rounded-full h-1.5">
          <div
            className={cn("h-1.5 rounded-full transition-all duration-300", passwordStrength.color)}
            style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground font-medium min-w-[55px]">
          {passwordStrength.label}
        </span>
      </div>
    </div>
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

  return (
    <div className="h-screen bg-background relative overflow-hidden">
      {/* Registration Form */}
      <div className="relative z-10 h-full flex w-full flex items-center justify-center -mt-10 mb-20 p-4">
        <div
          className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700"
        >
          <Card className="bg-card border-border shadow-2xl shadow-black/5 rounded-3xl">
            <CardHeader className="pb-3 pt-6">
              <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                <div className="flex items-center justify-center mb-3">
                  <div
                    className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg hover:scale-105 hover:rotate-6 transition-transform duration-300"
                  >
                    <UserPlus className="w-5 h-5 text-primary-foreground" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-foreground mb-1">
                  Join SportsBuddy
                </CardTitle>
                <p className="text-muted-foreground text-xs">
                  Create your account and start your sports journey
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 px-6 pb-6">
              {authError && (
                <div
                  className="animate-in fade-in zoom-in-95 duration-300"
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
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
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
                  </div>

                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
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
                  </div>

                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
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

                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
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
                  </div>

                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-700">
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
                  </div>

                  <div className="flex items-start space-x-2 pt-1 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-1000">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={setAgreedToTerms}
                      className="mt-0.5 h-4 w-4 border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <label
                      htmlFor="terms"
                      className="text-xs text-muted-foreground cursor-pointer leading-relaxed"
                    >
                      I agree to the{" "}
                      <Link to="/terms" className="text-primary hover:underline font-medium">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-primary hover:underline font-medium">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-1000">
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting || loading || !agreedToTerms}
                      className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl group relative overflow-hidden disabled:opacity-50 text-sm"
                    >
                      <div className="relative z-10 flex items-center justify-center">
                        {form.formState.isSubmitting || loading ? (
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"
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
                  </div>
                </form>
              </Form>

              <div
                className="text-center pt-2 border-t border-border animate-in fade-in slide-in-from-bottom-4 duration-500 delay-1000"
              >
                <p className="text-muted-foreground text-xs">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Logo */}
          <div
            className="lg:hidden text-center mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-700"
          >
            <div className="flex items-center justify-center space-x-1">
              <span className="font-bold text-base text-foreground">SportsBuddy</span>
              <Zap className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Your sports community awaits
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
