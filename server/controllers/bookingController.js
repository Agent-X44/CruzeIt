import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import mongoose from "mongoose";


// function to check availability of car for given dates
const checkAvailability = async(car, pickupDate, returnDate) => {
    const bookings = await Booking.find({
        car,
        pickupDate: { $lte: returnDate },
        returnDate: { $gte: pickupDate },
        status: { $nin: ['Cancelled'] } // Exclude cancelled bookings from availability check
    })
    return bookings.length === 0
}


//api to check availability of car for given dates and location
export const checkAvailabilityofCar = async (req, res) => {
    try {
        const {location, pickupDate, returnDate} = req.body;
        
        // Validate dates
        const pickup = new Date(pickupDate);
        const returnD = new Date(returnDate);
        
        if (returnD <= pickup) {
            return res.json({success: false, message: 'Invalid input date. Return date must be after pickup date'})
        }
        
        // fetch all available cars in the location
        const cars = await Car.find({location, isAvailable: true})

        // check car availability for given dates using promise
        const availableCarsPromises = cars.map(async (car) => {
            const isAvailable = await checkAvailability(car._id, pickupDate, 
            returnDate)
            return {...car._doc, isAvailable: isAvailable}

        })

        let availableCars = await Promise.all(availableCarsPromises);
        availableCars = availableCars.filter((car) => car.isAvailable === true)

        res.json({success: true, availableCars})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

//api to create a booking
export const createBooking = async (req, res) => {
    try {
        const {_id} = req.user;
        const {carId, pickupDate, returnDate, contactNumber, paymentMethod} = req.body;

        // Validate required fields
        if (!carId || !pickupDate || !returnDate || !contactNumber || !paymentMethod) {
            return res.json({
                success: false, 
                message: 'All fields are required including payment method'
            });
        }

        // Validate payment method
        const validPaymentMethods = ['cash', 'card', 'gcash', 'maya'];
        if (!validPaymentMethods.includes(paymentMethod.toLowerCase())) {
            return res.json({
                success: false, 
                message: 'Invalid payment method. Please select cash, card, gcash, or maya'
            });
        }

        // Validate dates
        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);
        
        if (returned <= picked) {
            return res.json({success: false, message: 'Invalid input date. Return date must be after pickup date'})
        }

        // Get car data first
        const carData = await Car.findById(carId)
        
        if(!carData){
            return res.json({success: false, message: 'Car not found'})
        }

        // CHECK: Prevent car owner from booking their own car
        if(carData.owner.toString() === _id.toString()){
            return res.json({
                success: false, 
                message: 'You cannot book your own car. Car owners are not allowed to book their own vehicles.'
            })
        }

        // CHECK: Ensure the car is marked as available by owner
        if(!carData.isAvailable){
            return res.json({success: false, message: 'This car is currently unavailable for booking'})
        }

        // Check if car is available for the selected dates
        const isAvailable = await checkAvailability(carId, pickupDate, returnDate)
        if(!isAvailable){
            return res.json({success: false, message: 'Car is not available for the selected dates'})
        }

        // Get owner's phone number
        const ownerData = await mongoose.model('User').findById(carData.owner).select('phone')
        const ownerPhone = ownerData?.phone || 'Not provided'

        //calculate price based on the pickup and return date
        const noOfDays = Math.ceil((returned - picked)/(1000*60*60*24))
        const price = carData.price_per_day * noOfDays;

        // Create booking with payment method
        await Booking.create({
            car: carId,
            owner: carData.owner,
            user: _id,
            pickupDate,
            returnDate,
            price,
            customerContact: contactNumber,
            ownerContact: ownerPhone,
            paymentMethod: paymentMethod.toLowerCase() // Store in lowercase
        })
        
        res.json({success: true, message: 'Booking created successfully'})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

//api to list user bookings
export const getUserBookings = async (req, res) => {
    try {
        const {_id} = req.user;
        const bookings = await Booking.find({user: _id}).populate('car').sort
        ({createdAt: -1})
        res.json({success: true, bookings})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

//api to get owner bookings
export const getOwnerBookings = async (req, res) => {
    try {
        if(req.user.role !== 'owner'){
            return res.json({success: false, message: 'You are not authorized to access this resource'})
        }
        const bookings = await Booking.find({owner: req.user._id})
        .populate('car')
        .populate('user', 'name email username') // Populate user details for display
        .sort({createdAt: -1})
        res.json({success: true, bookings})
    
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

//api to change booking status
export const changeBookingStatus = async (req, res) => {
    try {
        const {_id} = req.user;
        const {bookingId, status} = req.body;

        const booking = await Booking.findById(bookingId)

        if(booking.owner.toString() !== _id.toString()){
            return res.json({success: false, message: 'You are not authorized to perform this action'})
        }

        booking.status = status;
        await booking.save()

        res.json({success: true, message: 'Booking status updated successfully'})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// api to cancel booking by user
export const cancelBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const { bookingId } = req.body;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.json({ success: false, message: 'Booking not found' });
        }

        // Check if the booking belongs to the user
        if (booking.user.toString() !== _id.toString()) {
            return res.json({ success: false, message: 'You are not authorized to cancel this booking' });
        }

        // NEW: Prevent cancellation of confirmed bookings by users
        if (booking.status === 'Confirmed') {
            return res.json({ 
                success: false, 
                message: 'Cannot cancel confirmed booking. Please contact the car owner to request cancellation.' 
            });
        }

        // Check if booking can be cancelled (not already completed or cancelled)
        if (booking.status === 'Completed' || booking.status === 'Cancelled') {
            return res.json({ success: false, message: `Booking already ${booking.status}` });
        }

        // Check if pickup date is in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const pickupDate = new Date(booking.pickupDate);
        
        if (pickupDate < today) {
            return res.json({ success: false, message: 'Cannot cancel past bookings' });
        }

        // Update booking status to cancelled
        booking.status = 'Cancelled';
        await booking.save();

        res.json({ success: true, message: 'Booking cancelled successfully' });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// api to delete booking by user
export const deleteBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const { bookingId } = req.body;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.json({ success: false, message: 'Booking not found' });
        }

        // Check if the booking belongs to the user
        if (booking.user.toString() !== _id.toString()) {
            return res.json({ success: false, message: 'You are not authorized to delete this booking' });
        }

        // NEW: Prevent deletion of confirmed bookings by users
        if (booking.status === 'Confirmed') {
            return res.json({ 
                success: false, 
                message: 'Cannot delete confirmed booking. Please contact the car owner to request cancellation.' 
            });
        }

        // Auto-cancel if not already cancelled or completed
        if (booking.status !== 'Cancelled' && booking.status !== 'Completed') {
            booking.status = 'Cancelled';
            await booking.save();
        }

        // Delete the booking
        await Booking.findByIdAndDelete(bookingId);

        res.json({ success: true, message: 'Booking deleted successfully' });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// NEW: api to cancel confirmed booking by owner
export const cancelConfirmedBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const { bookingId } = req.body;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.json({ success: false, message: 'Booking not found' });
        }

        // Check if the user is the car owner
        if (booking.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: 'Only the car owner can cancel confirmed bookings' });
        }

        // Check if booking is confirmed
        if (booking.status !== 'Confirmed') {
            return res.json({ success: false, message: 'Only confirmed bookings can be cancelled by owner' });
        }

        // Cancel the booking
        booking.status = 'Cancelled';
        await booking.save();

        res.json({ success: true, message: 'Confirmed booking cancelled successfully' });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
