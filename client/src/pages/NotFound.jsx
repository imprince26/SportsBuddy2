import { useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Home,
  Calendar,
  ArrowLeft,
  Search,
  Compass,
  Trophy,
  Users,
  Dumbbell,
  Zap,
  Sparkles,
  ArrowRight,
  RefreshCw
} from 'lucide-react'
import { Button } from "@/components/ui/button"

const NotFound = () => {
  // Page Title
  useEffect(() => {
    document.title = '404 - Page Not Found | SportsBuddy'
  }, [])

  const quickActions = [
    {
      title: "Browse Events",
      description: "Discover amazing sports events",
      icon: Calendar,
      href: "/events",
      gradient: "from-primary to-primary",
      color: "blue"
    },
    {
      title: "Find Athletes",
      description: "Connect with sports buddies",
      icon: Users,
      href: "/athletes",
      gradient: "from-green-500 to-green-600",
      color: "green"
    },
    {
      title: "View Dashboard",
      description: "Check your activity",
      icon: Trophy,
      href: "/dashboard",
      gradient: "from-secondary to-secondary",
      color: "purple"
    },
    {
      title: "Sports Centers",
      description: "Find nearby facilities",
      icon: Dumbbell,
      href: "/venues",
      gradient: "from-orange-500 to-orange-600",
      color: "orange"
    }
  ]

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8 relative z-10 min-h-screen flex items-center justify-center">
        <div className="text-center w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Main 404 Section */}
          <div className="mb-16">
            {/* 404 Number */}
            <div className="relative mb-8">
              <div className="text-[12rem] md:text-[16rem] lg:text-[20rem] font-black text-zinc-200 dark:text-zinc-800 leading-none select-none">
                404
              </div>

              {/* Floating Sports Icons */}
              <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-xl animate-bounce [animation-delay:-0.3s]">
                <Trophy className="w-8 h-8 text-white" />
              </div>

              <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-xl animate-bounce [animation-delay:-0.5s]">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>

              <div className="absolute bottom-1/4 left-1/3 w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                <Compass className="w-7 h-7 text-white" />
              </div>
            </div>

            {/* Header Text */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 mb-6 shadow-sm">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Oops! Page Lost in the Game</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-zinc-900 dark:text-white leading-tight">
                Page Not Found
              </h1>

              <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-8">
                Looks like this page decided to take a timeout! Don't worry, there are plenty of
                other exciting sports adventures waiting for you.
              </p>

              {/* Stats Pills */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-full px-4 py-2 border border-blue-200 dark:border-blue-800">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-zinc-900 dark:text-white">1000+ Events</span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 rounded-full px-4 py-2 border border-green-200 dark:border-green-800">
                  <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-zinc-900 dark:text-white">50K+ Athletes</span>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 rounded-full px-4 py-2 border border-purple-200 dark:border-purple-800">
                  <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium text-zinc-900 dark:text-white">25+ Sports</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-16">
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-14 px-8">
                <Link to="/" className="flex items-center gap-3">
                  <Home className="w-5 h-5" />
                  <span className="font-medium">Back to Home</span>
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-14 px-8 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <Link to="/events" className="flex items-center gap-3">
                  <Search className="w-5 h-5" />
                  <span className="font-medium">Find Events</span>
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => window.history.back()}
                className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-14 px-8 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <ArrowLeft className="w-5 h-5 mr-3" />
                <span className="font-medium">Go Back</span>
              </Button>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-4">
                  Popular Destinations
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                  While you're here, check out these popular sections of SportsBuddy
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, index) => (
                  <Link
                    key={action.title}
                    to={action.href}
                    className="block p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 transition-all duration-300 group bg-zinc-50 dark:bg-zinc-900/50 hover:shadow-md"
                  >
                    <div className="relative mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                        <action.icon className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                      {action.description}
                    </p>

                    <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:gap-2 transition-all">
                      <span>Explore</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Help */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-sm">
              <span>Still need help?</span>
              <Link
                to="/contact"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-1 transition-colors"
              >
                Contact Support
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <button
        className="fixed bottom-6 right-6 w-12 h-12 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110 active:scale-95"
        onClick={() => window.location.reload()}
        title="Refresh Page"
      >
        <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
      </button>
    </div>
  )
}

export default NotFound
