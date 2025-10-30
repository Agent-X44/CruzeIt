import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import mongoose from "mongoose";


// function to check availability of car for given dates
const checkAvailability = async(car, pickupDate, returnDate) => {
    console.log('=== CHECK AVAILABILITY ===');
    console.log('Car ID:', car);
    console.log('Search Pickup:', pickupDate);
    console.log('Search Return:', returnDate);

    // Find all non-cancelled bookings for this car
    const bookings = await Booking.find({
        car,
        status: { $nin: ['Cancelled'] }
    })
    
    console.log('Total bookings found:', bookings.length);

    if (bookings.length === 0) {
        console.log('No bookings - car is AVAILABLE');
        return true;
    }

    // Convert search dates to Date objects for comparison
    const searchPickup = new Date(pickupDate);
    const searchReturn = new Date(returnDate);

    // Check each booking for overlap
    const hasConflict = bookings.some((booking) => {
        const bookingPickup = new Date(booking.pickupDate);
        const bookingReturn = new Date(booking.returnDate);

        console.log('\nChecking booking:', booking._id);
        console.log('Booking pickup:', bookingPickup);
        console.log('Booking return:', bookingReturn);
        console.log('Booking status:', booking.status);

        // Check for date overlap
        // Overlap occurs if:
        // 1. Search starts before booking ends AND
        // 2. Search ends after booking starts
        const overlaps = searchPickup < bookingReturn && searchReturn > bookingPickup;

        console.log('Overlaps?', overlaps);

        return overlaps;
    });

    console.log('\nFinal result:', hasConflict ? 'NOT AVAILABLE (conflict found)' : 'AVAILABLE');
    console.log('==========================\n');

    return !hasConflict;
}


//api to check availability of car for given dates and location
export const checkAvailabilityofCar = async (req, res) => {
    try {
        const {location, pickupDate, returnDate} = req.body;
        
        console.log('\n=== SEARCH REQUEST ===');
        console.log('Location:', location || 'ALL LOCATIONS');
        console.log('Pickup Date:', pickupDate);
        console.log('Return Date:', returnDate);
        
        // Validate dates
        const pickup = new Date(pickupDate);
        const returnD = new Date(returnDate);
        
        if (returnD <= pickup) {
            return res.json({success: false, message: 'Invalid input date. Return date must be after pickup date'})
        }
        
        // Build query - if location is provided, filter by it; otherwise get all cars
        const query = { isAvailable: true };
        if (location && location.trim()) {
            query.location = location;
        }
        
        // Fetch cars based on query
        const cars = await Car.find(query)
        console.log('Total cars found:', cars.length);

        // Check each car for conflicting bookings
        const availableCarsPromises = cars.map(async (car) => {
            console.log(`\n--- Checking car: ${car.brand} ${car.model} (${car._id}) in ${car.location} ---`);
            const hasNoConflictingBookings = await checkAvailability(car._id, pickupDate, returnDate)
            
            if (hasNoConflictingBookings) {
                console.log(`✓ Car ${car._id} is AVAILABLE`);
                return car._doc
            } else {
                console.log(`✗ Car ${car._id} is NOT AVAILABLE`);
            }
            return null
        })

        let availableCars = await Promise.all(availableCarsPromises);
        
        // Filter out null values (cars with conflicting bookings)
        availableCars = availableCars.filter(car => car !== null)

        console.log('\n=== FINAL RESULTS ===');
        console.log('Available cars:', availableCars.length);
        console.log('=====================\n');

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
            paymentMethod: paymentMethod.toLowerCase()
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
        .populate('user', 'name email username')
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

        // Prevent cancellation of confirmed bookings by users
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

        // Prevent deletion of confirmed bookings by users
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

// api to cancel confirmed booking by owner
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
