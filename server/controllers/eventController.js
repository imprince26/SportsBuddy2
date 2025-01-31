import Event from "../models/eventModel.js";

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message,
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching event",
      error: error.message,
    });
  }
};

export const createEvent = async (req, res) => {
  try {
    const newEvent = await Event.create({
      ...req.body,
      createdBy: req.user._id  // Add the current user as the event creator
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: newEvent,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating event",
      error: error.message,
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if the current user is the event creator or an admin
    if (
      event.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this event",
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating event",
      error: error.message,
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);

    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting event",
      error: error.message,
    });
  }
};

export const getUserEvents = async (req, res) => {
  try {
    const events = await Event.find({ 
      createdBy: req.user._id 
    }).sort({ createdAt: -1 }); // Sort by most recent first

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user events",
      error: error.message
    });
  }
};

export const participateInEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: "Event has reached maximum participants",
      });
    }
    
    const isParticipating = event.participants.some(
      (participant) => participant.toString() === req.user._id.toString()
    );

    if (isParticipating) {
      return res.status(400).json({
        success: false,
        message: "You are already participating in this event",
      });
    }
    event.participants.push(req.user._id);

    await event.save();

    res.status(200).json({
      success: true,
      message: "Successfully joined the event",
      data: event,
    });
  } catch (error) {
    console.error("Error participating in event", error);
    res.status(500).json({
      success: false,
      message: "Error participating in event",
      error: error.message,
    });
  }
};

export const leaveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    event.participants = event.participants.filter(
      (participant) => participant.toString() !== req.user._id.toString()
    );

    await event.save();

    res.status(200).json({
      success: true,
      message: "Successfully left the event",
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error leaving event",
      error: error.message,
    });
  }
};