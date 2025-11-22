import { useEffect, useState } from "react"
import {
  Shield,
  Lock,
  Eye,
  UserCheck,
  Globe,
  Database,
  Cookie,
  Settings,
  Mail,
  Phone,
  MapPin,
  Download,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Users,
  FileText,
  Key,
  Trash2,
  Share2,
  Bell,
  Heart,
  Star,
  Trophy,
  Zap,
  Target,
  Search,
  Filter,
  RotateCcw,
  Edit,
  Cloud,
  Server,
  Smartphone,
  Activity
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link } from "react-router-dom"

const Privacy = () => {
  const [activeSection, setActiveSection] = useState("")
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("platform")

  useEffect(() => {
    document.title = "Privacy Policy - SportsBuddy"
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
  const effectiveDate = "February 1, 2025"

  const tableOfContents = [
    { id: "overview", title: "Privacy Overview", icon: Eye },
    { id: "collection", title: "Data Collection", icon: Database },
    { id: "usage", title: "How We Use Data", icon: Settings },
    { id: "sharing", title: "Data Sharing", icon: Share2 },
    { id: "storage", title: "Data Storage & Security", icon: Shield },
    { id: "cookies", title: "Cookies & Tracking", icon: Cookie },
    { id: "rights", title: "Your Privacy Rights", icon: UserCheck },
    { id: "children", title: "Children's Privacy", icon: Users },
    { id: "international", title: "International Transfers", icon: Globe },
    { id: "updates", title: "Policy Updates", icon: Bell },
    { id: "contact", title: "Contact Us", icon: Mail }
  ]

  const dataTypes = [
    {
      category: "Personal Information",
      icon: UserCheck,
      color: "blue",
      items: [
        "Full name and username",
        "Email address and phone number",
        "Date of birth and gender",
        "Profile photo and bio",
        "Location and address details"
      ]
    },
    {
      category: "Activity Data",
      icon: Activity,
      color: "green",
      items: [
        "Sports and fitness activities",
        "Event participation history",
        "Exercise and workout logs",
        "Performance metrics",
        "Social interactions and messages"
      ]
    },
    {
      category: "Device Information",
      icon: Smartphone,
      color: "purple",
      items: [
        "Device type and operating system",
        "IP address and location data",
        "Browser type and version",
        "App usage patterns",
        "Crash reports and diagnostics"
      ]
    },
    {
      category: "Preference Data",
      icon: Settings,
      color: "orange",
      items: [
        "Notification preferences",
        "Privacy and security settings",
        "Content preferences",
        "Language and timezone",
        "Accessibility options"
      ]
    }
  ]

  const privacyRights = [
    {
      right: "Access Your Data",
      description: "Request a copy of all personal data we have about you",
      icon: Eye,
      action: "Download Data"
    },
    {
      right: "Correct Information",
      description: "Update or correct any inaccurate personal information",
      icon: Edit,
      action: "Edit Profile"
    },
    {
      right: "Delete Account",
      description: "Request deletion of your account and associated data",
      icon: Trash2,
      action: "Delete Account"
    },
    {
      right: "Data Portability",
      description: "Export your data in a machine-readable format",
      icon: Download,
      action: "Export Data"
    },
    {
      right: "Opt-out Communications",
      description: "Unsubscribe from marketing emails and notifications",
      icon: Bell,
      action: "Manage Preferences"
    },
    {
      right: "Restrict Processing",
      description: "Limit how we process your personal information",
      icon: Filter,
      action: "Contact Support"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-green-50/30 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-green-950/20" />

        {/* Animated Privacy Icons */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 dark:bg-blue-300/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Floating Privacy Icons */}
        {[Shield, Lock, Eye, UserCheck, Database].map((Icon, i) => (
          <div
            key={i}
            className="absolute text-blue-200/10 dark:text-blue-400/15 animate-bounce"
            style={{
              left: `${15 + (i * 18) % 70}%`,
              top: `${20 + (i * 30) % 60}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${5 + i * 0.5}s`,
            }}
          >
            <Icon size={20 + (i % 3) * 8} />
          </div>
        ))}
      </div>

      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 z-50 origin-left transition-transform duration-100 ease-out"
        style={{ transform: `scaleX(${scrollProgress / 100})` }}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div
          className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-700"
        >
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Header Card */}
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                        Privacy Policy
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Last updated: {lastUpdated}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      GDPR Compliant
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700">
                      <Globe className="w-3 h-3 mr-1" />
                      Global
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                    Privacy at a Glance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Data Encryption</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                      256-bit SSL
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Data Retention</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                      User Controlled
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Third-party Sharing</span>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                      Minimal
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">User Rights</span>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                      Full Control
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Table of Contents */}
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Contents
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
                    Privacy Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-gray-200/50 dark:border-gray-700/50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download My Data
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-gray-200/50 dark:border-gray-700/50"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Privacy Settings
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-gray-200/50 dark:border-gray-700/50"
                    asChild
                  >
                    <Link to="/contact">
                      <Mail className="w-4 h-4 mr-2" />
                      Contact DPO
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <CardHeader className="border-b border-gray-200/50 dark:border-gray-700/50 pb-6">
                <div
                  className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700"
                >
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                        Privacy Policy
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">
                        Your Privacy, Our Commitment
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
                      <Bell className="w-4 h-4" />
                      Effective: {effectiveDate}
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Read time: ~12 min
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      At SportsBuddy, we take your privacy seriously. This policy explains how we collect,
                      use, and protect your personal information when you use our sports community platform.
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8 space-y-12">
                {/* Section 1: Privacy Overview */}
                <section
                  id="overview"
                  data-section="overview"
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      1. Privacy Overview
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200/50 dark:border-green-700/50">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                            What We Do
                          </h3>
                          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                            <li>• Protect your personal data with enterprise-grade security</li>
                            <li>• Give you full control over your information</li>
                            <li>• Use data only to improve your SportsBuddy experience</li>
                            <li>• Comply with global privacy regulations (GDPR, CCPA)</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200/50 dark:border-blue-700/50">
                      <div className="flex items-start gap-3">
                        <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                            What We Don't Do
                          </h3>
                          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                            <li>• Sell your personal data to third parties</li>
                            <li>• Share data without your explicit consent</li>
                            <li>• Use your data for unrelated purposes</li>
                            <li>• Keep data longer than necessary</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700/50">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
                          Your Privacy Rights
                        </h4>
                        <p className="text-purple-700 dark:text-purple-300 text-sm">
                          You have the right to access, correct, delete, or transfer your data at any time.
                          We provide easy-to-use tools to exercise these rights directly from your account settings.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator className="my-8" />

                {/* Section 2: Data Collection */}
                <section
                  id="collection"
                  data-section="collection"
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      2. Information We Collect
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {dataTypes.map((type, index) => (
                      <div
                        key={index}
                        className={`bg-${type.color}-50 dark:bg-${type.color}-900/20 rounded-lg p-4 border border-${type.color}-200/50 dark:border-${type.color}-700/50 hover:scale-[1.02] transition-transform duration-200`}
                      >
                        <div className="flex items-start gap-3">
                          <type.icon className={`w-5 h-5 text-${type.color}-600 dark:text-${type.color}-400 mt-1 flex-shrink-0`} />
                          <div className="flex-1">
                            <h4 className={`font-semibold text-${type.color}-800 dark:text-${type.color}-300 mb-3`}>
                              {type.category}
                            </h4>
                            <ul className={`text-sm text-${type.color}-700 dark:text-${type.color}-300 space-y-1`}>
                              {type.items.map((item, itemIndex) => (
                                <li key={itemIndex} className="flex items-start gap-2">
                                  <div className={`w-1.5 h-1.5 bg-${type.color}-500 rounded-full mt-2 flex-shrink-0`} />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700/50">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
                          Data Collection Methods
                        </h4>
                        <p className="text-amber-700 dark:text-amber-300 text-sm mb-2">
                          We collect information when you:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-amber-700 dark:text-amber-300">
                          <div>• Create and update your profile</div>
                          <div>• Participate in events and activities</div>
                          <div>• Use our mobile app or website</div>
                          <div>• Contact our support team</div>
                          <div>• Interact with other users</div>
                          <div>• Enable location services</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator className="my-8" />

                {/* Section 3: How We Use Data */}
                <section
                  id="usage"
                  data-section="usage"
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      3. How We Use Your Information
                    </h2>
                  </div>

                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800">
                      <TabsTrigger value="platform" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Platform</TabsTrigger>
                      <TabsTrigger value="communication" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Communication</TabsTrigger>
                      <TabsTrigger value="safety" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Safety</TabsTrigger>
                      <TabsTrigger value="improvement" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Improvement</TabsTrigger>
                    </TabsList>

                    <TabsContent value="platform" className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { icon: Users, title: "Profile Management", desc: "Create and maintain your sports profile" },
                          { icon: Search, title: "Discovery", desc: "Help you find relevant events and users" },
                          { icon: Target, title: "Personalization", desc: "Customize your experience based on preferences" },
                          { icon: Activity, title: "Progress Tracking", desc: "Monitor your fitness and sports activities" }
                        ].map((item, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <item.icon className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1" />
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="communication" className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { icon: Mail, title: "Notifications", desc: "Send you important updates and alerts" },
                          { icon: Bell, title: "Event Updates", desc: "Notify about event changes and reminders" },
                          { icon: Heart, title: "Community", desc: "Facilitate connections with other users" },
                          { icon: Star, title: "Achievements", desc: "Celebrate your sports milestones" }
                        ].map((item, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <item.icon className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1" />
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="safety" className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { icon: Shield, title: "Security", desc: "Protect against fraud and unauthorized access" },
                          { icon: Eye, title: "Monitoring", desc: "Detect and prevent harmful behavior" },
                          { icon: AlertTriangle, title: "Compliance", desc: "Ensure adherence to community guidelines" },
                          { icon: Lock, title: "Verification", desc: "Verify user identity and authenticity" }
                        ].map((item, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <item.icon className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1" />
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="improvement" className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { icon: Zap, title: "Performance", desc: "Optimize app speed and functionality" },
                          { icon: Trophy, title: "Features", desc: "Develop new sports and fitness features" },
                          { icon: Target, title: "Analytics", desc: "Understand usage patterns and preferences" },
                          { icon: RotateCcw, title: "Bug Fixes", desc: "Identify and resolve technical issues" }
                        ].map((item, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <item.icon className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1" />
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </section>

                <Separator className="my-8" />

                {/* Section 4: Data Sharing */}
                <section
                  id="sharing"
                  data-section="sharing"
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <Share2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      4. Information Sharing
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-700/50">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2 text-lg">
                            We Do NOT Sell Your Data
                          </h3>
                          <p className="text-red-700 dark:text-red-300">
                            SportsBuddy has never sold and will never sell your personal information to third parties.
                            Your data is not a commodity – it's your property that we help you manage.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          When We Share Data
                        </h4>
                        <div className="space-y-3">
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                            <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">With Your Consent</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">When you explicitly allow us to share specific information</div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                            <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">Service Providers</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">With trusted partners who help us operate SportsBuddy</div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                            <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">Legal Requirements</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">When required by law or to protect user safety</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          How We Protect Shared Data
                        </h4>
                        <div className="space-y-3">
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                            <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">Data Minimization</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Share only what's necessary for specific purposes</div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                            <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">Contractual Protection</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">All partners sign strict data protection agreements</div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                            <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">Regular Audits</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Monitor and verify proper data handling practices</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator className="my-8" />

                {/* Section 5: Data Storage & Security */}
                <section
                  id="storage"
                  data-section="storage"
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      5. Data Storage & Security
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
                      <div className="flex items-center gap-3 mb-3">
                        <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300">Encryption</h4>
                      </div>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• 256-bit SSL encryption in transit</li>
                        <li>• AES-256 encryption at rest</li>
                        <li>• End-to-end encrypted messaging</li>
                        <li>• Encrypted database backups</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200/50 dark:border-green-700/50">
                      <div className="flex items-center gap-3 mb-3">
                        <Server className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <h4 className="font-semibold text-green-800 dark:text-green-300">Infrastructure</h4>
                      </div>
                      <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                        <li>• SOC 2 Type II certified data centers</li>
                        <li>• Multi-region data redundancy</li>
                        <li>• 24/7 security monitoring</li>
                        <li>• Regular security assessments</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200/50 dark:border-purple-700/50">
                      <div className="flex items-center gap-3 mb-3">
                        <Key className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        <h4 className="font-semibold text-purple-800 dark:text-purple-300">Access Control</h4>
                      </div>
                      <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                        <li>• Multi-factor authentication</li>
                        <li>• Role-based access controls</li>
                        <li>• Regular access reviews</li>
                        <li>• Audit logs for all data access</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Cloud className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      Data Storage Locations
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-800 dark:text-gray-300 mb-2">Primary Regions</h5>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <li>• United States (Primary)</li>
                          <li>• European Union (GDPR Compliance)</li>
                          <li>• Asia-Pacific (Regional Performance)</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800 dark:text-gray-300 mb-2">Data Residency</h5>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <li>• EU users: Data stored in EU</li>
                          <li>• Cross-border transfers protected</li>
                          <li>• Standard Contractual Clauses</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator className="my-8" />

                {/* Section 6: Your Privacy Rights */}
                <section
                  id="rights"
                  data-section="rights"
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      6. Your Privacy Rights
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {privacyRights.map((right, index) => (
                      <div
                        key={index}
                        className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                            <right.icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {right.right}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {right.description}
                            </p>
                            <Button size="sm" variant="outline" className="text-xs">
                              {right.action}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-6 border border-indigo-200 dark:border-indigo-700/50">
                    <div className="flex items-start gap-3">
                      <Info className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">
                          How to Exercise Your Rights
                        </h4>
                        <p className="text-indigo-700 dark:text-indigo-300 text-sm mb-3">
                          You can exercise most privacy rights directly from your account settings.
                          For more complex requests, contact our Data Protection Officer.
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Settings className="w-4 h-4 mr-2" />
                            Privacy Settings
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="w-4 h-4 mr-2" />
                            Contact DPO
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator className="my-8" />
                {/* Section 7: Cookies & Tracking */}
                <section
                  id="cookies"
                  data-section="cookies"
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                      <Cookie className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      7. Cookies & Tracking Technologies
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
                      <div className="flex items-center gap-3 mb-3">
                        <Cookie className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300">Essential Cookies</h4>
                      </div>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Authentication and login sessions</li>
                        <li>• Security and fraud prevention</li>
                        <li>• Core platform functionality</li>
                        <li>• User preference storage</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200/50 dark:border-green-700/50">
                      <div className="flex items-center gap-3 mb-3">
                        <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <h4 className="font-semibold text-green-800 dark:text-green-300">Analytics Cookies</h4>
                      </div>
                      <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                        <li>• Usage patterns and statistics</li>
                        <li>• Performance monitoring</li>
                        <li>• Feature effectiveness tracking</li>
                        <li>• Error reporting and debugging</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200/50 dark:border-purple-700/50">
                      <div className="flex items-center gap-3 mb-3">
                        <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        <h4 className="font-semibold text-purple-800 dark:text-purple-300">Personalization</h4>
                      </div>
                      <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                        <li>• Content recommendations</li>
                        <li>• Language and region settings</li>
                        <li>• Customized user interface</li>
                        <li>• Sports interest tracking</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200/50 dark:border-orange-700/50">
                      <div className="flex items-center gap-3 mb-3">
                        <Share2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        <h4 className="font-semibold text-orange-800 dark:text-orange-300">Social & Marketing</h4>
                      </div>
                      <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                        <li>• Social media integration</li>
                        <li>• Marketing campaign tracking</li>
                        <li>• Third-party advertising (optional)</li>
                        <li>• Referral program tracking</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      Cookie Management
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      You can control cookies through your browser settings or our cookie preference center.
                      Note that disabling certain cookies may impact platform functionality.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Cookie Preferences
                      </Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Browser Settings
                      </Button>
                    </div>
                  </div>
                </section>

                <Separator className="my-8" />

                {/* Section 8: Children's Privacy */}
                <section
                  id="children"
                  data-section="children"
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      8. Children's Privacy
                    </h2>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-700/50">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2 text-lg">
                          Age Requirement: 13+
                        </h3>
                        <p className="text-red-700 dark:text-red-300 mb-4">
                          SportsBuddy is designed for users 13 years and older. We do not knowingly collect
                          personal information from children under 13 without verified parental consent
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        For Ages 13-17
                      </h4>
                      <div className="space-y-3">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                          <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">Parental Consent</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Required for users under 16 in certain regions</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                          <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">Enhanced Privacy</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Additional privacy protections and restricted features</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                          <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">Content Filtering</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Age-appropriate content and interaction limits</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                        Parental Rights
                      </h4>
                      <div className="space-y-3">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                          <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">Access & Review</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">View your child's personal information</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                          <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">Deletion Request</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Request deletion of your child's account</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                          <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">Consent Management</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Modify or withdraw consent at any time</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700/50">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                          Contact for Child Privacy Matters
                        </h4>
                        <p className="text-blue-700 dark:text-blue-300 text-sm mb-2">
                          If you believe your child under 13 has provided personal information to us,
                          please contact us immediately.
                        </p>
                        <a href="mailto:privacy@sportsbuddy.com" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                          privacy@sportsbuddy.com
                        </a>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator className="my-8" />

                {/* Section 9: International Transfers */}
                <section
                  id="international"
                  data-section="international"
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      9. International Data Transfers
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
                      <div className="flex items-center gap-3 mb-3">
                        <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300">GDPR Compliance</h4>
                      </div>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Standard Contractual Clauses</li>
                        <li>• Adequacy decisions</li>
                        <li>• Data transfer impact assessments</li>
                        <li>• EU-US Data Privacy Framework</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200/50 dark:border-green-700/50">
                      <div className="flex items-center gap-3 mb-3">
                        <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <h4 className="font-semibold text-green-800 dark:text-green-300">Safeguards</h4>
                      </div>
                      <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                        <li>• Encryption in transit and at rest</li>
                        <li>• Contractual data protection obligations</li>
                        <li>• Regular compliance audits</li>
                        <li>• Data minimization practices</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200/50 dark:border-purple-700/50">
                      <div className="flex items-center gap-3 mb-3">
                        <Key className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        <h4 className="font-semibold text-purple-800 dark:text-purple-300">Your Rights</h4>
                      </div>
                      <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                        <li>• Object to cross-border transfers</li>
                        <li>• Request data localization</li>
                        <li>• Withdraw consent for transfers</li>
                        <li>• File complaints with authorities</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      Data Processing Locations
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-800 dark:text-gray-300 mb-2">Primary Processing</h5>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <li>🇺🇸 United States (Primary servers)</li>
                          <li>🇪🇺 European Union (GDPR compliance)</li>
                          <li>🇨🇦 Canada (Backup and redundancy)</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800 dark:text-gray-300 mb-2">Service Providers</h5>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <li>All bound by strict data protection agreements</li>
                          <li>Regular compliance assessments</li>
                          <li>Same security standards as SportsBuddy</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator className="my-8" />

                {/* Section 10: Policy Updates */}
                <section
                  id="updates"
                  data-section="updates"
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      10. Policy Updates & Changes
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
                      <div className="flex items-start gap-3">
                        <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                            How We Notify You
                          </h3>
                          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                            <li>• Email notification to registered users</li>
                            <li>• In-app notifications and banners</li>
                            <li>• Website announcement</li>
                            <li>• 30-day advance notice for major changes</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200/50 dark:border-green-700/50">
                      <div className="flex items-start gap-3">
                        <Clock className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                            Types of Changes
                          </h3>
                          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                            <li>• Minor clarifications (immediate effect)</li>
                            <li>• Feature updates (7-day notice)</li>
                            <li>• Significant policy changes (30-day notice)</li>
                            <li>• Legal compliance updates (as required)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700/50">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
                          Your Choices When We Update
                        </h4>
                        <p className="text-amber-700 dark:text-amber-300 text-sm mb-3">
                          If you don't agree with significant policy changes, you can delete your account
                          before the changes take effect. Continued use of SportsBuddy after the effective
                          date means you accept the updated policy.
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Download My Data
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-700/50">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">
                          Version Control
                        </h4>
                        <p className="text-indigo-700 dark:text-indigo-300 text-sm">
                          Each version of our Privacy Policy is archived and accessible. You can review
                          previous versions and track changes over time. The current version date is always
                          displayed at the top of this document.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
                <Separator className="my-8" />
                {/* Contact Section */}
                <section
                  id="contact"
                  data-section="contact"
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      11. Contact Our Privacy Team
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center gap-3 mb-3">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Data Protection Officer</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Privacy questions and requests
                      </p>
                      <a href="mailto:privacy@sportsbuddy.com" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        privacy@sportsbuddy.com
                      </a>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center gap-3 mb-3">
                        <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Privacy Hotline</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Mon-Fri 9AM-6PM EST
                      </p>
                      <a href="tel:+11234567890" className="text-sm text-green-600 dark:text-green-400 hover:underline">
                        +1 (123) 456-7890
                      </a>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center gap-3 mb-3">
                        <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Mailing Address</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        SportsBuddy Privacy Team<br />
                        123 Privacy Avenue<br />
                        Ahmedabad, Gujarat 380001
                      </p>
                    </div>
                  </div>
                </section>

                {/* Footer */}
                <div
                  className="mt-12 pt-8 border-t border-gray-200/50 dark:border-gray-700/50"
                >
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            Your Privacy Matters
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            We're committed to protecting your privacy and giving you control over your data.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/terms">
                            <FileText className="w-4 h-4 mr-2" />
                            Terms of Service
                          </Link>
                        </Button>
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                          <Settings className="w-4 h-4 mr-2" />
                          Privacy Settings
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="text-center mt-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      © 2025 SportsBuddy. All rights reserved. | Privacy Policy v3.1
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

export default Privacy
