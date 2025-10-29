import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Title from '../../components/owner/Title'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import {toast} from 'react-hot-toast'

// Default seating capacities for each category
const categorySeatingCapacity = {
  'MPV': 7,
  'SUV': 7,
  'Sedan': 5,
  'Van': 12,
  'Hatchback': 5,
  'Sports': 2,
  'Luxury': 5,
  'Electric': 5
}

const AddCar = () => {

  const {axios, currency} = useAppContext()

  const [image, setImage] = useState(null)
  const [car, setCar] = useState({
    brand: '',
    model: '',
    year: 0,
    price_per_day: 0,
    category: '',
    transmission: '',
    fuel_type: '',
    seating_capacity: 0,
    location: '',
    description: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  // Auto-fill seating capacity when category changes
  useEffect(() => {
    if (car.category && categorySeatingCapacity[car.category]) {
      setCar(prev => ({ ...prev, seating_capacity: categorySeatingCapacity[car.category] }))
    }
  }, [car.category])

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if(isLoading) return null
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('image', image)
      formData.append('carData', JSON.stringify(car))
      const {data} = await axios.post('/api/owner/add-car',formData)

      if(data.success){
        toast.success(data.message)
        setImage(null)
        setCar({
          brand: '',
          model: '',
          year: 0,
          price_per_day: 0,
          category: '',
          transmission: '',
          fuel_type: '',
          seating_capacity: 0,
          location: '',
          description: '',
        })
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }finally{
      setIsLoading(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.div 
      className="px-4 py-10 md:px-10 flex-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Title
        title="Add New Car"
        subTitle="Fill in details to list a new car for booking, including pricing, availability, and car specifications."
      />

      <motion.form
        onSubmit={onSubmitHandler}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mt-8 flex flex-col gap-8 text-gray-700 text-sm items-start"
      >
        {/* Image Upload */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col items-start gap-2"
        >
          <label className="text-sm font-medium text-gray-700">Car Photo</label>
          <motion.label
            htmlFor="car-image"
            className="relative w-32 h-32 flex flex-col justify-center items-center border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer overflow-hidden bg-gray-50"
            whileHover={{ scale: 1.02, borderColor: '#16a34a' }}
            whileTap={{ scale: 0.98 }}
          >
            <AnimatePresence mode="wait">
              {image ? (
                <motion.img
                  key="uploaded-image"
                  src={URL.createObjectURL(image)}
                  alt="Upload"
                  className="object-cover w-full h-full"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                />
              ) : (
                <motion.div
                  key="upload-placeholder"
                  className="flex flex-col items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.img
                    src={assets.upload_icon}
                    alt="Upload icon"
                    className="h-8 w-8 opacity-60"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <p className="text-gray-500 text-xs mt-2 text-center px-2">
                    Upload Photo
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            {image && (
              <motion.button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setImage(null)
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            )}
          </motion.label>
          <input
            type="file"
            id="car-image"
            accept="image/*"
            hidden
            onChange={(e) => setImage(e.target.files[0])}
          />
        </motion.div>

        {/* Brand & Model */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-4 w-full max-w-2xl">
          <motion.div 
            className="flex-1 min-w-[200px]"
            whileHover={{ scale: 1.01 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
            <motion.input
              type="text"
              placeholder="e.g. Toyota, Mitsubishi, Nissan"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none text-black focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all"
              value={car.brand}
              onChange={(e) => {
                const value = e.target.value
                // Only allow letters and spaces
                if (/^[A-Za-z\s]*$/.test(value)) {
                  setCar({ ...car, brand: value })
                }
              }}
              onFocus={() => setFocusedField('brand')}
              onBlur={() => setFocusedField(null)}
              animate={{ 
                borderColor: focusedField === 'brand' ? '#16a34a' : '#d1d5db'
              }}
            />
          </motion.div>

          <motion.div 
            className="flex-1 min-w-[200px]"
            whileHover={{ scale: 1.01 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
            <motion.input
              type="text"
              placeholder="e.g. Fortuner, Innova, Vios"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none text-black focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all"
              value={car.model}
              onChange={(e) => {
                const value = e.target.value
                setCar({ ...car, model: value })
              }}
              onFocus={() => setFocusedField('model')}
              onBlur={() => setFocusedField(null)}
              animate={{ 
                borderColor: focusedField === 'model' ? '#16a34a' : '#d1d5db'
              }}
            />
          </motion.div>
        </motion.div>

        {/* Row 1: Year, Daily Price, Category */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
          <motion.div whileHover={{ scale: 1.01 }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <input
              type="number"
              placeholder="2025"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none text-black focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all"
              value={car.year || ''}
              onChange={(e) => setCar({ ...car, year: e.target.value })}
            />
          </motion.div>

          <motion.div whileHover={{ scale: 1.01 }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Daily Price ({currency})</label>
            <input
              type="number"
              placeholder="e.g. 1000"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none text-black focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all"
              value={car.price_per_day || ''}
              onChange={(e) => setCar({ ...car, price_per_day: e.target.value })}
            />
          </motion.div>

          <motion.div whileHover={{ scale: 1.01 }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="relative">
              <select
                value={car.category}
                onChange={(e) => setCar({ ...car, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none text-black focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all cursor-pointer appearance-none"
                style={{ paddingRight: '2.5rem' }}
              >
                <option value="">Select</option>
                <option value="MPV">MPV</option>
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Van">Van</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Sports">Sports</option>
                <option value="Luxury">Luxury</option>
                <option value="Electric">Electric</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {car.category && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-green-600 mt-1.5 flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Auto-filled: {categorySeatingCapacity[car.category]} seats
              </motion.p>
            )}
          </motion.div>
        </motion.div>

        {/* Row 2: Transmission, Fuel Type, Seating Capacity */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
          <motion.div whileHover={{ scale: 1.01 }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
            <div className="relative">
              <select
                value={car.transmission}
                onChange={(e) => setCar({ ...car, transmission: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none text-black focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all cursor-pointer appearance-none"
                style={{ paddingRight: '2.5rem' }}
              >
                <option value="">Select</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
                <option value="Semi-Automatic">Semi-Automatic</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.01 }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
            <div className="relative">
              <select
                value={car.fuel_type}
                onChange={(e) => setCar({ ...car, fuel_type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none text-black focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all cursor-pointer appearance-none"
                style={{ paddingRight: '2.5rem' }}
              >
                <option value="">Select</option>
                <option value="Gas">Gas</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.01 }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Seating Capacity (Max: 16)</label>
            <input
              type="number"
              placeholder="e.g. 5"
              required
              min="1"
              max="16"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none text-black focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all"
              value={car.seating_capacity || ''}
              onChange={(e) => {
                const value = e.target.value
                if (value === '') {
                  setCar({ ...car, seating_capacity: value })
                } else {
                  const numValue = Number(value)
                  if (numValue >= 1 && numValue <= 16) {
                    setCar({ ...car, seating_capacity: value })
                  } else if (numValue > 16) {
                    toast.error('Maximum seating capacity is 16', {
                      style: {
                        borderRadius: '12px',
                      },
                    })
                  }
                }
              }}
            />
          </motion.div>
        </motion.div>

        {/* Location */}
        <motion.div variants={itemVariants} className="w-full max-w-2xl">
          <motion.div whileHover={{ scale: 1.01 }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              placeholder="e.g. Cabanatuan City, N.E."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none text-black focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all"
              value={car.location}
              onChange={(e) => setCar({ ...car, location: e.target.value })}
            />
          </motion.div>
        </motion.div>

        {/* Description */}
        <motion.div variants={itemVariants} className="w-full max-w-2xl">
          <motion.div whileHover={{ scale: 1.01 }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              rows="4"
              placeholder="Describe your car, its condition, and any notable details..."
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none text-black focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all resize-none"
              value={car.description}
              onChange={(e) => setCar({ ...car, description: e.target.value })}
            />
          </motion.div>
        </motion.div>

        {/* Submit */}
        <motion.div 
          variants={itemVariants}
          className="w-full max-w-2xl mt-4"
        >
          <motion.button
            type="submit"
            disabled={isLoading}
            className="relative bg-green-700 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-green-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
            whileHover={{ scale: isLoading ? 1 : 1.02, boxShadow: "0 10px 30px rgba(22, 163, 74, 0.3)" }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2"
                >
                  <motion.div
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  />
                  <span className="ml-2">Listing...</span>
                </motion.div>
              ) : (
                <motion.span
                  key="submit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  List Your Car
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </motion.form>
    </motion.div>
  )
}

export default AddCar;
