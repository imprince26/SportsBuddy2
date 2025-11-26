// Confirm Payment for Paid Event
export const confirmPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentMethod = 'cash' } = req.body;

        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        // Find the participant
        const participantIndex = event.participants.findIndex(
            p => p.user.toString() === req.user._id.toString()
        );

        if (participantIndex === -1) {
            return res.status(400).json({
                success: false,
                message: "You are not a participant of this event"
            });
        }

        // Update payment status
        event.participants[participantIndex].paymentStatus = "paid";
        event.participants[participantIndex].paymentMethod = paymentMethod;
        event.participants[participantIndex].paidAt = new Date();

        await event.save();

        // Send notification to event organizer
        await User.findByIdAndUpdate(event.createdBy, {
            $push: {
                notifications: {
                    type: "event",
                    message: `${req.user.name} has confirmed payment for: ${event.name}`,
                    priority: "normal"
                }
            }
        });

        const updatedEvent = await Event.findById(id)
            .populate("createdBy", "name avatar")
            .populate("participants.user", "name avatar");

        res.json({
            success: true,
            message: "Payment confirmed successfully",
            data: updatedEvent
        });
    } catch (error) {
        console.error("Confirm payment error:", error);
        res.status(500).json({
            success: false,
            message: "Error confirming payment",
            error: error.message
        });
    }
};
