import { useState, useEffect, useCallback } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import * as z from "zod"
import { toast } from "react-hot-toast"
import { useEvents } from "@/hooks/useEvents"
import { Calendar, ImagePlus, X, ChevronLeft, Clock, MapPin, Users, Save, Eye, Upload, Plus, Trash2, CheckCircle, AlertCircle, Sparkles, Target, Shield, Zap, Globe, Camera, FileText, Settings } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

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

const CreateEventForm = () => {
  const navigate = useNavigate()
  const { createEvent } = useEvents()
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState([])
  const [imagePreview, setImagePreview] = useState([])
  const [newRule, setNewRule] = useState("")
  const [newEquipment, setNewEquipment] = useState({ item: "", required: false })
  const [currentStep, setCurrentStep] = useState(0)
  const [completionProgress, setCompletionProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("basic")

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

  const steps = [
    { id: "basic", title: "Basic Info", icon: FileText },
    { id: "details", title: "Event Details", icon: Settings },
    { id: "media", title: "Media & Rules", icon: Camera },
    { id: "review", title: "Review", icon: Eye },
  ]

  const categories = [
    { value: "Football", label: "Football", icon: "⚽", color: "bg-green-500" },
    { value: "Basketball", label: "Basketball", icon: "🏀", color: "bg-orange-500" },
    { value: "Tennis", label: "Tennis", icon: "🎾", color: "bg-yellow-500" },
    { value: "Running", label: "Running", icon: "🏃", color: "bg-blue-500" },
    { value: "Cycling", label: "Cycling", icon: "🚴", color: "bg-purple-500" },
    { value: "Swimming", label: "Swimming", icon: "🏊", color: "bg-cyan-500" },
    { value: "Volleyball", label: "Volleyball", icon: "🏐", color: "bg-pink-500" },
    { value: "Cricket", label: "Cricket", icon: "🏏", color: "bg-red-500" },
    { value: "Other", label: "Other", icon: "🎯", color: "bg-gray-500" },
  ]

  // Page Title
  useEffect(() => {
    document.title = "Create Event - SportsBuddy"
  }, [])

  // Calculate completion progress
  const calculateProgress = useCallback(() => {
    const values = form.getValues()
    let completed = 0
    const total = 8

    if (values.name) completed++
    if (values.category) completed++
    if (values.description) completed++
    if (values.date) completed++
    if (values.time) completed++
    if (values.location.address) completed++
    if (values.location.city) completed++
    if (values.maxParticipants > 0) completed++

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
      const data = { ...formData, images: images }
      const result = await createEvent(data)

      if (result.success) {
        toast.success("Event created successfully! 🎉")
        navigate(`/events/${result.event._id}`)
      }
    } catch (error) {
      toast.error(error.message || "Failed to create event")
    } finally {
      setIsLoading(false)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light via-background-light to-muted-light/30 dark:from-background-dark dark:via-background-dark dark:to-muted-dark/30">
      <div className="container mx-auto px-4 py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" asChild className="p-2">
                <Link to="/events">
                  <ChevronLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">
                  Create New Event
                </h1>
                <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
                  Organize an amazing sports event for your community
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <Card className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary-light dark:text-primary-dark" />
                    <span className="font-medium text-foreground-light dark:text-foreground-dark">
                      Event Creation Progress
                    </span>
                  </div>
                  <span className="text-sm font-medium text-primary-light dark:text-primary-dark">
                    {Math.round(completionProgress)}% Complete
                  </span>
                </div>
                <Progress value={completionProgress} className="h-2" />
                <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark mt-2">
                  Fill in all required fields to create your event
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Form */}
          <motion.div variants={itemVariants}>
            <Card className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark shadow-xl">
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="border-b border-border-light dark:border-border-dark">
                    <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0">
                      {steps.map((step, index) => (
                        <TabsTrigger
                          key={step.id}
                          value={step.id}
                          className={cn(
                            "flex flex-col items-center gap-2 p-6 rounded-none border-b-2 border-transparent data-[state=active]:border-primary-light dark:data-[state=active]:border-primary-dark data-[state=active]:bg-primary-light/5 dark:data-[state=active]:bg-primary-dark/5",
                            "hover:bg-muted-light/50 dark:hover:bg-muted-dark/50 transition-all duration-200",
                          )}
                        >
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                              activeTab === step.id
                                ? "bg-primary-light dark:bg-primary-dark text-white"
                                : "bg-muted-light dark:bg-muted-dark text-muted-foreground-light dark:text-muted-foreground-dark",
                            )}
                          >
                            <step.icon className="w-5 h-5" />
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-sm text-foreground-light dark:text-foreground-dark">
                              {step.title}
                            </p>
                            <p className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">
                              Step {index + 1}
                            </p>
                          </div>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <div className="p-8">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <TabsContent value="basic" className="space-y-6 mt-0">
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-12 h-12 rounded-xl bg-primary-light/20 dark:bg-primary-dark/20 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-primary-light dark:text-primary-dark" />
                              </div>
                              <div>
                                <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
                                  Basic Information
                                </h2>
                                <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
                                  Tell us about your event
                                </p>
                              </div>
                            </div>

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
                                        placeholder="Enter an exciting event name"
                                        {...field}
                                        className="h-12 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark focus:border-primary-light dark:focus:border-primary-dark transition-colors"
                                      />
                                    </FormControl>
                                    <FormDescription className="text-muted-foreground-light dark:text-muted-foreground-dark">
                                      Choose a catchy name that describes your event
                                    </FormDescription>
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
                                      Sport Category *
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="h-12 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark">
                                          <SelectValue placeholder="Select a sport category" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                                        {categories.map((category) => (
                                          <SelectItem key={category.value} value={category.value}>
                                            <div className="flex items-center gap-3">
                                              <span className="text-lg">{category.icon}</span>
                                              <span>{category.label}</span>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormDescription className="text-muted-foreground-light dark:text-muted-foreground-dark">
                                      What sport will this event focus on?
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-foreground-light dark:text-foreground-dark font-medium">
                                    Event Description *
                                  </FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Describe your event in detail. What makes it special? What should participants expect?"
                                      rows={6}
                                      {...field}
                                      className="bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark focus:border-primary-light dark:focus:border-primary-dark transition-colors resize-none"
                                    />
                                  </FormControl>
                                  <FormDescription className="text-muted-foreground-light dark:text-muted-foreground-dark">
                                    Provide details about the event, what to expect, and any special features
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-foreground-light dark:text-foreground-dark font-medium">
                                      Event Date *
                                    </FormLabel>
                                    <div className="relative">
                                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground-light dark:text-muted-foreground-dark w-5 h-5" />
                                      <FormControl>
                                        <Input
                                          type="date"
                                          {...field}
                                          className="h-12 pl-12 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark focus:border-primary-light dark:focus:border-primary-dark transition-colors"
                                        />
                                      </FormControl>
                                    </div>
                                    <FormDescription className="text-muted-foreground-light dark:text-muted-foreground-dark">
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
                                    <FormLabel className="text-foreground-light dark:text-foreground-dark font-medium">
                                      Start Time *
                                    </FormLabel>
                                    <div className="relative">
                                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground-light dark:text-muted-foreground-dark w-5 h-5" />
                                      <FormControl>
                                        <Input
                                          type="time"
                                          {...field}
                                          className="h-12 pl-12 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark focus:border-primary-light dark:focus:border-primary-dark transition-colors"
                                        />
                                      </FormControl>
                                    </div>
                                    <FormDescription className="text-muted-foreground-light dark:text-muted-foreground-dark">
                                      What time does the event start?
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
                                Location Details
                              </h3>
                              <FormField
                                control={form.control}
                                name="location.address"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-foreground-light dark:text-foreground-dark font-medium">
                                      Address *
                                    </FormLabel>
                                    <div className="relative">
                                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground-light dark:text-muted-foreground-dark w-5 h-5" />
                                      <FormControl>
                                        <Input
                                          placeholder="Enter the full address"
                                          {...field}
                                          className="h-12 pl-12 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark focus:border-primary-light dark:focus:border-primary-dark transition-colors"
                                        />
                                      </FormControl>
                                    </div>
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
                                          className="h-12 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark focus:border-primary-light dark:focus:border-primary-dark transition-colors"
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
                                        State/Province
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Enter state (optional)"
                                          {...field}
                                          className="h-12 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark focus:border-primary-light dark:focus:border-primary-dark transition-colors"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>

                            <div className="flex justify-end">
                              <Button
                                type="button"
                                onClick={() => setActiveTab("details")}
                                className="bg-primary-light dark:bg-primary-dark hover:bg-primary-light/90 dark:hover:bg-primary-dark/90"
                              >
                                Next: Event Details
                                <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
                              </Button>
                            </div>
                          </motion.div>
                        </TabsContent>

                        <TabsContent value="details" className="space-y-6 mt-0">
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-12 h-12 rounded-xl bg-accent-light/20 dark:bg-accent-dark/20 flex items-center justify-center">
                                <Settings className="w-6 h-6 text-accent-light dark:text-accent-dark" />
                              </div>
                              <div>
                                <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
                                  Event Details
                                </h2>
                                <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
                                  Configure your event settings
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={form.control}
                                name="maxParticipants"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-foreground-light dark:text-foreground-dark font-medium">
                                      Maximum Participants
                                    </FormLabel>
                                    <div className="relative">
                                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground-light dark:text-muted-foreground-dark w-5 h-5" />
                                      <FormControl>
                                        <Input
                                          type="number"
                                          min={2}
                                          max={1000}
                                          {...field}
                                          onChange={(e) => field.onChange(Number(e.target.value))}
                                          className="h-12 pl-12 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark focus:border-primary-light dark:focus:border-primary-dark transition-colors"
                                        />
                                      </FormControl>
                                    </div>
                                    <FormDescription className="text-muted-foreground-light dark:text-muted-foreground-dark">
                                      How many people can join this event?
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
                                        className="h-12 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark focus:border-primary-light dark:focus:border-primary-dark transition-colors"
                                      />
                                    </FormControl>
                                    <FormDescription className="text-muted-foreground-light dark:text-muted-foreground-dark">
                                      Set to 0 for free events
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

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
                                        <SelectTrigger className="h-12 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark">
                                          <SelectValue placeholder="Select difficulty" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                                        <SelectItem value="Beginner">
                                          <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-success-light dark:bg-success-dark" />
                                            <span>Beginner - Open to all skill levels</span>
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="Intermediate">
                                          <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-accent-light dark:bg-accent-dark" />
                                            <span>Intermediate - Some experience required</span>
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="Advanced">
                                          <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-destructive-light dark:bg-destructive-dark" />
                                            <span>Advanced - High skill level required</span>
                                          </div>
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormDescription className="text-muted-foreground-light dark:text-muted-foreground-dark">
                                      What skill level is required for participants?
                                    </FormDescription>
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
                                        <SelectTrigger className="h-12 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark">
                                          <SelectValue placeholder="Select event type" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                                        <SelectItem value="casual">
                                          <div className="flex items-center gap-2">
                                            <Target className="w-4 h-4" />
                                            <span>Casual - Fun and relaxed</span>
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="tournament">
                                          <div className="flex items-center gap-2">
                                            <Zap className="w-4 h-4" />
                                            <span>Tournament - Competitive event</span>
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="training">
                                          <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4" />
                                            <span>Training - Skill development</span>
                                          </div>
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormDescription className="text-muted-foreground-light dark:text-muted-foreground-dark">
                                      What type of event are you organizing?
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="flex justify-between">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setActiveTab("basic")}
                                className="border-input-light dark:border-input-dark"
                              >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Previous
                              </Button>
                              <Button
                                type="button"
                                onClick={() => setActiveTab("media")}
                                className="bg-primary-light dark:bg-primary-dark hover:bg-primary-light/90 dark:hover:bg-primary-dark/90"
                              >
                                Next: Media & Rules
                                <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
                              </Button>
                            </div>
                          </motion.div>
                        </TabsContent>

                        <TabsContent value="media" className="space-y-6 mt-0">
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-12 h-12 rounded-xl bg-success-light/20 dark:bg-success-dark/20 flex items-center justify-center">
                                <Camera className="w-6 h-6 text-success-light dark:text-success-dark" />
                              </div>
                              <div>
                                <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
                                  Media & Rules
                                </h2>
                                <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
                                  Add images, rules, and equipment requirements
                                </p>
                              </div>
                            </div>

                            {/* Images Section */}
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
                                Event Images
                              </h3>
                              <div className="border-2 border-dashed border-input-light dark:border-input-dark rounded-xl p-8 text-center hover:border-primary-light dark:hover:border-primary-dark transition-colors">
                                <div className="mb-4">
                                  <div className="w-16 h-16 bg-primary-light/20 dark:bg-primary-dark/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ImagePlus className="w-8 h-8 text-primary-light dark:text-primary-dark" />
                                  </div>
                                  <h4 className="text-lg font-medium text-foreground-light dark:text-foreground-dark mb-2">
                                    Upload Event Images
                                  </h4>
                                  <p className="text-muted-foreground-light dark:text-muted-foreground-dark mb-2">
                                    Drag and drop images here, or click to select files
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
                                  className="inline-flex items-center px-6 py-3 rounded-lg bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors cursor-pointer"
                                >
                                  <Upload className="w-5 h-5 mr-2" />
                                  <span>Choose Images</span>
                                </label>
                              </div>

                              {imagePreview.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                  {imagePreview.map((src, index) => (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ duration: 0.3 }}
                                      className="relative group"
                                    >
                                      <img
                                        src={src || "/placeholder.svg"}
                                        alt={`Preview ${index}`}
                                        className="w-full h-32 object-cover rounded-lg border border-border-light dark:border-border-dark"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-destructive-light dark:bg-destructive-dark text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </motion.div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Rules Section */}
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
                                Event Rules (Optional)
                              </h3>
                              <div className="flex gap-3">
                                <Input
                                  value={newRule}
                                  onChange={(e) => setNewRule(e.target.value)}
                                  placeholder="Add a rule for your event"
                                  className="flex-1 h-12 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark"
                                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRule())}
                                />
                                <Button
                                  type="button"
                                  onClick={addRule}
                                  disabled={!newRule.trim()}
                                  className="h-12 px-6 bg-primary-light dark:bg-primary-dark hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 disabled:opacity-50"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Rule
                                </Button>
                              </div>

                              {form.getValues("rules")?.length > 0 ? (
                                <div className="space-y-2">
                                  {form.getValues("rules").map((rule, index) => (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="flex items-center justify-between p-4 rounded-lg border border-border-light dark:border-border-dark bg-muted-light/30 dark:bg-muted-dark/30"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-primary-light/20 dark:bg-primary-dark/20 flex items-center justify-center flex-shrink-0">
                                          <span className="text-xs font-medium text-primary-light dark:text-primary-dark">
                                            {index + 1}
                                          </span>
                                        </div>
                                        <span className="text-foreground-light dark:text-foreground-dark">{rule}</span>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeRule(index)}
                                        className="text-muted-foreground-light dark:text-muted-foreground-dark hover:text-destructive-light dark:hover:text-destructive-dark"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </motion.div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 border border-dashed border-border-light dark:border-border-dark rounded-lg">
                                  <Shield className="w-12 h-12 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-3" />
                                  <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
                                    No rules added yet. Add rules to help participants understand expectations.
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Equipment Section */}
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
                                Required Equipment (Optional)
                              </h3>
                              <div className="flex gap-3">
                                <Input
                                  value={newEquipment.item}
                                  onChange={(e) => setNewEquipment((prev) => ({ ...prev, item: e.target.value }))}
                                  placeholder="Add equipment needed for the event"
                                  className="flex-1 h-12 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark"
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
                                    className="w-4 h-4 text-primary-light dark:text-primary-dark"
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
                                  className="h-12 px-6 bg-primary-light dark:bg-primary-dark hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 disabled:opacity-50"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add
                                </Button>
                              </div>

                              {form.getValues("equipment")?.length > 0 ? (
                                <div className="space-y-2">
                                  {form.getValues("equipment").map((item, index) => (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="flex items-center justify-between p-4 rounded-lg border border-border-light dark:border-border-dark bg-muted-light/30 dark:bg-muted-dark/30"
                                    >
                                      <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-success-light dark:text-success-dark" />
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
                                        className="text-muted-foreground-light dark:text-muted-foreground-dark hover:text-destructive-light dark:hover:text-destructive-dark"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </motion.div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 border border-dashed border-border-light dark:border-border-dark rounded-lg">
                                  <Target className="w-12 h-12 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-3" />
                                  <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
                                    No equipment added yet. List any gear participants should bring.
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-between">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setActiveTab("details")}
                                className="border-input-light dark:border-input-dark"
                              >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Previous
                              </Button>
                              <Button
                                type="button"
                                onClick={() => setActiveTab("review")}
                                className="bg-primary-light dark:bg-primary-dark hover:bg-primary-light/90 dark:hover:bg-primary-dark/90"
                              >
                                Review Event
                                <Eye className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          </motion.div>
                        </TabsContent>

                        <TabsContent value="review" className="space-y-6 mt-0">
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-12 h-12 rounded-xl bg-destructive-light/20 dark:bg-destructive-dark/20 flex items-center justify-center">
                                <Eye className="w-6 h-6 text-destructive-light dark:text-destructive-dark" />
                              </div>
                              <div>
                                <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
                                  Review Your Event
                                </h2>
                                <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
                                  Double-check everything before creating your event
                                </p>
                              </div>
                            </div>

                            {/* Event Preview */}
                            <Card className="border-border-light dark:border-border-dark">
                              <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <CardTitle className="text-2xl text-foreground-light dark:text-foreground-dark">
                                      {form.getValues("name") || "Event Name"}
                                    </CardTitle>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge variant="secondary">
                                        {categories.find((c) => c.value === form.getValues("category"))?.icon}{" "}
                                        {form.getValues("category") || "Category"}
                                      </Badge>
                                      <Badge
                                        variant={
                                          form.getValues("difficulty") === "Beginner"
                                            ? "default"
                                            : form.getValues("difficulty") === "Intermediate"
                                              ? "secondary"
                                              : "destructive"
                                        }
                                      >
                                        {form.getValues("difficulty")}
                                      </Badge>
                                      <Badge variant="outline">{form.getValues("eventType")}</Badge>
                                    </div>
                                  </div>
                                  {form.getValues("registrationFee") > 0 && (
                                    <div className="text-right">
                                      <p className="text-2xl font-bold text-success-light dark:text-success-dark">
                                        ${form.getValues("registrationFee")}
                                      </p>
                                      <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                                        Registration Fee
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-6">
                                <div>
                                  <h4 className="font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                                    Description
                                  </h4>
                                  <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
                                    {form.getValues("description") || "No description provided"}
                                  </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted-light/30 dark:bg-muted-dark/30">
                                    <Calendar className="w-5 h-5 text-primary-light dark:text-primary-dark" />
                                    <div>
                                      <p className="font-medium text-foreground-light dark:text-foreground-dark">
                                        {form.getValues("date") || "Date not set"}
                                      </p>
                                      <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                                        Event Date
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted-light/30 dark:bg-muted-dark/30">
                                    <Clock className="w-5 h-5 text-primary-light dark:text-primary-dark" />
                                    <div>
                                      <p className="font-medium text-foreground-light dark:text-foreground-dark">
                                        {form.getValues("time") || "Time not set"}
                                      </p>
                                      <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                                        Start Time
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted-light/30 dark:bg-muted-dark/30">
                                    <Users className="w-5 h-5 text-primary-light dark:text-primary-dark" />
                                    <div>
                                      <p className="font-medium text-foreground-light dark:text-foreground-dark">
                                        {form.getValues("maxParticipants")} people
                                      </p>
                                      <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                                        Max Participants
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                                    Location
                                  </h4>
                                  <div className="flex items-start gap-2">
                                    <MapPin className="w-5 h-5 text-primary-light dark:text-primary-dark mt-0.5" />
                                    <div>
                                      <p className="text-foreground-light dark:text-foreground-dark">
                                        {form.getValues("location.address") || "Address not provided"}
                                      </p>
                                      <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                                        {form.getValues("location.city")}{" "}
                                        {form.getValues("location.state") && `, ${form.getValues("location.state")}`}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {imagePreview.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold text-foreground-light dark:text-foreground-dark mb-3">
                                      Event Images ({imagePreview.length})
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                      {imagePreview.slice(0, 4).map((src, index) => (
                                        <img
                                          key={index}
                                          src={src || "/placeholder.svg"}
                                          alt={`Preview ${index}`}
                                          className="w-full h-20 object-cover rounded-lg border border-border-light dark:border-border-dark"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {form.getValues("rules")?.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold text-foreground-light dark:text-foreground-dark mb-3">
                                      Event Rules ({form.getValues("rules").length})
                                    </h4>
                                    <ul className="space-y-2">
                                      {form.getValues("rules").map((rule, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                          <span className="w-5 h-5 rounded-full bg-primary-light/20 dark:bg-primary-dark/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-xs font-medium text-primary-light dark:text-primary-dark">
                                              {index + 1}
                                            </span>
                                          </span>
                                          <span className="text-foreground-light dark:text-foreground-dark">
                                            {rule}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {form.getValues("equipment")?.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold text-foreground-light dark:text-foreground-dark mb-3">
                                      Required Equipment ({form.getValues("equipment").length})
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {form.getValues("equipment").map((item, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-2 p-2 rounded-lg bg-muted-light/30 dark:bg-muted-dark/30"
                                        >
                                          <CheckCircle className="w-4 h-4 text-success-light dark:text-success-dark" />
                                          <span className="text-foreground-light dark:text-foreground-dark">
                                            {item.item}
                                          </span>
                                          {item.required && (
                                            <Badge variant="destructive" className="text-xs">
                                              Required
                                            </Badge>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>

                            <div className="flex justify-between">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setActiveTab("media")}
                                className="border-input-light dark:border-input-dark"
                              >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Previous
                              </Button>
                              <Button
                                type="submit"
                                disabled={isLoading || completionProgress < 100}
                                className="bg-success-light dark:bg-success-dark hover:bg-success-light/90 dark:hover:bg-success-dark/90 text-white px-8"
                              >
                                {isLoading ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Creating Event...</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    <span>Create Event</span>
                                  </div>
                                )}
                              </Button>
                            </div>
                          </motion.div>
                        </TabsContent>
                      </form>
                    </Form>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default CreateEventForm