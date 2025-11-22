import { useEffect, useState } from "react"
import {
  Shield,
  FileText,
  Clock,
  Users,
  Lock,
  AlertTriangle,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Eye,
  UserCheck,
  Globe,
  Scale,
  Heart,
  Trophy,
  Zap,
  Bell,
  Target,
  Star,
  Download,
  ExternalLink,
  Calendar,
  Gavel,
  Book,
  Info
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Link } from "react-router-dom"

const Terms = () => {
  const [activeSection, setActiveSection] = useState("")
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    document.title = "Terms of Service - SportsBuddy"
  }, [])

  // Handle scroll progress and active section
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      const currentScroll = window.pageYOffset
      setScrollProgress((currentScroll / totalScroll) * 100)

      // Find active section
      const sections = document.querySelectorAll("[data-section]")
      let current = ""

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        if (rect.top <= 100 && rect.bottom >= 100) {
          current = section.getAttribute("data-section")
        }
      })

      setActiveSection(current)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const lastUpdated = "January 26, 2025"

  const tableOfContents = [
    { id: "acceptance", title: "Acceptance of Terms", icon: CheckCircle },
    { id: "description", title: "Service Description", icon: Info },
    { id: "eligibility", title: "User Eligibility", icon: UserCheck },
    { id: "accounts", title: "User Accounts", icon: Users },
    { id: "conduct", title: "User Conduct", icon: Shield },
    { id: "content", title: "Content Guidelines", icon: FileText },
    { id: "privacy", title: "Privacy & Data", icon: Lock },
    { id: "events", title: "Event Participation", icon: Calendar },
    { id: "payments", title: "Payments & Fees", icon: Trophy },
    { id: "intellectual", title: "Intellectual Property", icon: Scale },
    { id: "liability", title: "Limitation of Liability", icon: AlertTriangle },
    { id: "termination", title: "Account Termination", icon: Gavel },
    { id: "modifications", title: "Terms Modifications", icon: Book },
    { id: "contact", title: "Contact Information", icon: Mail }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-blue-50/30 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-blue-950/20" />

        {/* Animated Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 dark:bg-blue-300/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${4 + Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Floating Legal Icons */}
        {[Shield, Scale, Book, Gavel].map((Icon, i) => (
          <div
            key={i}
            className="absolute text-purple-200/10 dark:text-purple-400/15 animate-bounce"
            style={{
              left: `${20 + (i * 20) % 60}%`,
              top: `${25 + (i * 25) % 50}%`,
              animationDuration: `${4 + i * 0.5}s`,
            }}
          >
            <Icon size={25 + (i % 2) * 10} />
          </div>
        ))}
      </div>

      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 z-50 origin-left transition-transform duration-100"
        style={{ transform: `scaleX(${scrollProgress / 100})` }}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div
          className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700"
        >
          {/* Sidebar - Table of Contents */}
          <div className="lg:col-span-1 animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
            <div className="sticky top-8 space-y-6">
              {/* Header Card */}
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Scale className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                        Terms of Service
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Last updated: {lastUpdated}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="w-fit bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active Agreement
                  </Badge>
                </CardHeader>
              </Card>

              {/* Table of Contents */}
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Book className="w-4 h-4" />
                    Table of Contents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {tableOfContents.map((item, index) => {
                    const Icon = item.icon
                    const isActive = activeSection === item.id

                    return (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 group hover:scale-[1.02] hover:translate-x-0.5 active:scale-[0.98] ${isActive
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? "text-blue-600 dark:text-blue-400" : "group-hover:text-gray-700 dark:group-hover:text-gray-300"}`} />
                          <span className="text-sm font-medium">
                            {index + 1}. {item.title}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-gray-200/50 dark:border-gray-700/50"
                    asChild
                  >
                    <Link to="/privacy">
                      <Lock className="w-4 h-4 mr-2" />
                      Privacy Policy
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-gray-200/50 dark:border-gray-700/50"
                    asChild
                  >
                    <Link to="/contact">
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Support
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-gray-200/50 dark:border-gray-700/50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <CardHeader className="border-b border-gray-200/50 dark:border-gray-700/50 pb-6">
                <div
                  className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Scale className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                        Terms of Service
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">
                        SportsBuddy Platform Agreement
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Last updated: {lastUpdated}
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Effective Worldwide
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Read time: ~15 min
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      Welcome to SportsBuddy! These Terms of Service govern your use of our platform.
                      By accessing or using SportsBuddy, you agree to be bound by these terms.
                      Please read them carefully.
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8 space-y-12">
                {/* Section 1: Acceptance of Terms */}
                <section
                  id="acceptance"
                  data-section="acceptance"
                  className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      1. Acceptance of Terms
                    </h2>
                  </div>

                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      By creating an account, accessing, or using any part of SportsBuddy's services,
                      you acknowledge that you have read, understood, and agree to be bound by these
                      Terms of Service and our Privacy Policy.
                    </p>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      If you do not agree to these terms, you must not use our services. Your continued
                      use of SportsBuddy constitutes acceptance of any modifications to these terms.
                    </p>

                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700/50">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
                            Important Notice
                          </h4>
                          <p className="text-amber-700 dark:text-amber-300 text-sm">
                            These terms include important provisions regarding liability limitations,
                            dispute resolution, and your rights and responsibilities.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator className="my-8" />

                {/* Section 2: Service Description */}
                <section
                  id="description"
                  data-section="description"
                  className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      2. Service Description
                    </h2>
                  </div>

                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      SportsBuddy is a digital platform that connects sports enthusiasts, enabling them to:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                      {[
                        { icon: Users, title: "Connect with Athletes", desc: "Find and connect with sports enthusiasts in your area" },
                        { icon: Calendar, title: "Discover Events", desc: "Browse and participate in various sports events and activities" },
                        { icon: Trophy, title: "Create Events", desc: "Organize and host your own sports events and competitions" },
                        { icon: Target, title: "Track Progress", desc: "Monitor your fitness journey and athletic achievements" }
                      ].map((feature, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
                          <div className="flex items-start gap-3">
                            <feature.icon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {feature.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {feature.desc}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      We reserve the right to modify, suspend, or discontinue any aspect of our services
                      at any time with reasonable notice to users.
                    </p>
                  </div>
                </section>

                <Separator className="my-8" />

                {/* Section 3: User Eligibility */}
                <section
                  id="eligibility"
                  data-section="eligibility"
                  className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      3. User Eligibility
                    </h2>
                  </div>

                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      To use SportsBuddy, you must:
                    </p>

                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Be at least 13 years old (or the minimum age required in your jurisdiction)
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Provide accurate and complete registration information
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Have the legal capacity to enter into binding agreements
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Comply with all applicable local, state, and federal laws
                        </span>
                      </li>
                    </ul>

                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700/50">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                            Prohibited Users
                          </h4>
                          <p className="text-red-700 dark:text-red-300 text-sm">
                            Users who have been previously banned, suspended, or removed from SportsBuddy
                            are prohibited from creating new accounts.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator className="my-8" />

                {/* Section 4: User Accounts */}
                <section
                  id="accounts"
                  data-section="accounts"
                  className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      4. User Accounts
                    </h2>
                  </div>

                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          Account Security
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li className="text-gray-700 dark:text-gray-300">
                            • Keep your password secure and confidential
                          </li>
                          <li className="text-gray-700 dark:text-gray-300">
                            • Use a strong, unique password
                          </li>
                          <li className="text-gray-700 dark:text-gray-300">
                            • Enable two-factor authentication when available
                          </li>
                          <li className="text-gray-700 dark:text-gray-300">
                            • Notify us immediately of unauthorized access
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                          Account Responsibilities
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li className="text-gray-700 dark:text-gray-300">
                            • Maintain accurate profile information
                          </li>
                          <li className="text-gray-700 dark:text-gray-300">
                            • One account per person
                          </li>
                          <li className="text-gray-700 dark:text-gray-300">
                            • Responsible for all account activity
                          </li>
                          <li className="text-gray-700 dark:text-gray-300">
                            • Update information when necessary
                          </li>
                        </ul>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      You are solely responsible for all activities that occur under your account.
                      SportsBuddy cannot and will not be liable for any loss or damage arising from
                      unauthorized use of your account.
                    </p>
                  </div>
                </section>

                <Separator className="my-8" />

                {/* Section 5: User Conduct */}
                <section
                  id="conduct"
                  data-section="conduct"
                  className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      5. User Conduct
                    </h2>
                  </div>

                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                      You agree to use SportsBuddy responsibly and respect other users.
                      The following behaviors are strictly prohibited:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {[
                        "Harassment, bullying, or threatening behavior",
                        "Posting offensive, discriminatory, or harmful content",
                        "Impersonating others or providing false information",
                        "Spamming or sending unsolicited messages",
                        "Attempting to hack or exploit our systems",
                        "Sharing personal information of other users",
                        "Promoting illegal activities or substances",
                        "Commercial activities without permission"
                      ].map((rule, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200/50 dark:border-red-700/30">
                          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-red-700 dark:text-red-300">
                            {rule}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700/50">
                      <div className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                            Community Guidelines
                          </h4>
                          <p className="text-blue-700 dark:text-blue-300 text-sm">
                            We encourage positive interactions, support for fellow athletes,
                            and creating an inclusive environment for all sports enthusiasts.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator className="my-8" />

                {/* Section 6: Content Guidelines */}
                <section
                  id="content"
                  data-section="content"
                  className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      6. Content Guidelines
                    </h2>
                  </div>

                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                      When posting content on SportsBuddy, you must ensure that your content:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          Acceptable Content
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <Star className="w-3 h-3 text-yellow-500 mt-1 flex-shrink-0" />
                            Sports-related discussions and activities
                          </li>
                          <li className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <Star className="w-3 h-3 text-yellow-500 mt-1 flex-shrink-0" />
                            Fitness tips and workout routines
                          </li>
                          <li className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <Star className="w-3 h-3 text-yellow-500 mt-1 flex-shrink-0" />
                            Event announcements and invitations
                          </li>
                          <li className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <Star className="w-3 h-3 text-yellow-500 mt-1 flex-shrink-0" />
                            Motivational and supportive messages
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                          Prohibited Content
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <AlertTriangle className="w-3 h-3 text-red-500 mt-1 flex-shrink-0" />
                            Copyrighted material without permission
                          </li>
                          <li className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <AlertTriangle className="w-3 h-3 text-red-500 mt-1 flex-shrink-0" />
                            False or misleading information
                          </li>
                          <li className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <AlertTriangle className="w-3 h-3 text-red-500 mt-1 flex-shrink-0" />
                            Inappropriate or explicit content
                          </li>
                          <li className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <AlertTriangle className="w-3 h-3 text-red-500 mt-1 flex-shrink-0" />
                            Spam or repetitive posts
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700/50">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                            Content Ownership
                          </h4>
                          <p className="text-blue-700 dark:text-blue-300 text-sm">
                            You retain ownership of your content, but grant SportsBuddy a license to use,
                            display, and distribute it on our platform for the purpose of providing our services.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator className="my-8" />

                {/* Section 7: Privacy & Data */}
                <section
                  id="privacy"
                  data-section="privacy"
                  className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                      <Lock className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      7. Privacy & Data Protection
                    </h2>
                  </div>

                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                      Your privacy is important to us. This section outlines how we handle your personal data:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {[
                        {
                          icon: Shield,
                          title: "Data Security",
                          desc: "We use industry-standard encryption and security measures to protect your personal information."
                        },
                        {
                          icon: Eye,
                          title: "Data Transparency",
                          desc: "You have the right to know what data we collect and how it's used for our services."
                        },
                        {
                          icon: UserCheck,
                          title: "Access Control",
                          desc: "You can access, update, or delete your personal data at any time through your account settings."
                        },
                        {
                          icon: Globe,
                          title: "Data Portability",
                          desc: "You can request a copy of your data or transfer it to another service when technically feasible."
                        }
                      ].map((item, index) => (
                        <div key={index} className="bg-violet-50 dark:bg-violet-900/10 rounded-lg p-4 border border-violet-200/50 dark:border-violet-700/30">
                          <div className="flex items-start gap-3">
                            <item.icon className="w-5 h-5 text-violet-600 dark:text-violet-400 mt-1 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {item.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700/50">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                            GDPR & Privacy Compliance
                          </h4>
                          <p className="text-green-700 dark:text-green-300 text-sm mb-2">
                            We comply with GDPR, CCPA, and other privacy regulations. For detailed information,
                            please review our comprehensive Privacy Policy.
                          </p>
                          <Button variant="outline" size="sm" className="mt-2" asChild>
                            <Link to="/privacy">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View Privacy Policy
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator className="my-8" />

                {/* Section 8: Event Participation */}
                <section
                  id="events"
                  data-section="events"
                  className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      8. Event Participation
                    </h2>
                  </div>

                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          Event Organizers
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li className="text-gray-700 dark:text-gray-300">
                            • Responsible for event safety and logistics
                          </li>
                          <li className="text-gray-700 dark:text-gray-300">
                            • Must provide accurate event information
                          </li>
                          <li className="text-gray-700 dark:text-gray-300">
                            • Should have appropriate insurance coverage
                          </li>
                          <li className="text-gray-700 dark:text-gray-300">
                            • Must comply with local laws and regulations
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                          Event Participants
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li className="text-gray-700 dark:text-gray-300">
                            • Participate at your own risk
                          </li>
                          <li className="text-gray-700 dark:text-gray-300">
                            • Follow event rules and guidelines
                          </li>
                          <li className="text-gray-700 dark:text-gray-300">
                            • Respect other participants and organizers
                          </li>
                          <li className="text-gray-700 dark:text-gray-300">
                            • Report any safety concerns immediately
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700/50 mb-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
                            Assumption of Risk
                          </h4>
                          <p className="text-amber-700 dark:text-amber-300 text-sm">
                            By participating in events through SportsBuddy, you acknowledge and assume all risks
                            associated with physical activities, including but not limited to injury, equipment damage,
                            or other losses.
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      SportsBuddy serves as a platform to connect users but is not responsible for the organization,
                      conduct, or outcomes of events. All interactions and agreements between users are independent
                      of SportsBuddy.
                    </p>
                  </div>
                </section>

                <Separator className="my-8" />

                {/* Section 9: Payments & Fees */}
                <section
                  id="payments"
                  data-section="payments"
                  className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      9. Payments & Fees
                    </h2>
                  </div>

                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200/50 dark:border-green-700/50">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Free Services</h4>
                        </div>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <li>• Basic account creation</li>
                          <li>• Event browsing</li>
                          <li>• Basic messaging</li>
                          <li>• Community participation</li>
                        </ul>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
                        <div className="flex items-center gap-2 mb-3">
                          <Star className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Premium Features</h4>
                        </div>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <li>• Advanced event creation</li>
                          <li>• Priority support</li>
                          <li>• Enhanced profile features</li>
                          <li>• Analytics and insights</li>
                        </ul>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200/50 dark:border-purple-700/50">
                        <div className="flex items-center gap-2 mb-3">
                          <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Event Fees</h4>
                        </div>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <li>• Set by event organizers</li>
                          <li>• Processed securely</li>
                          <li>• Refund policy applies</li>
                          <li>• Platform fee may apply</li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Payment Terms:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 text-sm">
                            All payments are processed through secure, PCI-compliant payment processors
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 text-sm">
                            Subscription fees are billed automatically on a recurring basis
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 text-sm">
                            You can cancel subscriptions at any time through your account settings
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 text-sm">
                            Refunds are subject to our refund policy and applicable laws
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <Separator className="my-8" />

                {/* Section 10: Intellectual Property */}
                <section
                  id="intellectual"
                  data-section="intellectual"
                  className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                      <Scale className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      10. Intellectual Property Rights
                    </h2>
                  </div>

                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          SportsBuddy's Rights
                        </h4>
                        <div className="space-y-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            SportsBuddy owns all rights to:
                          </p>
                          <ul className="space-y-2 text-sm">
                            <li className="text-gray-700 dark:text-gray-300">
                              • Platform design and functionality
                            </li>
                            <li className="text-gray-700 dark:text-gray-300">
                              • SportsBuddy branding and logos
                            </li>
                            <li className="text-gray-700 dark:text-gray-300">
                              • Software and technology
                            </li>
                            <li className="text-gray-700 dark:text-gray-300">
                              • Original content and materials
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                          Your Rights
                        </h4>
                        <div className="space-y-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            You retain ownership of:
                          </p>
                          <ul className="space-y-2 text-sm">
                            <li className="text-gray-700 dark:text-gray-300">
                              • Your original content and posts
                            </li>
                            <li className="text-gray-700 dark:text-gray-300">
                              • Your personal information
                            </li>
                            <li className="text-gray-700 dark:text-gray-300">
                              • Your photos and media uploads
                            </li>
                            <li className="text-gray-700 dark:text-gray-300">
                              • Your creative contributions
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700/50 mb-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                            License Grant
                          </h4>
                          <p className="text-blue-700 dark:text-blue-300 text-sm">
                            By posting content on SportsBuddy, you grant us a non-exclusive, worldwide,
                            royalty-free license to use, display, and distribute your content solely for
                            the purpose of operating and improving our platform.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700/50">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                            Copyright Infringement
                          </h4>
                          <p className="text-red-700 dark:text-red-300 text-sm">
                            We respect intellectual property rights. If you believe your copyright has been
                            infringed, please contact us with a detailed DMCA notice. We will investigate
                            and take appropriate action.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator className="my-8" />

                {/* Section 12: Account Termination */}
                <section
                  id="termination"
                  data-section="termination"
                  className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <Gavel className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      12. Account Termination
                    </h2>
                  </div>

                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          Voluntary Termination
                        </h4>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            You may terminate your account at any time by:
                          </p>
                          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <li>• Using the account deletion option in settings</li>
                            <li>• Contacting our support team</li>
                            <li>• Sending a written request via email</li>
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Gavel className="w-4 h-4 text-red-600 dark:text-red-400" />
                          Involuntary Termination
                        </h4>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            We may terminate accounts for:
                          </p>
                          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <li>• Violation of terms of service</li>
                            <li>• Harmful or abusive behavior</li>
                            <li>• Fraudulent or illegal activities</li>
                            <li>• Extended periods of inactivity</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Effects of Termination:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 text-sm">
                            Immediate loss of access to your account and all associated data
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 text-sm">
                            Cancellation of all active subscriptions and services
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 text-sm">
                            Forfeiture of any unused credits or benefits
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 text-sm">
                            Removal of your content from public areas of the platform
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">
                            Data Retention
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">
                            We may retain certain information as required by law or for legitimate business
                            purposes, even after account termination. Personal data will be handled according
                            to our Privacy Policy.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator className="my-8" />

                {/* Section 13: Terms Modifications */}
                <section
                  id="modifications"
                  data-section="modifications"
                  className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                      <Book className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      13. Terms Modifications
                    </h2>
                  </div>

                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                      SportsBuddy reserves the right to modify these Terms of Service at any time.
                      We will provide notice of significant changes through appropriate channels.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
                        <div className="flex items-center gap-2 mb-3">
                          <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Notification Methods</h4>
                        </div>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <li>• Email notifications to registered users</li>
                          <li>• In-app notifications and announcements</li>
                          <li>• Updates posted on our website</li>
                          <li>• Blog posts for major changes</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200/50 dark:border-green-700/50">
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Effective Timeline</h4>
                        </div>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <li>• Minor changes: Effective immediately</li>
                          <li>• Major changes: 30 days advance notice</li>
                          <li>• Policy changes: 14 days minimum notice</li>
                          <li>• Emergency updates: As legally required</li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Your Options:</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Continue Using:</span>
                            <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">
                              Continued use after changes indicates acceptance of new terms
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Object to Changes:</span>
                            <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">
                              Contact us within 30 days to discuss concerns
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Users className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Terminate Account:</span>
                            <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">
                              You may close your account if you disagree with changes
                            </span>
                          </div>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-700/50">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">
                            Version Control
                          </h4>
                          <p className="text-indigo-700 dark:text-indigo-300 text-sm">
                            Each version of our Terms of Service is archived and accessible. You can review
                            previous versions and track changes over time. The current version date is always
                            displayed at the top of this document.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator className="my-8" />

                {/* Section 11: Limitation of Liability */}
                <section
                  id="liability"
                  data-section="liability"
                  className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      11. Limitation of Liability
                    </h2>
                  </div>

                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-700/50 mb-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-3">
                            Important Legal Notice
                          </h4>
                          <p className="text-orange-700 dark:text-orange-300 leading-relaxed">
                            SportsBuddy provides its services "as is" and makes no warranties, express or implied.
                            We are not liable for any injuries, damages, or losses that may occur during sports
                            activities or events organized through our platform.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        <strong>Assumption of Risk:</strong> You acknowledge that participation in sports and
                        physical activities involves inherent risks of injury or damage. You voluntarily assume
                        all such risks.
                      </p>

                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        <strong>Third-Party Interactions:</strong> SportsBuddy is not responsible for the
                        actions, content, or behavior of other users or third parties you interact with
                        through our platform.
                      </p>

                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        <strong>Limitation of Damages:</strong> To the maximum extent permitted by law,
                        SportsBuddy's total liability shall not exceed the amount you paid us in the
                        12 months preceding the claim.
                      </p>
                    </div>
                  </div>
                </section>

                <Separator className="my-8" />

                {/* Contact Section */}
                <section
                  id="contact"
                  data-section="contact"
                  className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      14. Contact Information
                    </h2>
                  </div>

                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                      If you have questions about these Terms of Service or need support,
                      please contact us through any of the following methods:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center gap-3 mb-3">
                          <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Email</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          General inquiries and support
                        </p>
                        <a href="mailto:legal@sportsbuddy.com" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                          legal@sportsbuddy.com
                        </a>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center gap-3 mb-3">
                          <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Phone</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Business hours: Mon-Fri 9AM-6PM
                        </p>
                        <a href="tel:+11234567890" className="text-sm text-green-600 dark:text-green-400 hover:underline">
                          +1 (123) 456-7890
                        </a>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center gap-3 mb-3">
                          <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Address</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          123 Sports Avenue<br />
                          Athleticville, ST 12345<br />
                          Ahmedabad
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Footer */}
                <div
                  className="mt-12 pt-8 border-t border-gray-200/50 dark:border-gray-700/50 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            Thank you for choosing SportsBuddy
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            We're committed to providing a safe and enjoyable sports community platform.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/privacy">
                            <Lock className="w-4 h-4 mr-2" />
                            Privacy Policy
                          </Link>
                        </Button>
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
                          <Link to="/register">
                            <Star className="w-4 h-4 mr-2" />
                            Get Started
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="text-center mt-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      © 2025 SportsBuddy. All rights reserved. | Version 2.0
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Terms
