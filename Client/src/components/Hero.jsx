import React, { useState, useRef, useEffect } from 'react'
import { assets, cityList } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import { motion, useScroll, useTransform } from 'motion/react'

const Hero = () => {
  const [pickupLocation, setPickupLocation] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [initialAnimDone, setInitialAnimDone] = useState(false)
  const [dynamicCities, setDynamicCities] = useState([])
  const [showError, setShowError] = useState(false) // NEW: Error state
  const dropdownRef = useRef(null)
  const { pickupDate, setPickupDate, returnDate, setReturnDate, navigate, axios } = useAppContext()
  
  // NEW: Fetch locations from database and merge with assets
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data } = await axios.get('/api/owner/locations')
        if (data.success && data.locations) {
          setDynamicCities(data.locations)
        }
      } catch (error) {
        console.log('Error fetching locations:', error)
      }
    }
    fetchLocations()
  }, [axios])

  // NEW: Merge cityList from assets with dynamic cities from database
  const allCities = [...new Set([...(cityList || []), ...dynamicCities])].sort()
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Filter cities based on search - now uses merged list
  const filteredCities = (allCities || []).filter(city =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Scroll animation for the car - slower movement
  const { scrollY } = useScroll()
  const carX = useTransform(scrollY, [0, 800], ['0%', '-150%'])
  
  // Wheel rotation: starts from 0 and rotates as you scroll
  const wheelRotation = useTransform(scrollY, [0, 800], [0, -1440])

  // Force re-render on scroll to fix mouse wheel issue
  useEffect(() => {
    const handleScroll = () => {
      // This forces the component to respond to scroll events
      scrollY.set(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrollY])

  // Lock scroll during initial animation
  useEffect(() => {
    if (!initialAnimDone) {
      // Prevent scrolling
      document.body.style.overflow = 'hidden'
    } else {
      // Re-enable scrolling
      document.body.style.overflow = 'auto'
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [initialAnimDone])

  const handleSearch = (e) => {
    e.preventDefault()
    
    // Check if all fields are empty
    if (!pickupLocation && !pickupDate && !returnDate) {
      setShowError(true)
      return
    }
    
    // Reset error state if at least one field is filled
    setShowError(false)
    
    // Build query parameters only for filled fields
    const params = new URLSearchParams()
    
    if (pickupLocation) params.append('pickupLocation', pickupLocation)
    if (pickupDate) params.append('pickupDate', pickupDate)
    if (returnDate) params.append('returnDate', returnDate)
    
    navigate('/cars?' + params.toString())
  }

  // NEW: Helper function to determine if a field should show error styling
  const getFieldErrorClass = (fieldValue) => {
    return showError && !fieldValue ? 'border-red-500 focus:border-red-500' : ''
  }

  // NEW: Helper function to determine label error styling
  const getLabelErrorClass = (fieldValue) => {
    return showError && !fieldValue ? 'text-red-600' : 'text-gray-700'
  }

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center bg-borderColor text-center pt-10 pb-20 md:pt-16 md:pb-32 lg:pb-40 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.h1 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 md:mb-6 px-4"
      >
        Cars on Rent
      </motion.h1>

      <motion.form 
        initial={{ scale: 0.95, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        onSubmit={handleSearch} 
        className="flex flex-col md:flex-row items-start md:items-center justify-center py-3 px-4 md:py-4 md:px-6 rounded-xl md:rounded-full w-[95%] max-w-[50rem] bg-white shadow-xl mx-4"
      >
         <div className="flex flex-col md:flex-row items-start md:items-center justify-center gap-4 md:gap-6 lg:gap-10 w-full md:pl-4">
          {/* Pickup Location */}
          <div className="flex flex-col items-start gap-1.5 md:gap-2 w-full md:w-auto relative" ref={dropdownRef}>
            <label className={`text-xs md:text-sm font-medium flex items-center gap-1 ${getLabelErrorClass(pickupLocation)}`}>
              Pickup Location
              {showError && !pickupLocation && <span className="text-red-500">•</span>}
            </label>
            <input
              type="text"
              value={searchTerm || pickupLocation}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPickupLocation('')
                setIsDropdownOpen(true)
                // Reset error when user starts typing
                if (showError) setShowError(false)
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className={`text-gray-800 border border-gray-300 rounded-lg px-3 py-2 w-full md:w-48 placeholder:text-gray-500 focus:outline-primary focus:border-primary ${getFieldErrorClass(pickupLocation)}`}
              placeholder="Select or type"
            />
            {isDropdownOpen && filteredCities && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50 w-full md:w-48">
                {filteredCities.length > 0 ? (
                  filteredCities.map((city) => (
                    <div
                      key={city}
                      onClick={() => {
                        setPickupLocation(city)
                        setSearchTerm('')
                        setIsDropdownOpen(false)
                        // Reset error when user selects a location
                        if (showError) setShowError(false)
                      }}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-800"
                    >
                      {city}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-700">No locations found</div>
                )}
              </div>
            )}
          </div>

          {/* Pickup Date */}
          <div className="flex flex-col items-start gap-1.5 md:gap-2 w-full md:w-auto">
            <label htmlFor="pickup-date" className={`text-xs md:text-sm font-medium flex items-center gap-1 ${getLabelErrorClass(pickupDate)}`}>
              Pick-up Date
              {showError && !pickupDate && <span className="text-red-500">•</span>}
            </label>
            <input 
              value={pickupDate} 
              onChange={(e) => {
                setPickupDate(e.target.value)
                // Reset error when user selects a date
                if (showError) setShowError(false)
              }}
              type="date"
              id="pickup-date"
              min={new Date().toISOString().split('T')[0]}
              className={`text-sm border border-gray-300 rounded-lg px-3 py-2 w-full md:w-auto focus:outline-primary focus:border-primary ${pickupDate ? 'text-gray-800' : 'text-gray-500'} ${getFieldErrorClass(pickupDate)}`}
            />
          </div>

          {/* Return Date */}
          <div className="flex flex-col items-start gap-1.5 md:gap-2 w-full md:w-auto">
            <label htmlFor="return-date" className={`text-xs md:text-sm font-medium flex items-center gap-1 ${getLabelErrorClass(returnDate)}`}>
              Return Date
              {showError && !returnDate && <span className="text-red-500">•</span>}
            </label>
            <input 
              value={returnDate} 
              onChange={(e) => {
                setReturnDate(e.target.value)
                // Reset error when user selects a date
                if (showError) setShowError(false)
              }}
              type="date"
              id="return-date"
              min={pickupDate || new Date().toISOString().split('T')[0]}
              className={`text-sm border border-gray-300 rounded-lg px-3 py-2 w-full md:w-auto focus:outline-primary focus:border-primary ${returnDate ? 'text-gray-800' : 'text-gray-500'} ${getFieldErrorClass(returnDate)}`}
            />
          </div>

          {/* Search Button */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }} 
            className="flex items-center justify-center gap-2 px-6 py-2.5 mt-3 md:mt-0 md:px-8 md:py-3 bg-primary hover:bg-primary-dull text-white rounded-full cursor-pointer font-medium shadow-md w-full md:w-auto text-sm"
          >
            <img src={assets.search_icon} alt="search" className="brightness-200 w-4 h-4" />
            Search
          </motion.button>
        </div>
      </motion.form>

      {/* Error Message */}
      {showError && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-red-600 text-sm font-medium flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Please fill at least one field to search
        </motion.div>
      )}

      {/* Animated Car with scroll behavior and rotating wheels */}
      <motion.div
        className="absolute bottom-[25%] left-0 right-0 w-full pointer-events-none"
        style={{ x: carX }}
        initial={{ x: '100vw' }}
        animate={{ x: '0%' }}
        transition={{
          duration: 3.5,
          ease: [0.22, 1, 0.36, 1]
        }}
      >
        <div className="relative w-full max-w-[400px] sm:max-w-[500px] md:max-w-[700px] lg:max-w-[800px] mx-auto px-4 sm:px-6">
          {/* Main car body */}
          <img
            src={assets.main_car}
            alt="car"
            className="w-full h-auto object-contain block"
          />
          
          {/* Front Wheel */}
          {!initialAnimDone ? (
            <motion.img
              src={assets.main_car_wheel}
              alt="front wheel"
              className="absolute w-[15%] h-auto object-contain"
              style={{ 
                bottom: '1%',
                left: '70%'
              }}
              initial={{ rotate: 0 }}
              animate={{ rotate: -720 }}
              transition={{
                duration: 3.5,
                ease: [0.22, 1, 0.36, 1]
              }}
              onAnimationComplete={() => setInitialAnimDone(true)}
            />
          ) : (
            <motion.img
              src={assets.main_car_wheel}
              alt="front wheel"
              className="absolute w-[15%] h-auto object-contain"
              style={{ 
                bottom: '1%',
                left: '70%',
                rotate: wheelRotation
              }}
            />
          )}
          
          {/* Rear Wheel */}
          {!initialAnimDone ? (
            <motion.img
              src={assets.main_car_wheel}
              alt="rear wheel"
              className="absolute w-[15%] h-auto object-contain"
              style={{ 
                bottom: '1%',
                left: '14%'
              }}
              initial={{ rotate: 0 }}
              animate={{ rotate: -720 }}
              transition={{
                duration: 3.5,
                ease: [0.22, 1, 0.36, 1]
              }}
            />
          ) : (
            <motion.img
              src={assets.main_car_wheel}
              alt="rear wheel"
              className="absolute w-[15%] h-auto object-contain"
              style={{ 
                bottom: '1%',
                left: '14%',
                rotate: wheelRotation
              }}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Hero