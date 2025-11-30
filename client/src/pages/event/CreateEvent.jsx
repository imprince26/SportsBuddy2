import { useState, useEffect, useCallback } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useVenue } from "@/hooks/useVenue"
import { ChevronLeft, Eye, CheckCircle, Camera, FileText, Settings, ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { eventSchema, defaultEventValues } from "@/schemas/eventSchema"
import EventCreateForm from "@/components/events/EventCreateForm"

const CreateEventForm = () => {
  const { getVenues } = useVenue()
  const [completionProgress, setCompletionProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("basic")

  const form = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: defaultEventValues,
  })

  // Load venues on component mount
  useEffect(() => {
    getVenues()
  }, [])

  const steps = [
    {
      id: "basic",
      title: "Basic Info",
      icon: FileText,
      description: "Event name, category & description"
    },
    {
      id: "details",
      title: "Event Details",
      icon: Settings,
      description: "Date, time & location"
    },
    {
      id: "media",
      title: "Media & Rules",
      icon: Camera,
      description: "Images, rules & equipment"
    },
    {
      id: "review",
      title: "Review",
      icon: Eye,
      description: "Final review & publish"
    },
  ]

  // Page Title
  useEffect(() => {
    document.title = "Create Event - SportsBuddy"
  }, [])

  // Calculate completion progress
  const calculateProgress = useCallback(() => {
    const values = form.getValues()
    let completed = 0
    const total = 10

    if (values.name?.length >= 3) completed++
    if (values.category) completed++
    if (values.description?.length >= 20) completed++
    if (values.date) completed++
    if (values.time) completed++
    if (values.location.address?.length >= 5) completed++
    if (values.location.city?.length >= 2) completed++
    if (values.maxParticipants >= 2) completed++
    if (values.difficulty) completed++
    if (values.eventType) completed++

    setCompletionProgress((completed / total) * 100)
  }, [form])

  // Watch form changes
  useEffect(() => {
    const subscription = form.watch(() => calculateProgress())
    return () => subscription.unsubscribe()
  }, [form, calculateProgress])

  const getStepIcon = (step, index) => {
    const StepIcon = step.icon
    const isActive = activeTab === step.id
    const isCompleted = steps.findIndex(s => s.id === activeTab) > index

    return (
      <div
        className={cn(
          "relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
          isActive
            ? "bg-primary text-white shadow-lg scale-110"
            : isCompleted
              ? "bg-primary text-white"
              : "bg-slate-900 text-slate-400 border border-slate-800"
        )}
      >
        {isCompleted ? (
          <CheckCircle className="w-6 h-6" />
        ) : (
          <StepIcon className="w-6 h-6" />
        )}
        {isActive && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="animate-in fade-in duration-500">
          {/* Header */}
          <div className="mb-6 sm:mb-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <Button
                variant="ghost"
                asChild
                className="p-1 sm:p-2 hover:bg-accent rounded-lg sm:rounded-xl text-muted-foreground hover:text-foreground"
              >
                <Link to="/events">
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                      Create New Event
                    </h1>
                    <p className="text-muted-foreground text-sm sm:text-lg">
                      Bring your sports community together with an amazing event
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <Card className="bg-card border-border shadow-lg sm:shadow-xl">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-0">
                    <div>
                      <span className="font-semibold text-foreground text-base sm:text-lg">
                        Event Creation Progress
                      </span>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Fill in all required fields to create your event
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-bold text-green-400">
                      {Math.round(completionProgress)}%
                    </span>
                    <p className="text-xs sm:text-sm text-muted-foreground">Complete</p>
                  </div>
                </div>
                <div className="relative">
                  <Progress value={completionProgress} className="h-2 sm:h-3 bg-muted" />
                  <div
                    className="absolute inset-0 bg-primary rounded-full opacity-20 blur-sm"
                    style={{ width: `${completionProgress}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step Navigation */}
          <div className="mb-8 animate-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setActiveTab(step.id)}
                  className={cn(
                    "p-4 rounded-xl border transition-all duration-300 text-left group hover:-translate-y-0.5 active:scale-95",
                    activeTab === step.id
                      ? "border-primary bg-card shadow-lg sm:shadow-xl scale-[1.02]"
                      : "border-border bg-card/50 hover:border-primary/50 hover:shadow-md"
                  )}
                >
                  <div className="flex items-center gap-4 mb-3">
                    {getStepIcon(step, index)}
                    <div className="flex-1">
                      <h3
                        className={cn(
                          "font-semibold text-base sm:text-lg transition-colors",
                          activeTab === step.id ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">{step.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Step {index + 1} of {steps.length}
                    </span>
                    {activeTab === step.id && <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Form */}
          <EventCreateForm activeTab={activeTab} setActiveTab={setActiveTab} completionProgress={completionProgress} setCompletionProgress={setCompletionProgress} form={form} />
        </div>
      </div>
    </div>
  )
}

export default CreateEventForm
