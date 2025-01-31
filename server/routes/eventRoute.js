import { Router } from "express";
const router = Router();
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { getAllEvents, getEventById, updateEvent, createEvent, deleteEvent,getUserEvents, participateInEvent, leaveEvent } from "../controllers/eventController.js";

router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.post("/", isAuthenticated, createEvent);
router.put("/:id", isAuthenticated, updateEvent);
router.delete("/:id", isAuthenticated, deleteEvent);
router.get("/user/my-events", isAuthenticated, getUserEvents);
router.post("/:id/participate", isAuthenticated, participateInEvent);
router.delete("/:id/leave", isAuthenticated, leaveEvent);

export default router;