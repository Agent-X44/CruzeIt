import imagekit from "../configs/imageKit.js";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/User.js";
import Location from "../models/Location.js";
import fs from "fs";


export const changeRoleToOwner = async (req, res) => {
    try {
        const {_id} = req.user;
        await User.findByIdAndUpdate(_id, {role: 'owner'})
        res.json({success: true, message: 'Role updated to owner, Now you can add cars'})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

//api for car

export const addCar = async (req, res) => {
    try {
        const {_id} = req.user;
        let car = JSON.parse(req.body.carData)
        const imageFile = req.file;

        //upload image to imagekit
        const fileBuffer = fs.readFileSync(imageFile.path)
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: "/cars"
        })
        // optimize imagekit url

        var optimizedImageUrl = imagekit.url({
            path : response.filePath,
            transformation : [
                {"width": "1280"},
                {quality: "auto"},
                {format: "webp"}
            ]
        });

        const image = optimizedImageUrl;
        await Car.create({...car, owner: _id, image})

        // NEW: Auto-save location to locations collection
        if (car.location && car.location.trim() !== '') {
            const locationExists = await Location.findOne({ 
                name: { $regex: new RegExp(`^${car.location.trim()}$`, 'i') } 
            });
            
            if (!locationExists) {
                await Location.create({ name: car.location.trim() });
            }
        }

        res.json({success: true, message: 'Car added successfully'})
        
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

//api to list cars of owner
export const getOwnerCars = async (req, res) => {
    try {
        const {_id} = req.user;
        const cars = await Car.find({owner: _id})
        res.json({success: true, cars})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
        
    }
}

//api to toggle car availability
export const toggleCarAvailability = async (req, res) => {
     try {
        const {_id} = req.user;
        const {carId} = req.body;
        const car = await Car.findById(carId)


        //check if the car belongs to the owner
        if(car.owner.toString() !== _id.toString()){
            return res.json({success: false, message: 'You are not authorized to perform this action'})
        }

        car.isAvailable = !car.isAvailable;
        await car.save()

        res.json({success: true, message: 'Car availability updated successfully'})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
        
    }
}
//api to delete car
export const deleteCar = async (req, res) => {
     try {
        const {_id} = req.user;
        const {carId} = req.body;
        const car = await Car.findById(carId)


        //check if the car belongs to the owner
        if(car.owner.toString() !== _id.toString()){
            return res.json({success: false, message: 'You are not authorized to perform this action'})
        }

        car.owner = null;
        car.isAvailable = false;
        await car.save()

        res.json({success: true, message: 'Car deleted successfully'})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
        
    }
}

export const getDashboardData = async (req, res) => {
    try {
        const {_id, role} = req.user;
        if(role !== 'owner'){
            return res.json({success: false, message: 'You are not authorized to access this data'})
        }

        const cars = await Car.find({owner: _id})
        const bookings = await Booking.find({owner: _id})
        .populate('car')
        .populate('user', 'name email username')
        .sort({createdAt: -1})

        const pendingBookings = await Booking.find({owner: _id, status :'pending'})
        const completedBookings = await Booking.find({owner: _id, status :'confirmed'})

        //calcute total earnings

        const monthlyRevenue = bookings.slice()
        .filter(booking => booking.status === 'confirmed')
        .reduce((acc, booking) => acc + booking.price, 0)

        const dashboardData = {
            totalCars: cars.length,
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.length,
            completeBookings: completedBookings.length,
            recentBookings: bookings.slice(0,5),
            monthlyRevenue
        }

        res.json({success: true, dashboardData})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

//api to update user image
export const updateUserImage = async (req, res) => {
    try {
        const {_id} = req.user;

        const imageFile = req.file;

        const fileBuffer = fs.readFileSync(imageFile.path)
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: "/users"
        })
        // optimize imagekit url

        var optimizedImageUrl = imagekit.url({
            path : response.filePath,
            transformation : [
                {"width": "400"},
                {quality: "auto"},
                {format: "webp"}
            ]
        });

        const image = optimizedImageUrl;

        await User.findByIdAndUpdate(_id, {image})
        res.json({success: true, message: 'Profile image updated successfully', image})
        
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

//api to update car details
export const updateCar = async (req, res) => {
    try {
        const { _id } = req.user;
        const { 
            carId, 
            brand, 
            model, 
            year, 
            category, 
            seating_capacity, 
            transmission, 
            fuel_type, 
            price_per_day, 
            location, 
            description 
        } = req.body;

        // Find the car
        const car = await Car.findById(carId);

        if (!car) {
            return res.json({ success: false, message: 'Car not found' });
        }

        // Check if the car belongs to the owner
        if (car.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: 'You are not authorized to update this car' });
        }

        // Update car details
        car.brand = brand || car.brand;
        car.model = model || car.model;
        car.year = year || car.year;
        car.category = category || car.category;
        car.seating_capacity = seating_capacity || car.seating_capacity;
        car.transmission = transmission || car.transmission;
        car.fuel_type = fuel_type || car.fuel_type;
        car.price_per_day = price_per_day || car.price_per_day;
        car.location = location || car.location;
        car.description = description || car.description;

        await car.save();

        // NEW: Auto-save location if it changed
        if (location && location.trim() !== '' && location !== car.location) {
            const locationExists = await Location.findOne({ 
                name: { $regex: new RegExp(`^${location.trim()}$`, 'i') } 
            });
            
            if (!locationExists) {
                await Location.create({ name: location.trim() });
            }
        }

        res.json({ success: true, message: 'Car updated successfully' });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

//API to get all locations
export const getAllLocations = async (req, res) => {
    try {
        const locations = await Location.find().sort({ name: 1 });
        const locationNames = locations.map(loc => loc.name);
        res.json({ success: true, locations: locationNames });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
