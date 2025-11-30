import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { useEvents } from "@/hooks/useEvents"
import { useVenue } from "@/hooks/useVenue"
import {
  Calendar, ImagePlus, X, ChevronLeft, Clock, MapPin, Users, Eye, Upload, Plus, Trash2, CheckCircle, Target, Shield, Camera, FileText, Settings, ArrowRight, AlertTriangle, Loader2, IndianRupee
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { eventSchema, defaultEventValues } from "@/schemas/eventSchema"



const EditEvent = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getEventById, updateEvent, deleteEvent, loading } = useEvents()
  const { venues, getVenues } = useVenue()
  const [pageLoading, setPageLoading] = useState(true)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [existingImages, setExistingImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const [imagePreview, setImagePreview] = useState([])
  const [deletedImages, setDeletedImages] = useState([])
  const [newRule, setNewRule] = useState("")
  const [newEquipment, setNewEquipment] = useState({ item: "", required: false })
  const [activeTab, setActiveTab] = useState("basic")
  const [completionProgress, setCompletionProgress] = useState(0)
  const [hasChanges, setHasChanges] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState(null)

  const form = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: defaultEventValues,
  })

  const steps = [
    {
      id: "basic",
      title: "Basic Info",
      icon: FileText,
      description: "Event name, category & description",
    },
    {
      id: "details",
      title: "Event Details",
      icon: Settings,
      description: "Date, time & location",
    },
    {
      id: "media",
      title: "Media & Rules",
      icon: Camera,
      description: "Images, rules & equipment",
    },
    {
      id: "review",
      title: "Review",
      icon: Eye,
      description: "Final review & publish",
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
    const subscription = form.watch(() => {
      calculateProgress()
      setHasChanges(true)
    })
    return () => subscription.unsubscribe()
  }, [form, calculateProgress])

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const res = await getEventById(id)
        const eventData = res.data
        if (eventData) {
          form.reset({
            name: eventData.name || "",
            category: eventData.category || "",
            description: eventData.description || "",
            date: eventData.date ? format(new Date(eventData.date), "yyyy-MM-dd") : "",
            time: eventData.time || "",
            location: eventData.location || {
              address: "",
              city: "",
              state: "",
            },
            maxParticipants: eventData.maxParticipants || 10,
            difficulty: ["Beginner", "Intermediate", "Advanced"].includes(eventData.difficulty) ? eventData.difficulty : "Beginner",
            eventType: ["casual", "tournament", "training"].includes(eventData.eventType) ? eventData.eventType : "casual",
            registrationFee: eventData.registrationFee || 0,
            rules: eventData.rules || [],
            equipment: eventData.equipment || [],
          })
          setExistingImages(eventData.images || [])

          // Set selected venue if event has one
          if (eventData.venue) {
            setSelectedVenue(eventData.venue)
          }

          document.title = `Edit Event - ${eventData.name || "Untitled Event"}`
          setHasChanges(false)
          calculateProgress()
        } else {
          toast.error("Event not found")
          navigate("/events")
        }
      } catch (error) {
        toast.error("Error fetching event details")
        navigate("/events")
      } finally {
        setPageLoading(false)
      }
    }

    fetchEventDetails()
  }, [id, form, navigate, calculateProgress])

  // Load venues on mount
  useEffect(() => {
    getVenues()
  }, [])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files)
      handleFiles(files)
    }
  }

  const handleFiles = (files) => {
    if (files.length + newImages.length + existingImages.length > 5) {
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

    setNewImages((prev) => [...prev, ...validFiles])
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file))
    setImagePreview((prev) => [...prev, ...newPreviews])
    setHasChanges(true)
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    handleFiles(files)
  }

  const removeNewImage = (index) => {
    URL.revokeObjectURL(imagePreview[index])
    setNewImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreview((prev) => prev.filter((_, i) => i !== index))
    setHasChanges(true)
  }

  const removeExistingImage = (index) => {
    const imageToRemove = existingImages[index]
    setDeletedImages((prev) => [...prev, imageToRemove.public_id])
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
    setHasChanges(true)
  }

  const addRule = () => {
    if (newRule.trim()) {
      form.setValue("rules", [...form.getValues("rules"), newRule.trim()])
      setNewRule("")
      setHasChanges(true)
    }
  }

  const removeRule = (index) => {
    const updatedRules = form.getValues("rules").filter((_, i) => i !== index)
    form.setValue("rules", updatedRules)
    form.trigger("rules")
    setHasChanges(true)
  }

  const addEquipment = () => {
    if (newEquipment.item.trim()) {
      form.setValue("equipment", [
        ...form.getValues("equipment"),
        { item: newEquipment.item.trim(), required: newEquipment.required },
      ])
      setNewEquipment({ item: "", required: false })
      setHasChanges(true)
    }
  }

  const removeEquipment = (index) => {
    const updatedEquipment = form.getValues("equipment").filter((_, i) => i !== index)
    form.setValue("equipment", updatedEquipment)
    form.trigger("equipment")
    setHasChanges(true)
  }

  const onSubmit = async (formData) => {
    try {
      const eventFormData = new FormData()

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "location" || key === "rules" || key === "equipment") {
          eventFormData.append(key, JSON.stringify(value))
        } else {
          eventFormData.append(key, value)
        }
      })

      // Add venue if selected
      if (selectedVenue) {
        eventFormData.append("venue", selectedVenue._id)
      }

      if (existingImages.length > 0) {
        eventFormData.append("existingImages", JSON.stringify(existingImages))
      }

      if (deletedImages.length > 0) {
        eventFormData.append("deletedImages", JSON.stringify(deletedImages))
      }

      if (newImages.length > 0) {
        newImages.forEach((image) => {
          eventFormData.append("images", image)
        })
      }

      const result = await updateEvent(id, eventFormData)

      if (result.success) {
        setHasChanges(false)
        navigate(`/events/${id}`)
      } else {
        console.log('Update failed:', result.message);
        toast.error(result.message || "Failed to update event")
      }
    } catch (error) {
      console.log('Update error:', error);
      toast.error(error.message || "Failed to update event")
    }
  }

  const handleDeleteEvent = async () => {
    try {
      const result = await deleteEvent(id)
      if (result.success) {
        toast.success("Event deleted successfully")
        navigate("/events")
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete event")
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
          <CheckCircle className="w-5 h-5" />
        ) : (
          <StepIcon className="w-5 h-5" />
        )}
      </div>
    )
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div
          className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300"
        >
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
          <div
            className="mt-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300"
          >
            <p className="text-lg font-medium text-foreground">
              Loading event details...
            </p>
            <p className="text-sm text-muted-foreground">
              Preparing your event for editing
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!form.getValues("name")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-4 animate-in fade-in zoom-in-95 duration-300">
          <Card className="bg-card border-red-900/50 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="animate-in zoom-in duration-500 delay-200">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-2">
                Event Not Found
              </h3>
              <p className="text-muted-foreground mb-6">
                The event you're looking for doesn't exist or you don't have permission to edit it.
              </p>
              <Button
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link to="/events">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Events
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="animate-in fade-in duration-500">
          {/* Header */}
          <div className="mb-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex sm:flex-row flex-col justify-center sm:items-center gap-4 mb-8">
              <div className="flex items-center gap-4 flex-1">
                <Button
                  variant="ghost"
                  asChild
                  className="h-10 w-10 p-0 rounded-full hover:bg-muted"
                >
                  <Link to={`/events/${id}`}>
                    <ChevronLeft className="w-5 h-5" />
                  </Link>
                </Button>
                <div className="flex-1">
                  <div className="flex flex-col justify-center mb-2">
                    <h1 className="text-3xl font-bold text-foreground">
                      Edit Event
                    </h1>
                    <p className="text-muted-foreground">
                      Update your event details and settings
                    </p>
                  </div>
                  {hasChanges && (
                    <Badge
                      variant="secondary"
                      className="bg-destructive/20 text-destructive border-destructive/30"
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Unsaved Changes
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                variant="destructive"
                onClick={() => setShowConfirmDelete(true)}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Event
              </Button>
            </div>

            {/* Progress Section */}
            <Card className="bg-card border-border shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                  <div className="flex items-center gap-3 mb-4 sm:mb-0">
                    <div>
                      <span className="font-semibold text-foreground text-base">
                        Event Update Progress
                      </span>
                      <p className="text-sm text-muted-foreground">
                        Complete all fields to finalize your event updates
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-foreground">
                      {Math.round(completionProgress)}%
                    </span>
                    <p className="text-sm text-muted-foreground">Complete</p>
                  </div>
                </div>
                <Progress value={completionProgress} className="h-2 bg-muted" />
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
                      ? "border-primary bg-card shadow-md scale-[1.02] "
                      : "border-border bg-card/50 hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-4 mb-3">
                    {getStepIcon(step, index)}
                    <div className="flex-1">
                      <h3
                        className={cn(
                          "font-semibold text-base transition-colors",
                          activeTab === step.id ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {step.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Step {index + 1} of {steps.length}
                    </span>
                    {activeTab === step.id && <ArrowRight className="w-4 h-4 text-foreground" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Form */}
          <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
            <Card className="bg-card border-border shadow-lg">
              <CardContent className="p-0">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Basic Info Tab */}
                    {activeTab === "basic" && (
                      <div
                        className="p-8 animate-in slide-in-from-right-4 duration-500"
                      >
                        <div className="flex flex-col justify-center mb-8">
                          <h2 className="text-2xl font-bold text-foreground">Basic Information</h2>
                          <p className="text-muted-foreground">
                            Update the essential details about your event
                          </p>
                        </div>
                        <div className="space-y-8">
                          {/* Event Name */}
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                                  Event Name *
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter an exciting and descriptive event name"
                                    {...field}
                                    className="h-12 text-sm sm:text-base bg-background border-input focus:ring-primary"
                                  />
                                </FormControl>
                                <FormDescription className="text-muted-foreground">
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
                                <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                                  Sport Category *
                                </FormLabel>
                                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                                  {categories.map((category) => (
                                    <button
                                      key={category.value}
                                      type="button"
                                      onClick={() => field.onChange(category.value)}
                                      className={cn(
                                        "p-4 rounded-xl border transition-all duration-200 text-left group hover:-translate-y-0.5 active:scale-95",
                                        field.value === category.value
                                          ? "border-blue-500 bg-blue-900/20 scale-100 sm:scale-105"
                                          : "border-border hover:border-muted-foreground/20 hover:shadow-md bg-background"
                                      )}
                                    >
                                      <div className="flex flex-col items-center justify-center gap-3 mb-2">
                                        <h3 className="font-semibold text-xs sm:text-sm text-foreground">{category.label}</h3>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                                <FormDescription className="text-muted-foreground">
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
                                <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                                  Event Description *
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Describe your event in detail..."
                                    rows={6}
                                    {...field}
                                    className="text-sm sm:text-base bg-background border-input focus:ring-primary resize-none"
                                  />
                                </FormControl>
                                <FormDescription className="text-muted-foreground">
                                  Provide comprehensive details about the event (minimum 20 characters)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {/* Date and Time */}
                          <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                            <FormField
                              control={form.control}
                              name="date"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                                    Event Date *
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        type="date"
                                        {...field}
                                        className="h-12 text-sm sm:text-base bg-background border-input focus:ring-primary"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="time"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                                    Start Time *
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        type="time"
                                        {...field}
                                        className="h-12 text-sm sm:text-base bg-background border-input focus:ring-primary"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          {/* Location */}
                          <div className="space-y-6">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-semibold text-foreground">Location Details</h3>
                            </div>

                            <div className="grid md:grid-cols-2 grid-cols-1 gap-6">

                              {/* Venue Selection */}
                              <div className="space-y-4 p-4 bg-background rounded-lg border border-border">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-sm sm:text-base text-foreground">Select Venue (Optional)</h4>
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

                              <FormField
                                control={form.control}
                                name="location.address"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-base font-semibold text-foreground">Address *</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Input
                                          placeholder="Enter the complete venue address"
                                          {...field}
                                          className="h-12 text-sm sm:text-base bg-background border-input focus:ring-primary"
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
                                    <FormLabel className="text-base font-semibold text-foreground">City *</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Enter city name"
                                        {...field}
                                        className="h-12 text-sm sm:text-base bg-background border-input focus:ring-primary"
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
                                    <FormLabel className="text-base font-semibold text-foreground">
                                      State/Province
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Enter state (optional)"
                                        {...field}
                                        className="h-12 text-sm sm:text-base bg-background border-input focus:ring-primary"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <div className="flex justify-end pt-6">
                            <Button
                              type="button"
                              onClick={() => setActiveTab("details")}
                              size="lg"
                              className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-200 w-auto"
                            >
                              Next: Event Details
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Event Details Tab */}
                    {activeTab === "details" && (
                      <div
                        className="p-8 animate-in slide-in-from-right-4 duration-500"
                      >
                        <div className="flex flex-col justify-center mb-8">
                          <h2 className="text-2xl font-bold text-foreground">Event Configuration</h2>
                          <p className="text-muted-foreground">
                            Update the important details and requirements
                          </p>
                        </div>
                        <div className="space-y-8">
                          <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                            <FormField
                              control={form.control}
                              name="maxParticipants"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                                    Maximum Participants *
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                      <Input
                                        type="number"
                                        min={2}
                                        max={1000}
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        className="h-12 pl-12 text-base bg-background border-input focus:ring-primary"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription className="text-muted-foreground">
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
                                  <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                                    Registration Fee
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <IndianRupee className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                      <Input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        className="h-12 pl-12 text-base bg-background border-input focus:ring-primary"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription className="text-muted-foreground">
                                    Set to 0 for free events. This helps cover venue and equipment costs.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                            <FormField
                              control={form.control}
                              name="difficulty"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                                    Difficulty Level *
                                  </FormLabel>
                                  <div className="space-y-3">
                                    {[
                                      {
                                        value: "Beginner",
                                        description: "Open to all skill levels - perfect for newcomers",
                                      },
                                      {
                                        value: "Intermediate",
                                        description: "Some experience required - moderate challenge",
                                      },
                                      {
                                        value: "Advanced",
                                        description: "High skill level required - competitive play",
                                      },
                                    ].map((level) => (
                                      <button
                                        key={level.value}
                                        type="button"
                                        onClick={() => field.onChange(level.value)}
                                        className={cn(
                                          "w-full p-4 rounded-xl border transition-all duration-200 text-left hover:translate-x-1",
                                          field.value === level.value
                                            ? "border-primary bg-primary/20 scale-[1.02]"
                                            : "border-border hover:border-muted-foreground/20"
                                        )}
                                      >
                                        <div className="flex flex-col justify-center">
                                          <h4 className="font-semibold text-sm sm:text-base text-foreground">{level.value}</h4>
                                          <p className="text-xs sm:text-sm text-muted-foreground">{level.description}</p>
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
                                  <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                                    Event Type *
                                  </FormLabel>
                                  <div className="space-y-3">
                                    {[
                                      {
                                        value: "casual",
                                        title: "Casual",
                                        description: "Fun and relaxed atmosphere - social play",
                                      },
                                      {
                                        value: "tournament",
                                        title: "Tournament",
                                        description: "Competitive event with rankings and prizes",
                                      },
                                      {
                                        value: "training",
                                        title: "Training",
                                        description: "Skill development and coaching session",
                                      },
                                    ].map((type) => (
                                      <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => field.onChange(type.value)}
                                        className={cn(
                                          "w-full p-4 rounded-xl border transition-all duration-200 text-left hover:translate-x-1",
                                          field.value === type.value
                                            ? "border-blue-500 bg-blue-900/20 scale-[1.02]"
                                            : "border-border hover:border-muted-foreground/20"
                                        )}
                                      >
                                        <div className="flex flex-col justify-center">
                                          <h4 className="font-semibold text-sm sm:text-base text-foreground">{type.title}</h4>
                                          <p className="text-xs sm:text-sm text-muted-foreground">{type.description}</p>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="flex sm:flex-row flex-col space-y-4 sm:space-y-0 justify-between pt-6">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setActiveTab("basic")}
                              size="lg"
                              className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl border-2 hover:bg-accent w-auto"
                            >
                              <ChevronLeft className="w-5 h-5 mr-2" />
                              Previous
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setActiveTab("media")}
                              size="lg"
                              className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-200 w-auto"
                            >
                              Next: Media & Rules
                              <ArrowRight className="w-5 h-5 ml-2" />
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
                        <div className="flex flex-col justify-center mb-8">
                          <h2 className="text-2xl font-bold text-foreground">Media & Guidelines</h2>
                          <p className="text-muted-foreground">
                            Update visual content and set expectations for participants
                          </p>
                        </div>
                        <div className="space-y-10">
                          {/* Images Section */}
                          <div className="space-y-6">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-semibold text-foreground">Event Images</h3>
                              <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground">Optional</Badge>
                            </div>

                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                              <div className="mb-6">
                                <h4 className="text-md font-medium text-foreground mb-3">
                                  Current Images
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                  {existingImages.map((image, index) => (
                                    <div
                                      key={index}
                                      className="relative group animate-in fade-in zoom-in-95 duration-300"
                                    >
                                      <img
                                        src={image.url || "/placeholder.svg?height=200&width=200"}
                                        alt={`Event ${index}`}
                                        className="w-full h-32 object-cover rounded-xl border border-border shadow-sm group-hover:shadow-md transition-all duration-200"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeExistingImage(index)}
                                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-md"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Image Upload Area */}
                            <div
                              className={cn(
                                "border-2 border-dashed border-border rounded-lg sm:rounded-2xl p-4 sm:p-8 text-center hover:border-blue-500 transition-colors duration-200 bg-muted/50",
                                dragActive
                                  ? "border-primary bg-muted"
                                  : "border-border hover:border-primary/50"
                              )}
                              onDragEnter={handleDrag}
                              onDragLeave={handleDrag}
                              onDragOver={handleDrag}
                              onDrop={handleDrop}
                            >
                              <div className="mb-4 sm:mb-6">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-lg sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md sm:shadow-lg">
                                  <ImagePlus className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                                </div>
                                <h4 className="text-base sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                                  Upload Event Images
                                </h4>
                                <p className="text-muted-foreground mb-2 sm:mb-3 text-xs sm:text-lg">
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
                                id="new-image-upload"
                              />
                              <label
                                htmlFor="new-image-upload"
                                className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl bg-primary text-white hover:bg-primary/90 transition-all duration-200 cursor-pointer shadow-md sm:shadow-lg hover:shadow-xl"
                              >
                                <Upload className="w-5 h-5 mr-3" />
                                <span className="text-sm sm:text-lg font-medium">Choose New Images</span>
                              </label>
                            </div>

                            {/* New Images Preview */}
                            {imagePreview.length > 0 && (
                              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h4 className="text-md font-medium text-foreground">
                                  New Images to Upload
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                  {imagePreview.map((src, index) => (
                                    <div
                                      key={index}
                                      className="relative group animate-in fade-in zoom-in duration-300"
                                      style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                      <img
                                        src={src || "/placeholder.svg"}
                                        alt={`New Preview ${index}`}
                                        className="w-full h-32 object-cover rounded-xl border border-border shadow-sm group-hover:shadow-md transition-all duration-200"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeNewImage(index)}
                                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-md"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
                            {/* Rules Section */}
                            <div className="space-y-4 sm:space-y-6">
                              <div className="flex items-center gap-2">
                                <h3 className="text-base sm:text-xl font-semibold text-foreground">Event Rules & Guidelines</h3>
                                <Badge variant="secondary" className="ml-2 text-xs sm:text-sm">Optional</Badge>                              </div>

                              <Card className="border-2 border-border">
                                <CardContent className="p-4 sm:p-6">
                                  <div className="flex flex-col  gap-2 sm:gap-3 mb-4">
                                    <Input
                                      value={newRule}
                                      onChange={(e) => setNewRule(e.target.value)}
                                      placeholder="Add a rule or guideline for participants..."
                                      className="flex-1 h-10 sm:h-12 text-xs sm:text-lg bg-background border-input focus:border-blue-500 rounded-md sm:rounded-lg p-4"
                                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRule())}
                                    />
                                    <div className="">

                                      <Button
                                        type="button"
                                        onClick={addRule}
                                        disabled={!newRule.trim()}
                                        className="h-10 sm:h-12 px-4 sm:px-6 bg-primary hover:bg-primary/90 text-white rounded-md sm:rounded-lg disabled:opacity-50 w-auto"
                                      >
                                        <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                                        Add Rule
                                      </Button>
                                    </div>
                                  </div>

                                  {form.getValues("rules")?.length > 0 ? (
                                    <div className="space-y-3">
                                      {form.getValues("rules").map((rule, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-md sm:rounded-lg bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-300"
                                        >
                                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                                            <span className="text-xs sm:text-sm font-bold text-white">
                                              {index + 1}
                                            </span>
                                          </div>
                                          <p className="flex-1 mt-1 text-foreground text-sm sm:text-base leading-relaxed">
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
                            <div className="space-y-6">
                              <div className="flex items-center gap-2">
                                <h3 className="text-base sm:text-xl font-semibold text-foreground">Required Equipment</h3>
                                <Badge variant="secondary" className="ml-2 text-xs sm:text-sm">Optional</Badge>
                              </div>

                              <Card className="border-2 border-border">
                                <CardContent className="p-4 sm:p-6">
                                  <div className="flex flex-col gap-2 sm:gap-3 mb-4">
                                    <Input
                                      value={newEquipment.item}
                                      onChange={(e) => setNewEquipment((prev) => ({ ...prev, item: e.target.value }))}
                                      placeholder="Add equipment needed for the event..."
                                      className="flex-1 h-10 sm:h-12 text-xs md:text-lg bg-background border-input focus:border-blue-500 rounded-md sm:rounded-lg p-4"
                                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addEquipment())}
                                    />
                                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                                      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-muted rounded-md sm:rounded-lg border border-border">
                                        <input
                                          type="checkbox"
                                          id="equipment-required"
                                          checked={newEquipment.required}
                                          onChange={(e) =>
                                            setNewEquipment((prev) => ({ ...prev, required: e.target.checked }))
                                          }
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
                                        className="h-10 sm:h-12 px-4 sm:px-6 bg-primary hover:bg-primary/90 text-white rounded-md sm:rounded-lg disabled:opacity-50 w-auto"
                                      >
                                        <Plus className="w-5 h-5 mr-2" />
                                        Add
                                      </Button>
                                    </div>


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
                                              <Badge variant="destructive" className="text-xs">
                                                Required
                                              </Badge>
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
                                    <div className="text-center py-8 border-2 border-dashed border-border rounded-lg bg-card/50 animate-in fade-in zoom-in duration-300">
                                      <h4 className="text-lg font-medium text-foreground mb-2">
                                        No Equipment Listed
                                      </h4>
                                      <p className="text-muted-foreground">
                                        List any equipment or gear participants should bring to the event.
                                      </p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                          </div>



                          <div className="flex sm:flex-row flex-col space-y-4 sm:space-y-0 justify-between pt-6">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setActiveTab("details")}
                              size="lg"
                              className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl border-2 hover:bg-accent w-auto"
                            >
                              <ChevronLeft className="w-5 h-5 mr-2" />
                              Previous
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setActiveTab("review")}
                              size="lg"
                              className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-200 w-auto"
                            >
                              Next: Review & Save
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Review Tab */}
                    {activeTab === "review" && (
                      <div
                        className="p-8 animate-in slide-in-from-right-4 duration-500"
                      >
                        <div className="flex flex-col justify-center mb-8">
                          <h2 className="text-2xl font-bold text-foreground">
                            Review & Save Changes
                          </h2>
                          <p className="text-muted-foreground">
                            Review all changes before saving your updated event
                          </p>
                        </div>

                        <div className="space-y-8">
                          {/* Event Summary Card */}
                          <Card className="bg-card border-border">
                            <CardContent className="p-8">
                              <div className="flex flex-col md:flex-row items-start gap-6">
                                {(existingImages.length > 0 || imagePreview.length > 0) ? (
                                  <img
                                    src={existingImages[0]?.url || imagePreview[0]}
                                    alt="Event preview"
                                    className="w-32 h-32 object-cover rounded-xl border border-border shadow-sm"
                                  />
                                ) : (
                                  <div className="w-32 h-32 bg-muted rounded-xl flex items-center justify-center">
                                    <Camera className="w-10 h-10 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="flex-1 space-y-4">
                                  <div>
                                    <h3 className="text-2xl font-bold text-foreground mb-2">
                                      {form.getValues("name") || "Event Name"}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                      <Badge variant="secondary" className="bg-muted text-foreground">
                                        {form.getValues("category") || "Category"}
                                      </Badge>
                                      <Badge variant="outline" className="border-border text-muted-foreground">
                                        {form.getValues("difficulty")}
                                      </Badge>
                                      <Badge variant="outline" className="border-border text-muted-foreground capitalize">
                                        {form.getValues("eventType")}
                                      </Badge>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />          <span className="text-foreground">
                                        {form.getValues("date") ? new Date(form.getValues("date")).toLocaleDateString() : "Date"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                                      <span className="text-foreground">
                                        {form.getValues("time") || "Time"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                                      <span className="text-foreground">
                                        {form.getValues("maxParticipants")} participants
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                                    <span className="text-foreground">
                                      {[
                                        form.getValues("location.address"),
                                        form.getValues("location.city"),
                                        form.getValues("location.state")
                                      ].filter(Boolean).join(", ") || "Location"}
                                    </span>
                                  </div>

                                  {form.getValues("registrationFee") > 0 && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                                      <span className="text-foreground font-semibold">
                                        {form.getValues("registrationFee")} registration fee
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {form.getValues("description") && (
                                <div className="mt-6 pt-6 border-t border-border">
                                  <p className="text-muted-foreground leading-relaxed">
                                    {form.getValues("description")}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Additional Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {form.getValues("rules")?.length > 0 && (
                              <Card className="border-border">
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                                    Event Rules ({form.getValues("rules").length})
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ul className="space-y-2">
                                    {form.getValues("rules").slice(0, 3).map((rule, index) => (
                                      <li key={index} className="flex items-start gap-2 text-sm">
                                        <span className="w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                          {index + 1}
                                        </span>
                                        <span className="text-muted-foreground">{rule}</span>
                                      </li>
                                    ))}
                                    {form.getValues("rules").length > 3 && (
                                      <li className="text-sm text-muted-foreground ml-7">
                                        ... and {form.getValues("rules").length - 3} more rules
                                      </li>
                                    )}
                                  </ul>
                                </CardContent>
                              </Card>
                            )}

                            {form.getValues("equipment")?.length > 0 && (
                              <Card className="border-border">
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                                    Equipment ({form.getValues("equipment").length})
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ul className="space-y-2">
                                    {form.getValues("equipment").slice(0, 4).map((item, index) => (
                                      <li key={index} className="flex items-center gap-2 text-sm">
                                        <CheckCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <span className="text-muted-foreground">{item.item}</span>
                                        {item.required && (
                                          <Badge variant="destructive" className="text-xs">Required</Badge>
                                        )}
                                      </li>
                                    ))}
                                    {form.getValues("equipment").length > 4 && (
                                      <li className="text-sm text-muted-foreground ml-6">
                                        ... and {form.getValues("equipment").length - 4} more items
                                      </li>
                                    )}
                                  </ul>
                                </CardContent>
                              </Card>
                            )}
                          </div>

                          {/* Completion Status */}
                          <Card className={cn(
                            "border-2",
                            completionProgress === 100
                              ? "border-primary/40 bg-primary/10"
                              : "border-orange-600/40 bg-orange-100 dark:bg-orange-950/20"
                          )}>
                            <CardContent className="p-6">
                              <div className="flex items-center gap-3 mb-4">
                                {completionProgress === 100 ? (
                                  <CheckCircle className="w-8 h-8 text-green-400" />
                                ) : (
                                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                                )}
                                <div>
                                  <h3 className="text-lg font-semibold text-foreground">
                                    {completionProgress === 100 ? "Event Ready to Update!" : "Complete Required Fields"}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {completionProgress === 100
                                      ? "All required information has been provided. Your event is ready to be updated."
                                      : "Please fill in all required fields to save your event changes."
                                    }
                                  </p>
                                </div>
                              </div>
                              <div className="relative">
                                <Progress value={completionProgress} className="h-2 bg-muted" />
                                <span className="text-sm font-medium text-muted-foreground mt-2 block">
                                  {Math.round(completionProgress)}% Complete
                                </span>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Action Buttons */}
                          <div className="flex sm:flex-row sm:space-y-0 flex-col space-y-4 justify-between pt-6">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setActiveTab("media")}
                              size="lg"
                              className="px-8 py-4 rounded-xl border-border hover:bg-muted text-foreground w-auto"
                            >
                              <ChevronLeft className="w-5 h-5 mr-2" />
                              Previous
                            </Button>

                            <div className="flex sm:flex-row flex-col gap-4">
                              <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                className="px-8 py-4 rounded-xl border-border hover:bg-muted text-foreground w-auto"
                                onClick={() => navigate(`/events/${id}`)}
                              >
                                Cancel Changes
                              </Button>

                              <Button
                                type="submit"
                                disabled={loading}
                                size="lg"
                                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 w-auto"
                              >
                                {loading ? (
                                  <>
                                    <div className="w-5 h-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin mr-2" />
                                    Updating Event...
                                  </>
                                ) : (
                                  <>
                                    Save Changes
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Event
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone and all registrations will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDelete(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEvent}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EditEvent
