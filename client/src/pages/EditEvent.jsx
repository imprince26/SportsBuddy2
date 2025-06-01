"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useEvents } from "@/hooks/useEvents";
import { format } from "date-fns"
import { Calendar, Clock, MapPin, Users, ImageIcon, X, Plus, ChevronLeft, Trash2, AlertTriangle, Loader2 } from 'lucide-react'

const EditEvent = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getEventById, updateEvent, deleteEvent, loading } = useEvents()
  const [event, setEvent] = useState(null)
  const [eventData, setEventData] = useState({
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
  })
  const [existingImages, setExistingImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const [imagePreview, setImagePreview] = useState([])
  const [newRule, setNewRule] = useState("")
  const [newEquipment, setNewEquipment] = useState({
    item: "",
    required: false,
  })
  const [errors, setErrors] = useState({})
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventData = await getEventById(id)
        setEvent(eventData)
        setEventData({
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
      } catch (error) {
        console.error("Error fetching event details:", error)
      } finally {
        setPageLoading(false)
      }
    }

    fetchEventDetails()
  }, [id])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setEventData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else if (type === "checkbox") {
      setEventData((prev) => ({
        ...prev,
        [name]: checked,
      }))
    } else if (name === "registrationFee") {
      setEventData((prev) => ({
        ...prev,
        [name]: Number.parseFloat(value) || 0,
      }))
    } else if (name === "maxParticipants") {
      setEventData((prev) => ({
        ...prev,
        [name]: Number.parseInt(value) || 10,
      }))
    } else {
      setEventData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setNewImages((prev) => [...prev, ...files])

    // Create preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setImagePreview((prev) => [...prev, ...newPreviews])
  }

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreview[index])
    setImagePreview((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const addRule = () => {
    if (!newRule.trim()) return

    setEventData((prev) => ({
      ...prev,
      rules: [...prev.rules, newRule],
    }))
    setNewRule("")
  }

  const removeRule = (index) => {
    setEventData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }))
  }

  const addEquipment = () => {
    if (!newEquipment.item.trim()) return

    setEventData((prev) => ({
      ...prev,
      equipment: [...prev.equipment, newEquipment],
    }))
    setNewEquipment({
      item: "",
      required: false,
    })
  }

  const removeEquipment = (index) => {
    setEventData((prev) => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index),
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!eventData.name) newErrors.name = "Event name is required"
    if (!eventData.category) newErrors.category = "Category is required"
    if (!eventData.description) newErrors.description = "Description is required"
    if (!eventData.date) newErrors.date = "Date is required"
    if (!eventData.time) newErrors.time = "Time is required"
    if (!eventData.location.address) newErrors.address = "Address is required"
    if (!eventData.location.city) newErrors.city = "City is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const updatedEvent = await updateEvent(
        id,
        {
          ...eventData,
          images: existingImages,
        },
        newImages
      )
      navigate(`/events/${id}`)
    } catch (error) {
      console.error("Error updating event:", error)
    }
  }

  const handleDeleteEvent = async () => {
    try {
      await deleteEvent(id)
      navigate("/events")
    } catch (error) {
      console.error("Error deleting event:", error)
    }
  }

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-light dark:text-primary-dark" />
          <p className="mt-4 text-foreground-light dark:text-foreground-dark">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6 text-center">
          <AlertTriangle className="w-16 h-16 text-destructive-light dark:text-destructive-dark mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark mb-2">Event Not Found</h2>
          <p className="text-muted-foreground-light dark:text-muted-foreground-dark mb-6">
            The event you're looking for doesn't exist or you don't have permission to edit it.
          </p>
          <Link
            to="/events"
            className="px-6 py-3 bg-primary-light dark:bg-primary-dark text-white font-semibold rounded-md hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
          >
            Back to Events
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to={`/events/${id}`}
          className="inline-flex items-center text-primary-light dark:text-primary-dark hover:underline"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Event
        </Link>
      </div>

      <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">Edit Event</h1>
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-destructive-light dark:bg-destructive-dark text-white hover:bg-destructive-light/90 dark:hover:bg-destructive-dark/90 transition-colors"
          >
            <Trash2 size={18} />
            <span>Delete Event</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                  Event Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={eventData.name}
                  onChange={handleInputChange}
                  className={`w-full p-2 rounded-md border ${errors.name
                    ? "border-destructive-light dark:border-destructive-dark"
                    : "border-input-light dark:border-input-dark"
                    } bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark`}
                  placeholder="Enter event name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-destructive-light dark:text-destructive-dark">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                  Category*
                </label>
                <select
                  name="category"
                  value={eventData.category}
                  onChange={handleInputChange}
                  className={`w-full p-2 rounded-md border ${errors.category
                    ? "border-destructive-light dark:border-destructive-dark"
                    : "border-input-light dark:border-input-dark"
                    } bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark`}
                >
                  <option value="">Select a category</option>
                  <option value="Football">Football</option>
                  <option value="Basketball">Basketball</option>
                  <option value="Tennis">Tennis</option>
                  <option value="Running">Running</option>
                  <option value="Cycling">Cycling</option>
                  <option value="Swimming">Swimming</option>
                  <option value="Volleyball">Volleyball</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-destructive-light dark:text-destructive-dark">{errors.category}</p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                Description*
              </label>
              <textarea
                name="description"
                value={eventData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full p-2 rounded-md border ${errors.description
                  ? "border-destructive-light dark:border-destructive-dark"
                  : "border-input-light dark:border-input-dark"
                  } bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark`}
                placeholder="Describe your event"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-destructive-light dark:text-destructive-dark">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div>
            <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">
              Date and Time
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                  Date*
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground-light dark:text-muted-foreground-dark"
                    size={16}
                  />
                  <input
                    type="date"
                    name="date"
                    value={eventData.date}
                    onChange={handleInputChange}
                    className={`w-full pl-10 p-2 rounded-md border ${errors.date
                      ? "border-destructive-light dark:border-destructive-dark"
                      : "border-input-light dark:border-input-dark"
                      } bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark`}
                  />
                </div>
                {errors.date && (
                  <p className="mt-1 text-sm text-destructive-light dark:text-destructive-dark">{errors.date}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                  Time*
                </label>
                <div className="relative">
                  <Clock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground-light dark:text-muted-foreground-dark"
                    size={16}
                  />
                  <input
                    type="time"
                    name="time"
                    value={eventData.time}
                    onChange={handleInputChange}
                    className={`w-full pl-10 p-2 rounded-md border ${errors.time
                      ? "border-destructive-light dark:border-destructive-dark"
                      : "border-input-light dark:border-input-dark"
                      } bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark`}
                  />
                </div>
                {errors.time && (
                  <p className="mt-1 text-sm text-destructive-light dark:text-destructive-dark">{errors.time}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">Location</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                  Address*
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground-light dark:text-muted-foreground-dark"
                    size={16}
                  />
                  <input
                    type="text"
                    name="location.address"
                    value={eventData.location.address}
                    onChange={handleInputChange}
                    className={`w-full pl-10 p-2 rounded-md border ${errors.address
                      ? "border-destructive-light dark:border-destructive-dark"
                      : "border-input-light dark:border-input-dark"
                      } bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark`}
                    placeholder="Enter address"
                  />
                </div>
                {errors.address && (
                  <p className="mt-1 text-sm text-destructive-light dark:text-destructive-dark">{errors.address}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                    City*
                  </label>
                  <input
                    type="text"
                    name="location.city"
                    value={eventData.location.city}
                    onChange={handleInputChange}
                    className={`w-full p-2 rounded-md border ${errors.city
                      ? "border-destructive-light dark:border-destructive-dark"
                      : "border-input-light dark:border-input-dark"
                      } bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark`}
                    placeholder="Enter city"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-destructive-light dark:text-destructive-dark">{errors.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="location.state"
                    value={eventData.location.state}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                    placeholder="Enter state (optional)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div>
            <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">
              Event Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                  Maximum Participants
                </label>
                <div className="relative">
                  <Users
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground-light dark:text-muted-foreground-dark"
                    size={16}
                  />
                  <input
                    type="number"
                    name="maxParticipants"
                    value={eventData.maxParticipants}
                    onChange={handleInputChange}
                    min={1}
                    max={1000}
                    className="w-full pl-10 p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                  Difficulty Level
                </label>
                <select
                  name="difficulty"
                  value={eventData.difficulty}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                  Event Type
                </label>
                <select
                  name="eventType"
                  value={eventData.eventType}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                >
                  <option value="casual">Casual</option>
                  <option value="tournament">Tournament</option>
                  <option value="training">Training</option>
                  <option value="competition">Competition</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                  Registration Fee ($)
                </label>
                <input
                  type="number"
                  name="registrationFee"
                  value={eventData.registrationFee}
                  onChange={handleInputChange}
                  min={0}
                  step={0.01}
                  className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">Event Images</h2>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <h3 className="text-md font-medium text-foreground-light dark:text-foreground-dark mb-2">
                  Current Images
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={`Event ${index}`}
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-destructive-light/90 dark:bg-destructive-dark/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Images */}
            <div className="border-2 border-dashed border-input-light dark:border-input-dark rounded-lg p-6 text-center">
              <div className="mb-4">
                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground-light dark:text-muted-foreground-dark" />
                <p className="mt-2 text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                  Drag and drop new images here, or click to select files
                </p>
                <p className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center px-4 py-2 rounded-md bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors cursor-pointer"
              >
                <Plus size={16} className="mr-2" />
                <span>Add Images</span>
              </label>
            </div>

            {/* New Image Previews */}
            {imagePreview.length > 0 && (
              <div className="mt-4">
                <h3 className="text-md font-medium text-foreground-light dark:text-foreground-dark mb-2">
                  New Images to Add
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imagePreview.map((src, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={src || "/placeholder.svg"}
                        alt={`Preview ${index}`}
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-destructive-light/90 dark:bg-destructive-dark/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rules */}
          <div>
            <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">
              Rules (Optional)
            </h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                className="flex-1 p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                placeholder="Add a rule"
              />
              <button
                type="button"
                onClick={addRule}
                disabled={!newRule.trim()}
                className={`px-4 py-2 rounded-md ${!newRule.trim()
                  ? "bg-muted-light dark:bg-muted-dark text-muted-foreground-light dark:text-muted-foreground-dark cursor-not-allowed"
                  : "bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-light/90 dark:hover:bg-primary-dark/90"
                  }`}
              >
                Add
              </button>
            </div>

            {eventData.rules.length > 0 ? (
              <ul className="space-y-2">
                {eventData.rules.map((rule, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-2 rounded-md bg-background-light dark:bg-background-dark"
                  >
                    <span className="text-foreground-light dark:text-foreground-dark">{rule}</span>
                    <button
                      type="button"
                      onClick={() => removeRule(index)}
                      className="p-1 text-muted-foreground-light dark:text-muted-foreground-dark hover:text-destructive-light dark:hover:text-destructive-dark transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">No rules added yet</p>
            )}
          </div>

          {/* Equipment */}
          <div>
            <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">
              Equipment (Optional)
            </h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newEquipment.item}
                onChange={(e) => setNewEquipment((prev) => ({ ...prev, item: e.target.value }))}
                className="flex-1 p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                placeholder="Add equipment"
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="equipment-required"
                  checked={newEquipment.required}
                  onChange={(e) => setNewEquipment((prev) => ({ ...prev, required: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="equipment-required" className="text-sm text-foreground-light dark:text-foreground-dark">
                  Required
                </label>
              </div>
              <button
                type="button"
                onClick={addEquipment}
                disabled={!newEquipment.item.trim()}
                className={`px-4 py-2 rounded-md ${!newEquipment.item.trim()
                  ? "bg-muted-light dark:bg-muted-dark text-muted-foreground-light dark:text-muted-foreground-dark cursor-not-allowed"
                  : "bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-light/90 dark:hover:bg-primary-dark/90"
                  }`}
              >
                Add
              </button>
            </div>

            {eventData.equipment.length > 0 ? (
              <ul className="space-y-2">
                {eventData.equipment.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-2 rounded-md bg-background-light dark:bg-background-dark"
                  >
                    <div className="flex items-center">
                      <span className="text-foreground-light dark:text-foreground-dark">{item.item}</span>
                      {item.required && (
                        <span className="ml-2 text-xs bg-destructive-light/20 dark:bg-destructive-dark/20 text-destructive-light dark:text-destructive-dark px-2 py-0.5 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEquipment(index)}
                      className="p-1 text-muted-foreground-light dark:text-muted-foreground-dark hover:text-destructive-light dark:hover:text-destructive-dark transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                No equipment added yet
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-md bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-white mr-2"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                "Update Event"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-destructive-light dark:text-destructive-dark mr-3" size={24} />
              <h3 className="text-xl font-bold text-foreground-light dark:text-foreground-dark">Delete Event</h3>
            </div>
            <p className="text-foreground-light dark:text-foreground-dark mb-6">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 rounded-md border border-input-light dark:border-input-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEvent}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-destructive-light dark:bg-destructive-dark text-white hover:bg-destructive-light/90 dark:hover:bg-destructive-dark/90 transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-white"></div>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditEvent
