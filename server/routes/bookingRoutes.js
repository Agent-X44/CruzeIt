import express from "express";
import { 
    changeBookingStatus, 
    checkAvailabilityofCar, 
    createBooking, 
    getOwnerBookings, 
    getUserBookings,
    cancelBooking,
    deleteBooking,
    cancelConfirmedBooking
} from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";

const bookingRouter = express.Router();

// Public routes
bookingRouter.post('/check-availability', checkAvailabilityofCar);

// Protected routes - User
bookingRouter.post('/create', protect, createBooking);
bookingRouter.get('/user', protect, getUserBookings);
bookingRouter.post('/cancel', protect, cancelBooking);
bookingRouter.post('/delete', protect, deleteBooking);

// Protected routes - Owner
bookingRouter.get('/owner', protect, getOwnerBookings);
bookingRouter.post('/change-status', protect, changeBookingStatus);
bookingRouter.post('/cancel-confirmed', protect, cancelConfirmedBooking);

export default bookingRouter;
