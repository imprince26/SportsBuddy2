import { useState, useEffect, useCallback } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "react-hot-toast"
import { useEvents } from "@/hooks/useEvents"
import { useVenue } from "@/hooks/useVenue"
import {
  Calendar, ImagePlus, X, ChevronLeft, Clock, MapPin, Users, Save, Eye, Upload, Plus,
  Trash2, CheckCircle, Sparkles, Award, Target, Shield, Camera,
  FileText, Settings, ArrowRight, Star, Trophy, AlertTriangle,
  MapPinIcon, UsersIcon, CalendarDays, Timer, Heart, Layers, IndianRupee, Building2, Zap, Flame
} from 'lucide-react'
import { VenueSelector } from "@/components/events/VenueSelector"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { eventSchema, defaultEventValues } from "@/schemas/eventSchema"

const CreateEventForm = () => {
  const navigate = useNavigate()
  const { createEvent } = useEvents()
  const { venues, getVenues, searchVenues } = useVenue()
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState([])
  const [imagePreview, setImagePreview] = useState([])
  const [newRule, setNewRule] = useState("")
  const [newEquipment, setNewEquipment] = useState({ item: "", required: false })
  const [currentStep, setCurrentStep] = useState(0)
  const [completionProgress, setCompletionProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("basic")
  const [selectedVenue, setSelectedVenue] = useState(null)

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

  const categories = [
    { value: "Football", label: "Football", participants: "50K+" },
    { value: "Basketball", label: "Basketball", participants: "45K+" },
    { value: "Tennis", label: "Tennis", participants: "30K+" },
    { value: "Running", label: "Running", participants: "60K+" },
    { value: "Cycling", label: "Cycling", participants: "25K+" },
    { value: "Swimming", label: "Swimming", participants: "20K+" },
    { value: "Volleyball", label: "Volleyball", participants: "15K+" },
    { value: "Cricket", label: "Cricket", participants: "40K+" },
    { value: "Other", label: "Other Sports", participants: "10K+" },
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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)

    if (files.length + images.length > 5) {
      toast.error("Maximum 5 images allowed")
      return
    }

    const validFiles = files.filter((file) => {
      const isValidType = ["image/jpeg", "image/png", "image/webp"].includes(file.type)
      const isValidSize = file.size <= 5 * 1024 * 1024

      if (!isValidType) {
        toast.error(`${file.name} is not a supported image type`)
        return false
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large (max 5MB)`)
        return false
      }
      return true
    })

    setImages((prev) => [...prev, ...validFiles])
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file))
    setImagePreview((prev) => [...prev, ...newPreviews])
  }

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreview[index])
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreview((prev) => prev.filter((_, i) => i !== index))
  }

  const addRule = () => {
    if (newRule.trim()) {
      form.setValue("rules", [...form.getValues("rules"), newRule.trim()])
      setNewRule("")
      toast.success("Rule added successfully")
    }
  }

  const removeRule = (index) => {
    const updatedRules = form.getValues("rules").filter((_, i) => i !== index)
    form.setValue("rules", updatedRules)
    toast.success("Rule removed")
  }

  const addEquipment = () => {
    if (newEquipment.item.trim()) {
      form.setValue("equipment", [
        ...form.getValues("equipment"),
        { item: newEquipment.item.trim(), required: newEquipment.required },
      ])
      setNewEquipment({ item: "", required: false })
      toast.success("Equipment added successfully")
    }
  }

  const removeEquipment = (index) => {
    const updatedEquipment = form.getValues("equipment").filter((_, i) => i !== index)
    form.setValue("equipment", updatedEquipment)
    toast.success("Equipment removed")
  }

  const onSubmit = async (formData) => {
    try {
      setIsLoading(true)
      const data = {
        ...formData,
        images: images,
        venue: selectedVenue?._id || null
      }
      const result = await createEvent(data)

      if (result.success) {
        toast.success("Event created successfully! 🎉")
        navigate(`/events/${result.event.id}`)
      }
    } catch (error) {
      toast.error(error.message || "Failed to create event")
    } finally {
      setIsLoading(false)
    }
  }

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
      {/* Background Effects */}
      {/* Background Effects Removed */}

      <div className="relative z-10 container mx-auto px-2 sm:px-4 py-4 sm:py-8">
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
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
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
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-md sm:rounded-lg flex items-center justify-center">
                      <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
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
          <div className="mb-6 sm:mb-8 animate-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="grid md:grid-cols-4 grid-cols-1 gap-3 sm:gap-4">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setActiveTab(step.id)}
                  className={cn(
                    "p-4 sm:p-6 rounded-lg sm:rounded-2xl border-2 transition-all duration-300 text-left group hover:-translate-y-0.5 active:scale-95",
                    activeTab === step.id
                      ? "border-blue-600 bg-card shadow-lg sm:shadow-xl scale-100 sm:scale-105"
                      : "border-border bg-card/50 hover:border-muted-foreground/20 hover:shadow-md"
                  )}
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
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
          <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
            <Card className="bg-card border-border shadow-lg sm:shadow-2xl">
              <CardContent className="p-0">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
                    {/* Basic Info Tab */}
                    {activeTab === "basic" && (
                      <div
                        className="p-4 sm:p-8 animate-in slide-in-from-right-4 duration-500"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-lg sm:rounded-2xl flex items-center justify-center shadow-md sm:shadow-lg">
                            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Basic Information</h2>
                            <p className="text-muted-foreground text-sm sm:text-lg">
                              Let's start with the essentials about your event
                            </p>
                          </div>
                        </div>
                        <div className="space-y-6 sm:space-y-8">
                          {/* Event Name */}
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                                  Event Name *
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter an exciting and descriptive event name"
                                    {...field}
                                    className="h-12 sm:h-14 text-base sm:text-lg bg-background border-input focus:border-blue-500 rounded-lg sm:rounded-xl shadow-sm transition-all duration-200 w-full text-foreground placeholder:text-muted-foreground"
                                  />
                                </FormControl>
                                <FormDescription className="text-muted-foreground text-xs sm:text-sm">
                                  Choose a catchy name that clearly describes your event and attracts participants
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {/* Category Selection */}
                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                                  <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                                  Sport Category *
                                </FormLabel>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                  {categories.map((category) => (
                                    <button
                                      key={category.value}
                                      type="button"
                                      onClick={() => field.onChange(category.value)}
                                      className={cn(
                                        "p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 text-left group hover:-translate-y-0.5 active:scale-95",
                                        field.value === category.value
                                          ? "border-blue-500 bg-blue-900/20 scale-100 sm:scale-105"
                                          : "border-border hover:border-muted-foreground/20 hover:shadow-md bg-background"
                                      )}
                                    >
                                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                        <div
                                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl bg-primary/10"
                                        >
                                          {category.icon}
                                        </div>
                                        <div className="flex-1">
                                          <h3 className="font-semibold text-base sm:text-foreground">{category.label}</h3>
                                          <p className="text-xs sm:text-sm text-muted-foreground">
                                            {category.participants} players
                                          </p>
                                        </div>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                                <FormDescription className="text-muted-foreground text-xs sm:text-sm">
                                  Select the main sport or activity for your event
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {/* Description */}
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                                  Event Description *
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Describe your event in detail. What makes it special? What should participants expect? Include any special features, prizes, or unique aspects of your event..."
                                    rows={4}
                                    {...field}
                                    className="text-base sm:text-lg bg-background border-input focus:border-blue-500 rounded-lg sm:rounded-xl shadow-sm transition-all duration-200 resize-none w-full text-foreground placeholder:text-muted-foreground"
                                  />
                                </FormControl>
                                <FormDescription className="text-muted-foreground text-xs sm:text-sm">
                                  Provide comprehensive details about the event, what to expect, and any special features (minimum 20 characters)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {/* Date and Time */}
                          <div className="grid md:grid-cols-2 grid-cols-1 gap-4 sm:gap-6">
                            <FormField
                              control={form.control}
                              name="date"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                                    Event Date *
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Calendar className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
                                      <Input
                                        type="date"
                                        {...field}
                                        className="h-12 sm:h-14 pl-10 sm:pl-12 text-base sm:text-lg bg-background border-input focus:border-blue-500 rounded-lg sm:rounded-xl shadow-sm transition-all duration-200 w-full text-foreground [color-scheme:dark]"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription className="text-muted-foreground text-xs sm:text-sm">
                                    When will your event take place?
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="time"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                                    <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                                    Start Time *
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Clock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
                                      <Input
                                        type="time"
                                        {...field}
                                        className="h-12 sm:h-14 pl-10 sm:pl-12 text-base sm:text-lg bg-background border-input focus:border-blue-500 rounded-lg sm:rounded-xl shadow-sm transition-all duration-200 w-full text-foreground [color-scheme:dark]"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription className="text-muted-foreground text-xs sm:text-sm">
                                    What time does the event start?
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          {/* Location */}
                          <div className="space-y-4 sm:space-y-6">
                            <div className="flex items-center gap-2">
                              <MapPinIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                              <h3 className="text-lg sm:text-xl font-semibold text-foreground">Location Details</h3>
                            </div>

                            {/* Venue Selection */}
                            <div className="space-y-4 p-4 bg-accent/50 rounded-lg border border-border">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-primary" />
                                <h4 className="font-semibold text-foreground">Select Venue (Optional)</h4>
                              </div>

                              <VenueSelector
                                venues={venues}
                                selectedVenue={selectedVenue}
                                onSelect={(venue) => {
                                  setSelectedVenue(venue)
                                  form.setValue('location.address', venue.location?.address || '')
                                  form.setValue('location.city', venue.location?.city || '')
                                  form.setValue('location.state', venue.location?.state || '')
                                }}
                              />
                            </div>

                            <div className="grid md:grid-cols-2 grid-cols-1 gap-4 sm:gap-6">
                              <FormField
                                control={form.control}
                                name="location.address"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-base sm:text-lg font-semibold text-foreground">Address *</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
                                        <Input
                                          placeholder="Enter the complete venue address"
                                          {...field}
                                          className="h-12 sm:h-14 pl-10 sm:pl-12 text-base sm:text-lg bg-background border-input focus:border-blue-500 rounded-lg sm:rounded-xl shadow-sm transition-all duration-200 w-full text-foreground placeholder:text-muted-foreground"
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="location.city"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-base sm:text-lg font-semibold text-foreground">City *</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Enter city name"
                                        {...field}
                                        className="h-12 sm:h-14 text-base sm:text-lg bg-background border-input focus:border-blue-500 rounded-lg sm:rounded-xl shadow-sm transition-all duration-200 w-full text-foreground placeholder:text-muted-foreground"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="location.state"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-base sm:text-lg font-semibold text-foreground">
                                      State/Province
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Enter state (optional)"
                                        {...field}
                                        className="h-12 sm:h-14 text-base sm:text-lg bg-background border-input focus:border-blue-500 rounded-lg sm:rounded-xl shadow-sm transition-all duration-200 w-full text-foreground placeholder:text-muted-foreground"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end pt-4 sm:pt-6">
                            <Button
                              type="button"
                              onClick={() => setActiveTab("details")}
                              size="lg"
                              className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
                            >
                              Next: Event Details
                              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Event Details Tab */}
                    {activeTab === "details" && (
                      <div
                        className="p-4 sm:p-8 animate-in slide-in-from-right-4 duration-500"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-lg sm:rounded-2xl flex items-center justify-center shadow-md sm:shadow-lg">
                            <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Event Configuration</h2>
                            <p className="text-muted-foreground text-sm sm:text-lg">
                              Set up the important details and requirements
                            </p>
                          </div>
                        </div>
                        <div className="space-y-6 sm:space-y-8">
                          <div className="grid md:grid-cols-2 grid-cols-1 gap-4 sm:gap-8">
                            <FormField
                              control={form.control}
                              name="maxParticipants"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                                    <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                                    Maximum Participants *
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Users className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
                                      <Input
                                        type="number"
                                        min={2}
                                        max={1000}
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        className="h-12 sm:h-14 pl-10 sm:pl-12 text-base sm:text-lg bg-background border-input focus:border-blue-500 rounded-lg sm:rounded-xl shadow-sm transition-all duration-200 w-full text-foreground"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription className="text-muted-foreground text-xs sm:text-sm">
                                    How many people can participate in this event?
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="registrationFee"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                                    <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                                    Registration Fee (₹)
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <IndianRupee className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
                                      <Input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        className="h-12 sm:h-14 pl-10 sm:pl-12 text-base sm:text-lg bg-background border-input focus:border-blue-500 rounded-lg sm:rounded-xl shadow-sm transition-all duration-200 w-full text-foreground"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription className="text-muted-foreground text-xs sm:text-sm">
                                    Set to 0 for free events. This helps cover venue and equipment costs.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid md:grid-cols-2 grid-cols-1 gap-4 sm:gap-8">
                            <FormField
                              control={form.control}
                              name="difficulty"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                                    Difficulty Level *
                                  </FormLabel>
                                  <div className="space-y-2 sm:space-y-3">
                                    {[
                                      {
                                        value: "Beginner",
                                        icon: Seedling,
                                        description: "Open to all skill levels - perfect for newcomers",
                                      },
                                      {
                                        value: "Intermediate",
                                        icon: Zap,
                                        description: "Some experience required - moderate challenge",
                                      },
                                      {
                                        value: "Advanced",
                                        icon: Flame,
                                        description: "High skill level required - competitive play",
                                      },
                                    ].map((level) => (
                                      <button
                                        key={level.value}
                                        type="button"
                                        onClick={() => field.onChange(level.value)}
                                        className={cn(
                                          "w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 text-left hover:scale-[1.02] active:scale-98",
                                          field.value === level.value
                                            ? "border-primary bg-primary/20 scale-100 sm:scale-105"
                                            : "border-border hover:border-muted-foreground/20"
                                        )}
                                      >
                                        <div className="flex items-center gap-2 sm:gap-3">
                                          <div
                                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg flex items-center justify-center bg-primary/10"
                                          >
                                            <level.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                          </div>
                                          <div className="flex-1">
                                            <h4 className="font-semibold text-base sm:text-foreground">{level.value}</h4>
                                            <p className="text-xs sm:text-sm text-muted-foreground">{level.description}</p>
                                          </div>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="eventType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                                    Event Type *
                                  </FormLabel>
                                  <div className="space-y-2 sm:space-y-3">
                                    {[
                                      {
                                        value: "casual",
                                        icon: Heart,
                                        title: "Casual",
                                        description: "Fun and relaxed atmosphere - social play",
                                      },
                                      {
                                        value: "tournament",
                                        icon: Trophy,
                                        title: "Tournament",
                                        description: "Competitive event with rankings and prizes",
                                      },
                                      {
                                        value: "training",
                                        icon: Target,
                                        title: "Training",
                                        description: "Skill development and coaching session",
                                      },
                                    ].map((type) => (
                                      <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => field.onChange(type.value)}
                                        className={cn(
                                          "w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 text-left hover:scale-[1.02] active:scale-98",
                                          field.value === type.value
                                            ? "border-blue-500 bg-blue-900/20 scale-100 sm:scale-105"
                                            : "border-border hover:border-muted-foreground/20"
                                        )}
                                      >
                                        <div className="flex items-center gap-2 sm:gap-3">
                                          <div
                                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg flex items-center justify-center bg-primary"
                                          >
                                            <type.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                          </div>
                                          <div className="flex-1">
                                            <h4 className="font-semibold text-base sm:text-foreground">{type.title}</h4>
                                            <p className="text-xs sm:text-sm text-muted-foreground">{type.description}</p>
                                          </div>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 pt-4 sm:pt-6">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setActiveTab("basic")}
                              size="lg"
                              className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl border-2 hover:bg-accent w-full sm:w-auto"
                            >
                              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                              Previous
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setActiveTab("media")}
                              size="lg"
                              className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
                            >
                              Next: Media & Rules
                              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Media & Rules Tab */}
                    {activeTab === "media" && (
                      <div
                        className="p-4 sm:p-8 animate-in slide-in-from-right-4 duration-500"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-lg sm:rounded-2xl flex items-center justify-center shadow-md sm:shadow-lg">
                            <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Media & Guidelines</h2>
                            <p className="text-muted-foreground text-sm sm:text-lg">
                              Add visual appeal and set expectations for participants
                            </p>
                          </div>
                        </div>
                        <div className="space-y-8 sm:space-y-10">
                          {/* Images Section */}
                          <div className="space-y-4 sm:space-y-6">
                            <div className="flex items-center gap-2">
                              <ImagePlus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                              <h3 className="text-lg sm:text-xl font-semibold text-foreground">Event Images</h3>
                              <Badge variant="secondary" className="ml-2 text-xs sm:text-sm">Optional</Badge>
                            </div>
                            <div className="border-2 border-dashed border-border rounded-lg sm:rounded-2xl p-4 sm:p-8 text-center hover:border-blue-500 transition-colors duration-200 bg-muted/50">
                              <div className="mb-4 sm:mb-6">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-lg sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md sm:shadow-lg">
                                  <ImagePlus className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                                </div>
                                <h4 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                                  Upload Event Images
                                </h4>
                                <p className="text-muted-foreground mb-2 sm:mb-3 text-sm sm:text-lg">
                                  Add stunning visuals to showcase your event
                                </p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  PNG, JPG, WEBP up to 5MB each • Maximum 5 images
                                </p>
                              </div>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={handleImageChange}
                                className="hidden"
                                id="image-upload"
                              />
                              <label
                                htmlFor="image-upload"
                                className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl bg-primary text-white hover:bg-primary/90 transition-all duration-200 cursor-pointer shadow-md sm:shadow-lg hover:shadow-xl"
                              >
                                <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                                <span className="text-base sm:text-lg font-medium">Choose Images</span>
                              </label>
                            </div>
                            {imagePreview.length > 0 && (
                              <div
                                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
                              >
                                {imagePreview.map((src, index) => (
                                  <div
                                    key={index}
                                    className="relative group animate-in fade-in zoom-in-95 duration-300"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                  >
                                    <img
                                      src={src || "/placeholder.svg"}
                                      alt={`Preview ${index}`}
                                      className="w-full h-24 sm:h-32 object-cover rounded-lg sm:rounded-xl border-2 border-border shadow-sm sm:shadow-md group-hover:shadow-lg transition-all duration-200"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeImage(index)}
                                      className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-md"
                                    >
                                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Rules Section */}
                          <div className="space-y-4 sm:space-y-6">
                            <div className="flex items-center gap-2">
                              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                              <h3 className="text-lg sm:text-xl font-semibold text-foreground">Event Rules & Guidelines</h3>
                              <Badge variant="secondary" className="ml-2 text-xs sm:text-sm">Optional</Badge>
                            </div>
                            <Card className="border-2 border-border">
                              <CardContent className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
                                  <Input
                                    value={newRule}
                                    onChange={(e) => setNewRule(e.target.value)}
                                    placeholder="Add a rule or guideline for participants..."
                                    className="flex-1 h-10 sm:h-12 text-base sm:text-lg bg-background border-input focus:border-blue-500 rounded-md sm:rounded-lg"
                                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRule())}
                                  />
                                  <Button
                                    type="button"
                                    onClick={addRule}
                                    disabled={!newRule.trim()}
                                    className="h-10 sm:h-12 px-4 sm:px-6 bg-primary hover:bg-primary/90 text-white rounded-md sm:rounded-lg disabled:opacity-50 w-full sm:w-auto"
                                  >
                                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                                    Add Rule
                                  </Button>
                                </div>
                                {form.getValues("rules")?.length > 0 ? (
                                  <div className="space-y-2 sm:space-y-3">
                                    {form.getValues("rules").map((rule, index) => (
                                      <div
                                        key={index}
                                        className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-md sm:rounded-lg bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-300"
                                      >
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                                          <span className="text-xs sm:text-sm font-bold text-white">{index + 1}</span>
                                        </div>
                                        <p className="flex-1 text-foreground text-base sm:text-lg leading-relaxed">
                                          {rule}
                                        </p>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeRule(index)}
                                          className="text-red-500 hover:text-red-700 hover:bg-red-900/20"
                                        >
                                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-6 sm:py-8 border-2 border-dashed border-border rounded-md sm:rounded-lg bg-muted/50">
                                    <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                                    <h4 className="text-base sm:text-lg font-medium text-foreground mb-2">
                                      No Rules Added Yet
                                    </h4>
                                    <p className="text-muted-foreground text-xs sm:text-sm">
                                      Add rules to help participants understand expectations and guidelines.
                                    </p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                          {/* Equipment Section */}
                          <div className="space-y-4 sm:space-y-6">
                            <div className="flex items-center gap-2">
                              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                              <h3 className="text-lg sm:text-xl font-semibold text-foreground">Required Equipment</h3>
                              <Badge variant="secondary" className="ml-2 text-xs sm:text-sm">Optional</Badge>
                            </div>
                            <Card className="border-2 border-border">
                              <CardContent className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
                                  <Input
                                    value={newEquipment.item}
                                    onChange={(e) => setNewEquipment((prev) => ({ ...prev, item: e.target.value }))}
                                    placeholder="Add equipment needed for the event..."
                                    className="flex-1 h-10 sm:h-12 text-base sm:text-lg bg-background border-input focus:border-blue-500 rounded-md sm:rounded-lg"
                                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addEquipment())}
                                  />
                                  <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-muted rounded-md sm:rounded-lg border border-border">
                                    <input
                                      type="checkbox"
                                      id="equipment-required"
                                      checked={newEquipment.required}
                                      onChange={(e) => setNewEquipment((prev) => ({ ...prev, required: e.target.checked }))}
                                      className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600"
                                    />
                                    <label
                                      htmlFor="equipment-required"
                                      className="text-xs sm:text-sm font-medium text-foreground whitespace-nowrap"
                                    >
                                      Required
                                    </label>
                                  </div>
                                  <Button
                                    type="button"
                                    onClick={addEquipment}
                                    disabled={!newEquipment.item.trim()}
                                    className="h-10 sm:h-12 px-4 sm:px-6 bg-primary hover:bg-primary/90 text-white rounded-md sm:rounded-lg disabled:opacity-50 w-full sm:w-auto"
                                  >
                                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                                    Add
                                  </Button>
                                </div>
                                {form.getValues("equipment")?.length > 0 ? (
                                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                                    {form.getValues("equipment").map((item, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between p-3 sm:p-4 rounded-md sm:rounded-lg bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-300"
                                      >
                                        <div className="flex items-center gap-2 sm:gap-3">
                                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                          <span className="text-foreground font-medium text-sm sm:text-base">
                                            {item.item}
                                          </span>
                                          {item.required && (
                                            <Badge variant="destructive" className="text-xs">Required</Badge>
                                          )}
                                        </div>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeEquipment(index)}
                                          className="text-red-500 hover:text-red-700 hover:bg-red-900/20"
                                        >
                                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-6 sm:py-8 border-2 border-dashed border-border rounded-md sm:rounded-lg bg-muted/50">
                                    <Target className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                                    <h4 className="text-base sm:text-lg font-medium text-foreground mb-2">
                                      No Equipment Listed
                                    </h4>
                                    <p className="text-muted-foreground text-xs sm:text-sm">
                                      List any equipment or gear participants should bring to the event.
                                    </p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 pt-4 sm:pt-6">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setActiveTab("details")}
                              size="lg"
                              className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl border-2 hover:bg-accent w-full sm:w-auto"
                            >
                              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                              Previous
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setActiveTab("review")}
                              size="lg"
                              className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
                            >
                              Next: Review & Publish
                              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Review Tab */}
                    {activeTab === "review" && (
                      <div
                        className="p-4 sm:p-8 animate-in slide-in-from-right-4 duration-500"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-lg sm:rounded-2xl flex items-center justify-center shadow-md sm:shadow-lg">
                            <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Review & Publish</h2>
                            <p className="text-muted-foreground text-sm sm:text-lg">
                              Review all details before publishing your event
                            </p>
                          </div>
                        </div>
                        <div className="space-y-6 sm:space-y-8">
                          {/* Event Summary Card */}
                          <Card className="bg-primary/10 border-primary/20">
                            <CardContent className="p-4 sm:p-8">
                              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                                {imagePreview.length > 0 ? (
                                  <img
                                    src={imagePreview[0]}
                                    alt="Event preview"
                                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg sm:rounded-2xl border-2 border-border shadow-md sm:shadow-lg"
                                  />
                                ) : (
                                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-muted rounded-lg sm:rounded-2xl flex items-center justify-center">
                                    <Camera className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="flex-1 space-y-3 sm:space-y-4">
                                  <div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                                      {form.getValues("name") || "Event Name"}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                                      <Badge variant="secondary" className="text-xs">{form.getValues("category") || "Category"}</Badge>
                                      <Badge variant="outline" className="text-xs">{form.getValues("difficulty")}</Badge>
                                      <Badge variant="outline" className="text-xs capitalize">{form.getValues("eventType")}</Badge>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 gap-2 sm:gap-4 text-xs sm:text-sm">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                                      <span className="text-foreground">
                                        {form.getValues("date") ? new Date(form.getValues("date")).toLocaleDateString() : "Date"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                                      <span className="text-foreground">{form.getValues("time") || "Time"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                                      <span className="text-foreground">{form.getValues("maxParticipants")} participants</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                                    <span className="text-foreground">
                                      {[
                                        form.getValues("location.address"),
                                        form.getValues("location.city"),
                                        form.getValues("location.state"),
                                      ]
                                        .filter(Boolean)
                                        .join(", ") || "Location"}
                                    </span>
                                  </div>
                                  {form.getValues("registrationFee") > 0 && (
                                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                                      <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                                      <span className="text-foreground font-semibold">
                                        ${form.getValues("registrationFee")} registration fee
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {form.getValues("description") && (
                                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-blue-700">
                                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                                    {form.getValues("description")}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                          {/* Additional Details */}
                          <div className="grid grid-cols-1 gap-4 sm:gap-6">
                            {form.getValues("rules")?.length > 0 && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                                    Event Rules ({form.getValues("rules").length})
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ul className="space-y-2">
                                    {form.getValues("rules").slice(0, 3).map((rule, index) => (
                                      <li key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                                        <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                          {index + 1}
                                        </span>
                                        <span className="text-muted-foreground">{rule}</span>
                                      </li>
                                    ))}
                                    {form.getValues("rules").length > 3 && (
                                      <li className="text-xs sm:text-sm text-muted-foreground ml-6 sm:ml-7">
                                        ... and {form.getValues("rules").length - 3} more rules
                                      </li>
                                    )}
                                  </ul>
                                </CardContent>
                              </Card>
                            )}
                            {form.getValues("equipment")?.length > 0 && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                                    Equipment ({form.getValues("equipment").length})
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ul className="space-y-2">
                                    {form.getValues("equipment").slice(0, 4).map((item, index) => (
                                      <li key={index} className="flex items-center gap-2 text-xs sm:text-sm">
                                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                                        <span className="text-muted-foreground">{item.item}</span>
                                        {item.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                                      </li>
                                    ))}
                                    {form.getValues("equipment").length > 4 && (
                                      <li className="text-xs sm:text-sm text-muted-foreground ml-5 sm:ml-6">
                                        ... and {form.getValues("equipment").length - 4} more items
                                      </li>
                                    )}
                                  </ul>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                          {/* Completion Status */}
                          <Card
                            className={cn(
                              "border-2",
                              completionProgress === 100
                                ? "border-primary bg-primary/10"
                                : "border-orange-600 bg-orange-900/20"
                            )}
                          >
                            <CardContent className="p-4 sm:p-6">
                              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                                {completionProgress === 100 ? (
                                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                                ) : (
                                  <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
                                )}
                                <div>
                                  <h3 className="text-base sm:text-lg font-semibold text-foreground">
                                    {completionProgress === 100 ? "Event Ready to Publish!" : "Complete Required Fields"}
                                  </h3>
                                  <p className="text-xs sm:text-sm text-muted-foreground">
                                    {completionProgress === 100
                                      ? "All required information has been provided. Your event is ready to go live."
                                      : "Please fill in all required fields to publish your event."}
                                  </p>
                                </div>
                              </div>
                              <div className="relative">
                                <Progress value={completionProgress} className="h-2" />
                                <span className="text-xs sm:text-sm font-medium text-muted-foreground mt-2 block">
                                  {Math.round(completionProgress)}% Complete
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 pt-4 sm:pt-6">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setActiveTab("media")}
                              size="lg"
                              className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl border-2 hover:bg-accent w-full sm:w-auto"
                            >
                              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                              Previous
                            </Button>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                              <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl border-2 hover:bg-accent w-full sm:w-auto"
                                onClick={() => {
                                  toast.success("Event saved as draft");
                                }}
                              >
                                <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                Save Draft
                              </Button>
                              <Button
                                type="submit"
                                disabled={isLoading || completionProgress < 100}
                                size="lg"
                                className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 w-full sm:w-auto"
                              >
                                {isLoading ? (
                                  <>
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Creating Event...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                    Publish Event
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateEventForm
