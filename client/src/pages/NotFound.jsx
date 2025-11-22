import { useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Home,
  ArrowLeft,
  Search,
  HelpCircle,
  MoveRight
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const NotFound = () => {
  useEffect(() => {
    document.title = '404 - Page Not Found | SportsBuddy'
  }, [])

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden bg-background">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] -z-10" />
      
      {/* Decorative Blur Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />

      <div className="container max-w-4xl px-4 py-16 text-center relative z-10">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* 404 Graphic */}
          <div className="relative inline-block">
            <h1 className="text-[10rem] md:text-[12rem] font-black text-primary/5 leading-none select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-primary/10 p-6 rounded-full backdrop-blur-sm border border-primary/20">
                <Search className="w-12 h-12 text-primary" />
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              We couldn't find that page
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="h-12 px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-full border-2 hover:bg-secondary/50">
              <Link to="/events">
                <Search className="w-4 h-4 mr-2" />
                Browse Events
              </Link>
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            {[
              { title: "Help Center", desc: "Guides and FAQs", href: "/help", icon: HelpCircle },
              { title: "Find Athletes", desc: "Connect with others", href: "/athletes", icon: Search },
              { title: "Go Back", desc: "Previous page", action: () => window.history.back(), icon: ArrowLeft },
            ].map((item, i) => (
              <Card 
                key={i}
                className="p-4 hover:bg-secondary/50 transition-colors cursor-pointer group border-border/50 shadow-sm hover:shadow-md"
                onClick={item.action ? item.action : undefined}
              >
                {item.href ? (
                  <Link to={item.href} className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <MoveRight className="w-4 h-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <MoveRight className="w-4 h-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
