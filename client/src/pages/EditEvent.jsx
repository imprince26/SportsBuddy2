import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { useEvents } from "@/hooks/useEvents"
import {
  Calendar, ImagePlus, X, ChevronLeft, Clock, MapPin, Users, Save, Eye, Upload, Plus,
  Trash2, CheckCircle, Award, Target, Shield, Camera,
  FileText, Settings, ArrowRight, Star, Trophy, DollarSign, AlertTriangle,
  MapPinIcon, UsersIcon, CalendarDays, Timer, Heart, Layers, Loader2
} from 'lucide-react'
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
      color: "from-blue-500 to-blue-600"
    },
    {
      id: "details",
      title: "Event Details",
      icon: Settings,
      description: "Date, time & location",
      color: "from-purple-500 to-purple-600"
    },
    {
      id: "media",
      title: "Media & Rules",
      icon: Camera,
      description: "Images, rules & equipment",
      color: "from-green-500 to-green-600"
    },
    {
      id: "review",
      title: "Review",
      icon: Eye,
      description: "Final review & publish",
      color: "from-orange-500 to-orange-600"
    },
  ]

  const categories = [
    { value: "Football", label: "Football", icon: "⚽", color: "from-green-400 to-green-600", participants: "50K+" },
    { value: "Basketball", label: "Basketball", icon: "🏀", color: "from-orange-400 to-orange-600", participants: "45K+" },
    { value: "Tennis", label: "Tennis", icon: "🎾", color: "from-yellow-400 to-yellow-600", participants: "30K+" },
    { value: "Running", label: "Running", icon: "🏃", color: "from-blue-400 to-blue-600", participants: "60K+" },
    { value: "Cycling", label: "Cycling", icon: "🚴", color: "from-purple-400 to-purple-600", participants: "25K+" },
    { value: "Swimming", label: "Swimming", icon: "🏊", color: "from-cyan-400 to-cyan-600", participants: "20K+" },
    { value: "Volleyball", label: "Volleyball", icon: "🏐", color: "from-pink-400 to-pink-600", participants: "15K+" },
    { value: "Cricket", label: "Cricket", icon: "🏏", color: "from-red-400 to-red-600", participants: "40K+" },
    { value: "Other", label: "Other Sports", icon: "🎯", color: "from-gray-400 to-gray-600", participants: "10K+" },
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
            difficulty: eventData.difficulty || "Beginner",
            eventType: eventData.eventType || "casual",
            registrationFee: eventData.registrationFee || 0,
            rules: eventData.rules || [],
            equipment: eventData.equipment || [],
          })
          setExistingImages(eventData.images || [])
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
    toast.success(`${validFiles.length} image(s) added successfully`)
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
    toast.success("Image removed")
  }

  const removeExistingImage = (index) => {
    const imageToRemove = existingImages[index]
    setDeletedImages((prev) => [...prev, imageToRemove.public_id])
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
    setHasChanges(true)
    toast.success("Image marked for removal")
  }

  const addRule = () => {
    if (newRule.trim()) {
      form.setValue("rules", [...form.getValues("rules"), newRule.trim()])
      setNewRule("")
      setHasChanges(true)
      toast.success("Rule added successfully")
    }
  }

  const removeRule = (index) => {
    const updatedRules = form.getValues("rules").filter((_, i) => i !== index)
    form.setValue("rules", updatedRules)
    setHasChanges(true)
    toast.success("Rule removed")
  }

  const addEquipment = () => {
    if (newEquipment.item.trim()) {
      form.setValue("equipment", [
        ...form.getValues("equipment"),
        { item: newEquipment.item.trim(), required: newEquipment.required },
      ])
      setNewEquipment({ item: "", required: false })
      setHasChanges(true)
      toast.success("Equipment added successfully")
    }
  }

  const removeEquipment = (index) => {
    const updatedEquipment = form.getValues("equipment").filter((_, i) => i !== index)
    form.setValue("equipment", updatedEquipment)
    setHasChanges(true)
    toast.success("Equipment removed")
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
        toast.success("Event updated successfully! 🎉")
        setHasChanges(false)
        navigate(`/events/${id}`)
      }
    } catch (error) {
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
            ? `bg-gradient-to-br ${step.color} text-white shadow-lg scale-110`
            : isCompleted
              ? "bg-gradient-to-br from-green-500 to-green-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700"
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse" />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center"
          >
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              Loading event details...
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Preparing your event for editing
            </p>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  if (!form.getValues("name")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-4">
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-red-200/50 dark:border-red-700/50 shadow-2xl">
            <CardContent className="p-8 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Event Not Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The event you're looking for doesn't exist or you don't have permission to edit it.
              </p>
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <Link to="/events">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Events
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-blue-400/10 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-purple-400/10 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <Button
                variant="ghost"
                asChild
                className="p-1 sm:p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg sm:rounded-xl"
              >
                <Link to={`/events/${id}`}>
                  <ChevronLeft className="w-4 h-4 sm:w-5 h-5" />
                </Link>
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      Edit Event
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-lg">
                      Update your event details and settings
                    </p>
                  </div>
                </div>
                {hasChanges && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Unsaved Changes
                  </Badge>
                )}
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowConfirmDelete(true)}
                className="shadow-lg hover:shadow-xl transition-shadow"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Event
              </Button>
            </div>

            {/* Progress Section */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-lg sm:shadow-xl">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-md sm:rounded-lg flex items-center justify-center">
                      <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
                        Event Update Progress
                      </span>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Complete all fields to finalize your event updates
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                      {Math.round(completionProgress)}%
                    </span>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Complete</p>
                  </div>
                </div>
                <div className="relative">
                  <Progress value={completionProgress} className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700" />
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-20 blur-sm"
                    style={{ width: `${completionProgress}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Step Navigation */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <div className="grid md:grid-cols-4 grid-cols-1 gap-3 sm:gap-4">
              {steps.map((step, index) => (
                <motion.button
                  key={step.id}
                  onClick={() => setActiveTab(step.id)}
                  className={cn(
                    "p-4 sm:p-6 rounded-lg sm:rounded-2xl border-2 transition-all duration-300 text-left group",
                    activeTab === step.id
                      ? "border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-800 shadow-lg sm:shadow-xl scale-100 sm:scale-105"
                      : "border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md"
                  )}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                    {getStepIcon(step, index)}
                    <div className="flex-1">
                      <h3
                        className={cn(
                          "font-semibold text-base sm:text-lg transition-colors",
                          activeTab === step.id ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
                        )}
                      >
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{step.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Step {index + 1} of {steps.length}
                    </span>
                    {activeTab === step.id && <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Main Form */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-lg sm:shadow-2xl">
              <CardContent className="p-0">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
                    {/* Basic Info Tab */}
                    {activeTab === "basic" && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="p-4 sm:p-8"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-2xl flex items-center justify-center shadow-md sm:shadow-lg">
                            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Basic Information</h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-lg">
                              Update the essential details about your event
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
                                <FormLabel className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                                  Event Name *
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter an exciting and descriptive event name"
                                    {...field}
                                    className="h-12 sm:h-14 text-base sm:text-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg sm:rounded-xl shadow-sm transition-all duration-200 w-full"
                                  />
                                </FormControl>
                                <FormDescription className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
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
                                <FormLabel className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                  <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                                  Sport Category *
                                </FormLabel>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                  {categories.map((category) => (
                                    <motion.button
                                      key={category.value}
                                      type="button"
                                      onClick={() => field.onChange(category.value)}
                                      className={cn(
                                        "p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 text-left group",
                                        field.value === category.value
                                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-100 sm:scale-105"
                                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md"
                                      )}
                                      whileHover={{ y: -2 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                        <div
                                          className={cn(
                                            "w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl bg-gradient-to-br",
                                            category.color
                                          )}
                                        >
                                          {category.icon}
                                        </div>
                                        <div className="flex-1">
                                          <h3 className="font-semibold text-base sm:text-gray-900 dark:text-white">{category.label}</h3>
                                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                            {category.participants} players
                                          </p>
                                        </div>
                                      </div>
                                    </motion.button>
                                  ))}
                                </div>
                                <FormDescription className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
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
                                <FormLabel className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                                  Event Description *
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Describe your event in detail. What makes it special? What should participants expect? Include any special features, prizes, or unique aspects of your event..."
                                    rows={4}
                                    {...field}
                                    className="text-base sm:text-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg sm:rounded-xl shadow-sm transition-all duration-200 resize-none w-full"
                                  />
                                </FormControl>
                                <FormDescription className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
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
                                  <FormLabel className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                                    Event Date *
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Calendar className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                      <Input
                                        type="date"
                                        {...field}
                                        className="h-12 sm:h-14 pl-10 sm:pl-12 text-base sm:text-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg sm:rounded-xl shadow-sm transition-all duration-200 w-full"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
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
                                  <FormLabel className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                                    Start Time *
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Clock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                      <Input
                                        type="time"
                                        {...field}
                                        className="h-12 sm:h-14 pl-10 sm:pl-12 text-base sm:text-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg sm:rounded-xl shadow-sm transition-all duration-200 w-full"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
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
                              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Location Details</h3>
                            </div>

                            <div className="grid md:grid-cols-2 grid-cols-1 gap-4 sm:gap-6">
                              <FormField
                                control={form.control}
                                name="location.address"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Address *</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                        <Input
                                          placeholder="Enter the complete venue address"
                                          {...field}
                                          className="h-12 sm:h-14 pl-10 sm:pl-12 text-base sm:text-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg sm:rounded-xl shadow-sm transition-all duration-200 w-full"
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
                                    <FormLabel className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">City *</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Enter city name"
                                        {...field}
                                        className="h-12 sm:h-14 text-base sm:text-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg sm:rounded-xl shadow-sm transition-all duration-200 w-full"
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
                                    <FormLabel className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                      State/Province
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Enter state (optional)"
                                        {...field}
                                        className="h-12 sm:h-14 text-base sm:text-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg sm:rounded-xl shadow-sm transition-all duration-200 w-full"
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
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
                            >
                              Next: Event Details
                              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Event Details Tab */}
                    {activeTab === "details" && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="p-4 sm:p-8"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-2xl flex items-center justify-center shadow-md sm:shadow-lg">
                            <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Event Configuration</h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-lg">
                              Update the important details and requirements
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
                                  <FormLabel className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                                    Maximum Participants *
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Users className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                      <Input
                                        type="number"
                                        min={2}
                                        max={1000}
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        className="h-12 sm:h-14 pl-10 sm:pl-12 text-base sm:text-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg sm:rounded-xl shadow-sm transition-all duration-200 w-full"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
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
                                  <FormLabel className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                                    Registration Fee ($)
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <DollarSign className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                      <Input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        className="h-12 sm:h-14 pl-10 sm:pl-12 text-base sm:text-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg sm:rounded-xl shadow-sm transition-all duration-200 w-full"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
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
                                  <FormLabel className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                                    Difficulty Level *
                                  </FormLabel>
                                  <div className="space-y-2 sm:space-y-3">
                                    {[
                                      {
                                        value: "Beginner",
                                        color: "from-green-400 to-green-600",
                                        icon: "🌱",
                                        description: "Open to all skill levels - perfect for newcomers",
                                      },
                                      {
                                        value: "Intermediate",
                                        color: "from-yellow-400 to-orange-500",
                                        icon: "⚡",
                                        description: "Some experience required - moderate challenge",
                                      },
                                      {
                                        value: "Advanced",
                                        color: "from-red-400 to-red-600",
                                        icon: "🔥",
                                        description: "High skill level required - competitive play",
                                      },
                                    ].map((level) => (
                                      <motion.button
                                        key={level.value}
                                        type="button"
                                        onClick={() => field.onChange(level.value)}
                                        className={cn(
                                          "w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 text-left",
                                          field.value === level.value
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-100 sm:scale-105"
                                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                        )}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                      >
                                        <div className="flex items-center gap-2 sm:gap-3">
                                          <div
                                            className={cn(
                                              "w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg flex items-center justify-center text-base sm:text-lg bg-gradient-to-br",
                                              level.color
                                            )}
                                          >
                                            {level.icon}
                                          </div>
                                          <div className="flex-1">
                                            <h4 className="font-semibold text-base sm:text-gray-900 dark:text-white">{level.value}</h4>
                                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{level.description}</p>
                                          </div>
                                        </div>
                                      </motion.button>
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
                                  <FormLabel className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                                    Event Type *
                                  </FormLabel>
                                  <div className="space-y-2 sm:space-y-3">
                                    {[
                                      {
                                        value: "casual",
                                        icon: Heart,
                                        color: "from-blue-400 to-blue-600",
                                        title: "Casual",
                                        description: "Fun and relaxed atmosphere - social play",
                                      },
                                      {
                                        value: "tournament",
                                        icon: Trophy,
                                        color: "from-yellow-400 to-orange-500",
                                        title: "Tournament",
                                        description: "Competitive event with rankings and prizes",
                                      },
                                      {
                                        value: "training",
                                        icon: Target,
                                        color: "from-green-400 to-green-600",
                                        title: "Training",
                                        description: "Skill development and coaching session",
                                      },
                                    ].map((type) => (
                                      <motion.button
                                        key={type.value}
                                        type="button"
                                        onClick={() => field.onChange(type.value)}
                                        className={cn(
                                          "w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 text-left",
                                          field.value === type.value
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-100 sm:scale-105"
                                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                        )}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                      >
                                        <div className="flex items-center gap-2 sm:gap-3">
                                          <div
                                            className={cn(
                                              "w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg flex items-center justify-center bg-gradient-to-br",
                                              type.color
                                            )}
                                          >
                                            <type.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                          </div>
                                          <div className="flex-1">
                                            <h4 className="font-semibold text-base sm:text-gray-900 dark:text-white">{type.title}</h4>
                                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
                                          </div>
                                        </div>
                                      </motion.button>
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
                              className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full sm:w-auto"
                            >
                              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                              Previous
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setActiveTab("media")}
                              size="lg"
                              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
                            >
                              Next: Media & Rules
                              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Media & Rules Tab */}
                    {activeTab === "media" && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="p-4 sm:p-8"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-2xl flex items-center justify-center shadow-md sm:shadow-lg">
                            <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Media & Guidelines</h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-lg">
                              Update visual content and set expectations for participants
                            </p>
                          </div>
                        </div>
                        <div className="space-y-8 sm:space-y-10">
                          {/* Images Section */}
                          <div className="space-y-4 sm:space-y-6">
                            <div className="flex items-center gap-2">
                              <ImagePlus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Event Images</h3>
                              <Badge variant="secondary" className="ml-2 text-xs sm:text-sm">Optional</Badge>
                            </div>

                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                              <div className="mb-6">
                                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                                  Current Images
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                  <AnimatePresence>
                                    {existingImages.map((image, index) => (
                                      <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="relative group"
                                      >
                                        <img
                                          src={image.url || "/placeholder.svg?height=200&width=200"}
                                          alt={`Event ${index}`}
                                          className="w-full h-24 sm:h-32 object-cover rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm sm:shadow-md group-hover:shadow-lg transition-all duration-200"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeExistingImage(index)}
                                          className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-md"
                                        >
                                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </button>
                                      </motion.div>
                                    ))}
                                  </AnimatePresence>
                                </div>
                              </div>
                            )}

                            {/* Image Upload Area */}
                            <div
                              className={cn(
                                "border-2 border-dashed rounded-2xl p-8 text-center transition-colors duration-200 bg-gray-50/50 dark:bg-gray-800/50",
                                dragActive
                                  ? "border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                  : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                              )}
                              onDragEnter={handleDrag}
                              onDragLeave={handleDrag}
                              onDragOver={handleDrag}
                              onDrop={handleDrop}
                            >
                              <div className="mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                  <ImagePlus className="w-10 h-10 text-white" />
                                </div>
                                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                  Upload New Images
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400 mb-3 text-lg">
                                  Add more stunning visuals to your event
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  PNG, JPG, WEBP up to 5MB each • Maximum 5 images total
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
                                className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl"
                              >
                                <Upload className="w-5 h-5 mr-3" />
                                <span className="text-lg font-medium">Choose New Images</span>
                              </label>
                            </div>

                            {/* New Images Preview */}
                            <AnimatePresence>
                              {imagePreview.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                  className="space-y-3"
                                >
                                  <h4 className="text-md font-medium text-gray-900 dark:text-white">
                                    New Images to Upload
                                  </h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {imagePreview.map((src, index) => (
                                      <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className="relative group"
                                      >
                                        <img
                                          src={src || "/placeholder.svg"}
                                          alt={`New Preview ${index}`}
                                          className="w-full h-32 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-md group-hover:shadow-lg transition-all duration-200"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeNewImage(index)}
                                          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </motion.div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Rules Section */}
                          <div className="space-y-6">
                            <div className="flex items-center gap-2">
                              <Shield className="w-6 h-6 text-green-500" />
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Event Rules & Guidelines
                              </h3>
                              <Badge variant="secondary" className="ml-2">Optional</Badge>
                            </div>

                            <Card className="border-2 border-gray-200 dark:border-gray-700">
                              <CardContent className="p-6">
                                <div className="flex gap-3 mb-4">
                                  <Input
                                    value={newRule}
                                    onChange={(e) => setNewRule(e.target.value)}
                                    placeholder="Add a rule or guideline for participants..."
                                    className="flex-1 h-12 text-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
                                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRule())}
                                  />
                                  <Button
                                    type="button"
                                    onClick={addRule}
                                    disabled={!newRule.trim()}
                                    className="h-12 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg disabled:opacity-50"
                                  >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Add Rule
                                  </Button>
                                </div>

                                <AnimatePresence>
                                  {form.getValues("rules")?.length > 0 ? (
                                    <div className="space-y-3">
                                      {form.getValues("rules").map((rule, index) => (
                                        <motion.div
                                          key={index}
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: -10 }}
                                          className="flex items-start gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700"
                                        >
                                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 mt-1">
                                            <span className="text-sm font-bold text-white">
                                              {index + 1}
                                            </span>
                                          </div>
                                          <p className="flex-1 text-gray-900 dark:text-white text-lg leading-relaxed">
                                            {rule}
                                          </p>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeRule(index)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </motion.div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                                      <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No Rules Added Yet
                                      </h4>
                                      <p className="text-gray-600 dark:text-gray-400">
                                        Add rules to help participants understand expectations and guidelines.
                                      </p>
                                    </div>
                                  )}
                                </AnimatePresence>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Equipment Section */}
                          <div className="space-y-6">
                            <div className="flex items-center gap-2">
                              <Target className="w-6 h-6 text-purple-500" />
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Required Equipment
                              </h3>
                              <Badge variant="secondary" className="ml-2">Optional</Badge>
                            </div>

                            <Card className="border-2 border-gray-200 dark:border-gray-700">
                              <CardContent className="p-6">
                                <div className="flex gap-3 mb-4">
                                  <Input
                                    value={newEquipment.item}
                                    onChange={(e) => setNewEquipment((prev) => ({ ...prev, item: e.target.value }))}
                                    placeholder="Add equipment needed for the event..."
                                    className="flex-1 h-12 text-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
                                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addEquipment())}
                                  />
                                  <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <input
                                      type="checkbox"
                                      id="equipment-required"
                                      checked={newEquipment.required}
                                      onChange={(e) =>
                                        setNewEquipment((prev) => ({ ...prev, required: e.target.checked }))
                                      }
                                      className="w-4 h-4 text-blue-600"
                                    />
                                    <label
                                      htmlFor="equipment-required"
                                      className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap"
                                    >
                                      Required
                                    </label>
                                  </div>
                                  <Button
                                    type="button"
                                    onClick={addEquipment}
                                    disabled={!newEquipment.item.trim()}
                                    className="h-12 px-6 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg disabled:opacity-50"
                                  >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Add
                                  </Button>
                                </div>

                                <AnimatePresence>
                                  {form.getValues("equipment")?.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {form.getValues("equipment").map((item, index) => (
                                        <motion.div
                                          key={index}
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: -10 }}
                                          className="flex items-center justify-between p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700"
                                        >
                                          <div className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-purple-500" />
                                            <span className="text-gray-900 dark:text-white font-medium">
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
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </motion.div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                                      <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No Equipment Listed
                                      </h4>
                                      <p className="text-gray-600 dark:text-gray-400">
                                        List any equipment or gear participants should bring to the event.
                                      </p>
                                    </div>
                                  )}
                                </AnimatePresence>
                              </CardContent>
                            </Card>
                          </div>

                          <div className="flex justify-between pt-6">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setActiveTab("details")}
                              size="lg"
                              className="px-8 py-4 rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <ChevronLeft className="w-5 h-5 mr-2" />
                              Previous
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setActiveTab("review")}
                              size="lg"
                              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                              Next: Review & Save
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Review Tab */}
                    {activeTab === "review" && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="p-8"
                      >
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Eye className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                              Review & Save Changes
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">
                              Review all changes before saving your updated event
                            </p>
                          </div>
                        </div>

                        <div className="space-y-8">
                          {/* Event Summary Card */}
                          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700">
                            <CardContent className="p-8">
                              <div className="flex items-start gap-6">
                                {(existingImages.length > 0 || imagePreview.length > 0) ? (
                                  <img
                                    src={existingImages[0]?.url || imagePreview[0]}
                                    alt="Event preview"
                                    className="w-32 h-32 object-cover rounded-2xl border-2 border-white dark:border-gray-700 shadow-lg"
                                  />
                                ) : (
                                  <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center">
                                    <Camera className="w-12 h-12 text-gray-400" />
                                  </div>
                                )}
                                <div className="flex-1 space-y-4">
                                  <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                      {form.getValues("name") || "Event Name"}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                      <Badge variant="secondary" className="text-xs">
                                        {form.getValues("category") || "Category"}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {form.getValues("difficulty")}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs capitalize">
                                        {form.getValues("eventType")}
                                      </Badge>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4 text-blue-500" />
                                      <span className="text-gray-900 dark:text-white">
                                        {form.getValues("date") ? new Date(form.getValues("date")).toLocaleDateString() : "Date"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-orange-500" />
                                      <span className="text-gray-900 dark:text-white">
                                        {form.getValues("time") || "Time"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Users className="w-4 h-4 text-green-500" />
                                      <span className="text-gray-900 dark:text-white">
                                        {form.getValues("maxParticipants")} participants
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-red-500" />
                                    <span className="text-gray-900 dark:text-white">
                                      {[
                                        form.getValues("location.address"),
                                        form.getValues("location.city"),
                                        form.getValues("location.state")
                                      ].filter(Boolean).join(", ") || "Location"}
                                    </span>
                                  </div>

                                  {form.getValues("registrationFee") > 0 && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <DollarSign className="w-4 h-4 text-green-500" />
                                      <span className="text-gray-900 dark:text-white font-semibold">
                                        ${form.getValues("registrationFee")} registration fee
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {form.getValues("description") && (
                                <div className="mt-6 pt-6 border-t border-blue-200 dark:border-blue-700">
                                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {form.getValues("description")}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Additional Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {form.getValues("rules")?.length > 0 && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2 text-lg">
                                    <Shield className="w-5 h-5 text-green-500" />
                                    Event Rules ({form.getValues("rules").length})
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ul className="space-y-2">
                                    {form.getValues("rules").slice(0, 3).map((rule, index) => (
                                      <li key={index} className="flex items-start gap-2 text-sm">
                                        <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                          {index + 1}
                                        </span>
                                        <span className="text-gray-700 dark:text-gray-300">{rule}</span>
                                      </li>
                                    ))}
                                    {form.getValues("rules").length > 3 && (
                                      <li className="text-sm text-gray-500 dark:text-gray-400 ml-7">
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
                                  <CardTitle className="flex items-center gap-2 text-lg">
                                    <Target className="w-5 h-5 text-purple-500" />
                                    Equipment ({form.getValues("equipment").length})
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ul className="space-y-2">
                                    {form.getValues("equipment").slice(0, 4).map((item, index) => (
                                      <li key={index} className="flex items-center gap-2 text-sm">
                                        <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                        <span className="text-gray-700 dark:text-gray-300">{item.item}</span>
                                        {item.required && (
                                          <Badge variant="destructive" className="text-xs">Required</Badge>
                                        )}
                                      </li>
                                    ))}
                                    {form.getValues("equipment").length > 4 && (
                                      <li className="text-sm text-gray-500 dark:text-gray-400 ml-6">
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
                              ? "border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
                              : "border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/20"
                          )}>
                            <CardContent className="p-6">
                              <div className="flex items-center gap-3 mb-4">
                                {completionProgress === 100 ? (
                                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                                ) : (
                                  <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                                )}
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {completionProgress === 100 ? "Event Ready to Update!" : "Complete Required Fields"}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {completionProgress === 100
                                      ? "All required information has been provided. Your event is ready to be updated."
                                      : "Please fill in all required fields to save your event changes."
                                    }
                                  </p>
                                </div>
                              </div>
                              <div className="relative">
                                <Progress value={completionProgress} className="h-2" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2 block">
                                  {Math.round(completionProgress)}% Complete
                                </span>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Action Buttons */}
                          <div className="flex justify-between pt-6">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setActiveTab("media")}
                              size="lg"
                              className="px-8 py-4 rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <ChevronLeft className="w-5 h-5 mr-2" />
                              Previous
                            </Button>

                            <div className="flex gap-4">
                              <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                className="px-8 py-4 rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                                onClick={() => navigate(`/events/${id}`)}
                              >
                                Cancel Changes
                              </Button>

                              <Button
                                type="submit"
                                disabled={loading || completionProgress < 100}
                                size="lg"
                                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                              >
                                {loading ? (
                                  <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Updating Event...
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-5 h-5 mr-2" />
                                    Save Changes
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
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
