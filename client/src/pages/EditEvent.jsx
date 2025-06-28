import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import * as z from "zod"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { useEvents } from "@/hooks/useEvents"
import {
  Calendar,
  MapPin,
  Users,
  ImagePlus,
  X,
  ChevronLeft,
  Trash2,
  AlertTriangle,
  Loader2,
  Eye,
  Camera,
  FileText,
  Settings,
  Save,
  Star,
  Trophy,
  Target,
  Zap,
  CheckCircle,
  Plus,
  Edit3,
  Upload,
  ImageIcon,
  Info,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Enhanced validation schema
const eventSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000),
  date: z.string().refine((date) => new Date(date) > new Date(), {
    message: "Event date must be in the future",
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  location: z.object({
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().optional(),
  }),
  maxParticipants: z.number().min(2, "Minimum 2 participants").max(1000, "Maximum 1000 participants"),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  eventType: z.enum(["casual", "tournament", "training"]),
  registrationFee: z.number().min(0, "Registration fee cannot be negative"),
  rules: z.array(z.string()).optional(),
  equipment: z
    .array(
      z.object({
        item: z.string(),
        required: z.boolean(),
      }),
    )
    .optional(),
})

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
    defaultValues: {
      name: "",
      category: "",
      description: "",
      date: "",
      time: "",
      location: {
        address: "",
        city: "",
        state: "",
      },
      maxParticipants: 10,
      difficulty: "Beginner",
      eventType: "casual",
      registrationFee: 0,
      rules: [],
      equipment: [],
    },
  })

  const categories = [
    { value: "Football", label: "Football", icon: "⚽", color: "from-green-400 to-green-600" },
    { value: "Basketball", label: "Basketball", icon: "🏀", color: "from-orange-400 to-orange-600" },
    { value: "Tennis", label: "Tennis", icon: "🎾", color: "from-yellow-400 to-yellow-600" },
    { value: "Running", label: "Running", icon: "🏃", color: "from-blue-400 to-blue-600" },
    { value: "Cycling", label: "Cycling", icon: "🚴", color: "from-purple-400 to-purple-600" },
    { value: "Swimming", label: "Swimming", icon: "🏊", color: "from-cyan-400 to-cyan-600" },
    { value: "Volleyball", label: "Volleyball", icon: "🏐", color: "from-pink-400 to-pink-600" },
    { value: "Cricket", label: "Cricket", icon: "🏏", color: "from-red-400 to-red-600" },
    { value: "Other", label: "Other", icon: "🎯", color: "from-gray-400 to-gray-600" },
  ]

  const difficultyConfig = {
    Beginner: { icon: Star, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/20" },
    Intermediate: { icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/20" },
    Advanced: { icon: Target, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/20" },
  }

  const eventTypeConfig = {
    casual: { icon: Users, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/20" },
    tournament: { icon: Trophy, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/20" },
    training: { icon: Zap, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/20" },
  }

  // Calculate completion progress
  const calculateProgress = useCallback(() => {
    const values = form.getValues()
    let completed = 0
    const total = 10

    if (values.name) completed++
    if (values.category) completed++
    if (values.description) completed++
    if (values.date) completed++
    if (values.time) completed++
    if (values.location.address) completed++
    if (values.location.city) completed++
    if (values.maxParticipants > 0) completed++
    if (existingImages.length > 0 || newImages.length > 0) completed++
    if (values.difficulty) completed++

    setCompletionProgress((completed / total) * 100)
  }, [form, existingImages.length, newImages.length])

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
      <div className="min-h-screen bg-gradient-to-br from-background-light via-background-light to-muted-light/30 dark:from-background-dark dark:via-background-dark dark:to-muted-dark/30 flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-primary-light dark:text-primary-dark" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-primary-light/20 dark:border-primary-dark/20 rounded-full animate-pulse" />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center"
          >
            <p className="text-lg font-medium text-foreground-light dark:text-foreground-dark">
              Loading event details...
            </p>
            <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
              Preparing your event for editing
            </p>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  if (!form.getValues("name")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-light via-background-light to-muted-light/30 dark:from-background-dark dark:via-background-dark dark:to-muted-dark/30 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-4">
          <Card className="bg-card-light dark:bg-card-dark border-destructive-light/20 dark:border-destructive-dark/20 shadow-2xl">
            <CardContent className="p-8 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
                <AlertTriangle className="w-16 h-16 text-destructive-light dark:text-destructive-dark mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                Event Not Found
              </h3>
              <p className="text-muted-foreground-light dark:text-muted-foreground-dark mb-6">
                The event you're looking for doesn't exist or you don't have permission to edit it.
              </p>
              <Button
                asChild
                className="bg-primary-light dark:bg-primary-dark hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 shadow-lg"
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
    <div className="min-h-screen bg-gradient-to-br from-background-light via-background-light to-muted-light/30 dark:from-background-dark dark:via-background-dark dark:to-muted-dark/30">
      <div className="container mx-auto px-4 py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
          >
            <div className="space-y-2">
              <Link
                to={`/events/${id}`}
                className="inline-flex items-center text-primary-light dark:text-primary-dark hover:text-primary-light/80 dark:hover:text-primary-dark/80 transition-colors group"
              >
                <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                Back to Event
              </Link>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">Edit Event</h1>
                {hasChanges && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200"
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Unsaved Changes
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
                Update your event details and settings
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark">
                <CheckCircle className="w-4 h-4 text-primary-light dark:text-primary-dark" />
                <span className="text-sm font-medium text-foreground-light dark:text-foreground-dark">
                  {Math.round(completionProgress)}% Complete
                </span>
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
          </motion.div>

          {/* Progress Bar */}
          <motion.div variants={itemVariants}>
            <Card className="bg-card-light dark:bg-card-dark shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground-light dark:text-foreground-dark">
                    Event Completion
                  </span>
                  <span className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                    {Math.round(completionProgress)}%
                  </span>
                </div>
                <Progress value={completionProgress} className="h-2 bg-muted-light dark:bg-muted-dark" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Form */}
          <motion.div variants={itemVariants}>
            <Card className="bg-card-light dark:bg-card-dark shadow-2xl border-0 overflow-hidden">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="border-b border-border-light dark:border-border-dark bg-muted-light/50 dark:bg-muted-dark/50">
                      <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0">
                        <TabsTrigger
                          value="basic"
                          className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-card-light dark:data-[state=active]:bg-card-dark data-[state=active]:shadow-sm"
                        >
                          <FileText className="w-4 h-4" />
                          <span className="hidden sm:inline">Basic Info</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="details"
                          className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-card-light dark:data-[state=active]:bg-card-dark data-[state=active]:shadow-sm"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="hidden sm:inline">Details</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="media"
                          className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-card-light dark:data-[state=active]:bg-card-dark data-[state=active]:shadow-sm"
                        >
                          <Camera className="w-4 h-4" />
                          <span className="hidden sm:inline">Media</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="review"
                          className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-card-light dark:data-[state=active]:bg-card-dark data-[state=active]:shadow-sm"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">Review</span>
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="p-8">
                      <TabsContent value="basic" className="space-y-8 mt-0">
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-primary-light dark:text-primary-dark" />
                              Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-foreground-light dark:text-foreground-dark font-medium">
                                      Event Name *
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Enter event name"
                                        {...field}
                                        className="bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark focus:border-primary-light dark:focus:border-primary-dark transition-colors"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-foreground-light dark:text-foreground-dark font-medium">
                                      Category *
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark">
                                          <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {categories.map((category) => (
                                          <SelectItem key={category.value} value={category.value}>
                                            <div className="flex items-center gap-2">
                                              <span className="text-lg">{category.icon}</span>
                                              <span>{category.label}</span>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-foreground-light dark:text-foreground-dark font-medium">
                                  Description *
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Describe your event in detail..."
                                    rows={4}
                                    {...field}
                                    className="bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark focus:border-primary-light dark:focus:border-primary-dark transition-colors resize-none"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div>
                            <h4 className="text-lg font-medium text-foreground-light dark:text-foreground-dark mb-4 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-primary-light dark:text-primary-dark" />
                              Date & Time
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-foreground-light dark:text-foreground-dark font-medium">
                                      Date *
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type="date"
                                        {...field}
                                        className="bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark focus:border-primary-light dark:focus:border-primary-dark transition-colors"
                                      />
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
                                    <FormLabel className="text-foreground-light dark:text-foreground-dark font-medium">
                                      Time *
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type="time"
                                        {...field}
                                        className="bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark focus:border-primary-light dark:focus:border-primary-dark transition-colors"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <div>
                            <h4 className="text-lg font-medium text-foreground-light dark:text-foreground-dark mb-4 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary-light dark:text-primary-dark" />
                              Location
                            </h4>
                            <div className="space-y-4">
                              <FormField
                                control={form.control}
                                name="location.address"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-foreground-light dark:text-foreground-dark font-medium">
                                      Address *
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Enter full address"
                                        {...field}
                                        className="bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark focus:border-primary-light dark:focus:border-primary-dark transition-colors"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="location.city"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-foreground-light dark:text-foreground-dark font-medium">
                                        City *
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Enter city"
                                          {...field}
                                          className="bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark focus:border-primary-light dark:focus:border-primary-dark transition-colors"
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
                                      <FormLabel className="text-foreground-light dark:text-foreground-dark font-medium">
                                        State
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Enter state (optional)"
                                          {...field}
                                          className="bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark focus:border-primary-light dark:focus:border-primary-dark transition-colors"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="details" className="space-y-8 mt-0">
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4 flex items-center gap-2">
                              <Settings className="w-5 h-5 text-primary-light dark:text-primary-dark" />
                              Event Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={form.control}
                                name="maxParticipants"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-foreground-light dark:text-foreground-dark font-medium">
                                      Maximum Participants
                                    </FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground-light dark:text-muted-foreground-dark w-4 h-4" />
                                        <Input
                                          type="number"
                                          min={2}
                                          max={1000}
                                          {...field}
                                          onChange={(e) => field.onChange(Number(e.target.value))}
                                          className="pl-10 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark focus:border-primary-light dark:focus:border-primary-dark transition-colors"
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="registrationFee"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-foreground-light dark:text-foreground-dark font-medium">
                                      Registration Fee ($)
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        className="bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark focus:border-primary-light dark:focus:border-primary-dark transition-colors"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="difficulty"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-foreground-light dark:text-foreground-dark font-medium">
                                    Difficulty Level
                                  </FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark">
                                        <SelectValue placeholder="Select difficulty" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {Object.entries(difficultyConfig).map(([key, config]) => {
                                        const IconComponent = config.icon
                                        return (
                                          <SelectItem key={key} value={key}>
                                            <div className="flex items-center gap-2">
                                              <IconComponent className={`w-4 h-4 ${config.color}`} />
                                              <span>{key}</span>
                                            </div>
                                          </SelectItem>
                                        )
                                      })}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="eventType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-foreground-light dark:text-foreground-dark font-medium">
                                    Event Type
                                  </FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark">
                                        <SelectValue placeholder="Select event type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {Object.entries(eventTypeConfig).map(([key, config]) => {
                                        const IconComponent = config.icon
                                        return (
                                          <SelectItem key={key} value={key}>
                                            <div className="flex items-center gap-2">
                                              <IconComponent className={`w-4 h-4 ${config.color}`} />
                                              <span className="capitalize">{key}</span>
                                            </div>
                                          </SelectItem>
                                        )
                                      })}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Rules Section */}
                          <div>
                            <h4 className="text-lg font-medium text-foreground-light dark:text-foreground-dark mb-4">
                              Event Rules (Optional)
                            </h4>
                            <div className="space-y-4">
                              <div className="flex gap-2">
                                <Input
                                  value={newRule}
                                  onChange={(e) => setNewRule(e.target.value)}
                                  placeholder="Add a rule..."
                                  className="flex-1 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark focus:border-primary-light dark:focus:border-primary-dark transition-colors"
                                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRule())}
                                />
                                <Button
                                  type="button"
                                  onClick={addRule}
                                  disabled={!newRule.trim()}
                                  className="bg-primary-light dark:bg-primary-dark hover:bg-primary-light/90 dark:hover:bg-primary-dark/90"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              {form.getValues("rules")?.length > 0 && (
                                <div className="space-y-2">
                                  <AnimatePresence>
                                    {form.getValues("rules").map((rule, index) => (
                                      <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark"
                                      >
                                        <span className="text-foreground-light dark:text-foreground-dark">
                                          {index + 1}. {rule}
                                        </span>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeRule(index)}
                                          className="text-destructive-light dark:text-destructive-dark hover:bg-destructive-light/10 dark:hover:bg-destructive-dark/10"
                                        >
                                          <X className="w-4 h-4" />
                                        </Button>
                                      </motion.div>
                                    ))}
                                  </AnimatePresence>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Equipment Section */}
                          <div>
                            <h4 className="text-lg font-medium text-foreground-light dark:text-foreground-dark mb-4">
                              Required Equipment (Optional)
                            </h4>
                            <div className="space-y-4">
                              <div className="flex gap-2">
                                <Input
                                  value={newEquipment.item}
                                  onChange={(e) => setNewEquipment((prev) => ({ ...prev, item: e.target.value }))}
                                  placeholder="Add equipment..."
                                  className="flex-1 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark focus:border-primary-light dark:focus:border-primary-dark transition-colors"
                                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addEquipment())}
                                />
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id="equipment-required"
                                    checked={newEquipment.required}
                                    onChange={(e) =>
                                      setNewEquipment((prev) => ({ ...prev, required: e.target.checked }))
                                    }
                                    className="rounded border-input-light dark:border-input-dark"
                                  />
                                  <label
                                    htmlFor="equipment-required"
                                    className="text-sm text-foreground-light dark:text-foreground-dark whitespace-nowrap"
                                  >
                                    Required
                                  </label>
                                </div>
                                <Button
                                  type="button"
                                  onClick={addEquipment}
                                  disabled={!newEquipment.item.trim()}
                                  className="bg-primary-light dark:bg-primary-dark hover:bg-primary-light/90 dark:hover:bg-primary-dark/90"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              {form.getValues("equipment")?.length > 0 && (
                                <div className="space-y-2">
                                  <AnimatePresence>
                                    {form.getValues("equipment").map((item, index) => (
                                      <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="text-foreground-light dark:text-foreground-dark">
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
                                          className="text-destructive-light dark:text-destructive-dark hover:bg-destructive-light/10 dark:hover:bg-destructive-dark/10"
                                        >
                                          <X className="w-4 h-4" />
                                        </Button>
                                      </motion.div>
                                    ))}
                                  </AnimatePresence>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="media" className="space-y-8 mt-0">
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4 flex items-center gap-2">
                              <Camera className="w-5 h-5 text-primary-light dark:text-primary-dark" />
                              Event Images
                            </h3>

                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                              <div className="mb-6">
                                <h4 className="text-md font-medium text-foreground-light dark:text-foreground-dark mb-3">
                                  Current Images
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                  <AnimatePresence>
                                    {existingImages.map((image, index) => (
                                      <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="relative group"
                                      >
                                        <div className="aspect-square rounded-lg overflow-hidden bg-muted-light dark:bg-muted-dark">
                                          <img
                                            src={image.url || "/placeholder.svg?height=200&width=200"}
                                            alt={`Event ${index}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          />
                                        </div>
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => removeExistingImage(index)}
                                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </motion.div>
                                    ))}
                                  </AnimatePresence>
                                </div>
                              </div>
                            )}

                            {/* Image Upload Area */}
                            <div
                              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                                dragActive
                                  ? "border-primary-light dark:border-primary-dark bg-primary-light/5 dark:bg-primary-dark/5"
                                  : "border-input-light dark:border-input-dark hover:border-primary-light dark:hover:border-primary-dark"
                              }`}
                              onDragEnter={handleDrag}
                              onDragLeave={handleDrag}
                              onDragOver={handleDrag}
                              onDrop={handleDrop}
                            >
                              <div className="space-y-4">
                                <div className="mx-auto w-16 h-16 rounded-full bg-primary-light/10 dark:bg-primary-dark/10 flex items-center justify-center">
                                  <Upload className="w-8 h-8 text-primary-light dark:text-primary-dark" />
                                </div>
                                <div>
                                  <p className="text-lg font-medium text-foreground-light dark:text-foreground-dark">
                                    Drop images here or click to upload
                                  </p>
                                  <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                                    PNG, JPG, WEBP up to 5MB each (max 5 images)
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
                                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors cursor-pointer shadow-lg"
                                >
                                  <ImagePlus className="w-4 h-4" />
                                  <span>Choose Images</span>
                                </label>
                              </div>
                            </div>

                            {/* New Images Preview */}
                            {imagePreview.length > 0 && (
                              <div>
                                <h4 className="text-md font-medium text-foreground-light dark:text-foreground-dark mb-3">
                                  New Images to Add
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                  <AnimatePresence>
                                    {imagePreview.map((src, index) => (
                                      <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="relative group"
                                      >
                                        <div className="aspect-square rounded-lg overflow-hidden bg-muted-light dark:bg-muted-dark">
                                          <img
                                            src={src || "/placeholder.svg"}
                                            alt={`Preview ${index}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          />
                                        </div>
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => removeNewImage(index)}
                                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                        <div className="absolute bottom-2 left-2">
                                          <Badge className="bg-green-500 text-white">New</Badge>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </AnimatePresence>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="review" className="space-y-8 mt-0">
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4 flex items-center gap-2">
                              <Eye className="w-5 h-5 text-primary-light dark:text-primary-dark" />
                              Review Your Event
                            </h3>
                            <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
                              Review all the details before updating your event.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Basic Info Card */}
                            <Card className="bg-muted-light/50 dark:bg-muted-dark/50 border-border-light dark:border-border-dark">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-foreground-light dark:text-foreground-dark">
                                  <Info className="w-4 h-4" />
                                  Basic Information
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark">
                                    Name:
                                  </span>
                                  <p className="text-foreground-light dark:text-foreground-dark">
                                    {form.getValues("name") || "Not set"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark">
                                    Category:
                                  </span>
                                  <p className="text-foreground-light dark:text-foreground-dark">
                                    {form.getValues("category") || "Not set"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark">
                                    Date & Time:
                                  </span>
                                  <p className="text-foreground-light dark:text-foreground-dark">
                                    {form.getValues("date") && form.getValues("time")
                                      ? `${format(new Date(form.getValues("date")), "MMM dd, yyyy")} at ${form.getValues("time")}`
                                      : "Not set"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark">
                                    Location:
                                  </span>
                                  <p className="text-foreground-light dark:text-foreground-dark">
                                    {form.getValues("location.address")
                                      ? `${form.getValues("location.address")}, ${form.getValues("location.city")}`
                                      : "Not set"}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Event Details Card */}
                            <Card className="bg-muted-light/50 dark:bg-muted-dark/50 border-border-light dark:border-border-dark">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-foreground-light dark:text-foreground-dark">
                                  <Settings className="w-4 h-4" />
                                  Event Details
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark">
                                    Max Participants:
                                  </span>
                                  <p className="text-foreground-light dark:text-foreground-dark">
                                    {form.getValues("maxParticipants")}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark">
                                    Difficulty:
                                  </span>
                                  <p className="text-foreground-light dark:text-foreground-dark">
                                    {form.getValues("difficulty")}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark">
                                    Event Type:
                                  </span>
                                  <p className="text-foreground-light dark:text-foreground-dark capitalize">
                                    {form.getValues("eventType")}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark">
                                    Registration Fee:
                                  </span>
                                  <p className="text-foreground-light dark:text-foreground-dark">
                                    ${form.getValues("registrationFee") || 0}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Description */}
                          {form.getValues("description") && (
                            <Card className="bg-muted-light/50 dark:bg-muted-dark/50 border-border-light dark:border-border-dark">
                              <CardHeader>
                                <CardTitle className="text-foreground-light dark:text-foreground-dark">
                                  Description
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-foreground-light dark:text-foreground-dark whitespace-pre-wrap">
                                  {form.getValues("description")}
                                </p>
                              </CardContent>
                            </Card>
                          )}

                          {/* Rules and Equipment */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {form.getValues("rules")?.length > 0 && (
                              <Card className="bg-muted-light/50 dark:bg-muted-dark/50 border-border-light dark:border-border-dark">
                                <CardHeader>
                                  <CardTitle className="text-foreground-light dark:text-foreground-dark">
                                    Rules
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ol className="list-decimal list-inside space-y-1">
                                    {form.getValues("rules").map((rule, index) => (
                                      <li key={index} className="text-foreground-light dark:text-foreground-dark">
                                        {rule}
                                      </li>
                                    ))}
                                  </ol>
                                </CardContent>
                              </Card>
                            )}

                            {form.getValues("equipment")?.length > 0 && (
                              <Card className="bg-muted-light/50 dark:bg-muted-dark/50 border-border-light dark:border-border-dark">
                                <CardHeader>
                                  <CardTitle className="text-foreground-light dark:text-foreground-dark">
                                    Equipment
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ul className="space-y-1">
                                    {form.getValues("equipment").map((item, index) => (
                                      <li
                                        key={index}
                                        className="flex items-center gap-2 text-foreground-light dark:text-foreground-dark"
                                      >
                                        <span>{item.item}</span>
                                        {item.required && (
                                          <Badge variant="destructive" className="text-xs">
                                            Required
                                          </Badge>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </CardContent>
                              </Card>
                            )}
                          </div>

                          {/* Images Preview */}
                          {(existingImages.length > 0 || imagePreview.length > 0) && (
                            <Card className="bg-muted-light/50 dark:bg-muted-dark/50 border-border-light dark:border-border-dark">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-foreground-light dark:text-foreground-dark">
                                  <ImageIcon className="w-4 h-4" />
                                  Event Images ({existingImages.length + imagePreview.length})
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                  {existingImages.map((image, index) => (
                                    <div
                                      key={`existing-${index}`}
                                      className="aspect-square rounded-lg overflow-hidden bg-muted-light dark:bg-muted-dark"
                                    >
                                      <img
                                        src={image.url || "/placeholder.svg?height=100&width=100"}
                                        alt={`Event ${index}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ))}
                                  {imagePreview.map((src, index) => (
                                    <div
                                      key={`new-${index}`}
                                      className="relative aspect-square rounded-lg overflow-hidden bg-muted-light dark:bg-muted-dark"
                                    >
                                      <img
                                        src={src || "/placeholder.svg"}
                                        alt={`Preview ${index}`}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute top-1 right-1">
                                        <Badge className="bg-green-500 text-white text-xs">New</Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      </TabsContent>
                    </div>

                    {/* Navigation and Submit */}
                    <div className="border-t border-border-light dark:border-border-dark bg-muted-light/30 dark:bg-muted-dark/30 p-6">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          {activeTab !== "basic" && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const currentIndex = ["basic", "details", "media", "review"].indexOf(activeTab)
                                if (currentIndex > 0) {
                                  setActiveTab(["basic", "details", "media", "review"][currentIndex - 1])
                                }
                              }}
                              className="border-input-light dark:border-input-dark"
                            >
                              <ArrowLeft className="w-4 h-4 mr-2" />
                              Previous
                            </Button>
                          )}
                          {activeTab !== "review" && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const currentIndex = ["basic", "details", "media", "review"].indexOf(activeTab)
                                if (currentIndex < 3) {
                                  setActiveTab(["basic", "details", "media", "review"][currentIndex + 1])
                                }
                              }}
                              className="border-input-light dark:border-input-dark"
                            >
                              Next
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {hasChanges && (
                            <span className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                              You have unsaved changes
                            </span>
                          )}
                          <Button
                            type="submit"
                            disabled={loading}
                            className="bg-primary-light dark:bg-primary-dark hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            {loading ? (
                              <div className="flex items-center">
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                <span>Updating...</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Save className="w-4 h-4 mr-2" />
                                <span>Update Event</span>
                              </div>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Tabs>
                </form>
              </Form>
            </Card>
          </motion.div>
        </motion.div>

        {/* Delete Confirmation Dialog */}
        <AnimatePresence>
          {showConfirmDelete && (
            <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
              <DialogContent className="bg-card-light dark:bg-card-dark border-destructive-light/20 dark:border-destructive-dark/20">
                <DialogHeader>
                  <DialogTitle className="flex items-center text-foreground-light dark:text-foreground-dark">
                    <AlertTriangle className="mr-2 text-destructive-light dark:text-destructive-dark" size={24} />
                    Delete Event
                  </DialogTitle>
                  <DialogDescription className="text-foreground-light dark:text-foreground-dark">
                    Are you sure you want to delete this event? This action cannot be undone and all associated data
                    will be permanently removed.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmDelete(false)}
                    className="border-input-light dark:border-input-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                  >
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteEvent} disabled={loading} className="shadow-lg">
                    {loading ? (
                      <div className="flex items-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span>Deleting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Trash2 className="w-4 h-4 mr-2" />
                        <span>Delete Event</span>
                      </div>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default EditEvent
