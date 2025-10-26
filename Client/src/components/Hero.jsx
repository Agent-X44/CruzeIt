import React, { useState, useRef, useEffect } from 'react'
import { assets, cityList } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import { motion, useScroll, useTransform } from 'motion/react'

const Hero = () => {
  const [pickupLocation, setPickupLocation] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)
  const { pickupDate, setPickupDate, returnDate, setReturnDate, navigate } = useAppContext()
  
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
  
  // Filter cities based on search
  const filteredCities = (cityList || []).filter(city =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Scroll animation for the car - slower movement
  const { scrollY } = useScroll()
  const carX = useTransform(scrollY, [0, 800], ['0%', '-150%'])
  
  // Wheel rotation based on scroll - smoother rotation
  const wheelRotation = useTransform(scrollY, [0, 800], [0, -1440])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!pickupLocation) {
      alert('Please select a pickup location')
      return
    }
    navigate('/cars?pickupLocation=' + pickupLocation + '&pickupDate=' + pickupDate + '&returnDate=' + returnDate)
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
        className="flex flex-col md:flex-row items-start md:items-center justify-between py-3 px-4 md:py-4 md:px-6 rounded-xl md:rounded-full w-[95%] max-w-[56rem] bg-white shadow-xl mx-4"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 lg:gap-10 w-full md:ml-6">
          {/* Pickup Location */}
          <div className="flex flex-col items-start gap-1.5 md:gap-2 w-full md:w-auto relative" ref={dropdownRef}>
            <label className="text-xs md:text-sm font-medium text-gray-700">Pickup Location</label>
            <input
              type="text"
              required
              value={searchTerm || pickupLocation}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPickupLocation('')
                setIsDropdownOpen(true)
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="text-gray-800 border border-gray-300 rounded-lg px-3 py-2 w-full md:w-48 placeholder:text-gray-500 focus:outline-primary focus:border-primary"
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
            <label htmlFor="pickup-date" className="text-xs md:text-sm font-medium text-gray-700">
              Pick-up Date
            </label>
            <input 
              value={pickupDate} 
              onChange={(e) => setPickupDate(e.target.value)}
              type="date"
              id="pickup-date"
              min={new Date().toISOString().split('T')[0]}
              className={`text-sm border border-gray-300 rounded-lg px-3 py-2 w-full md:w-auto focus:outline-primary focus:border-primary ${pickupDate ? 'text-gray-800' : 'text-gray-500'}`}
              required
            />
          </div>

          {/* Return Date */}
          <div className="flex flex-col items-start gap-1.5 md:gap-2 w-full md:w-auto">
            <label htmlFor="return-date" className="text-xs md:text-sm font-medium text-gray-700">
              Return Date
            </label>
            <input 
              value={returnDate} 
              onChange={(e) => setReturnDate(e.target.value)}
              type="date"
              id="return-date"
              min={pickupDate || new Date().toISOString().split('T')[0]}
              className={`text-sm border border-gray-300 rounded-lg px-3 py-2 w-full md:w-auto focus:outline-primary focus:border-primary ${returnDate ? 'text-gray-800' : 'text-gray-500'}`}
              required
            />
          </div>
        </div>

        {/* Search Button */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }} 
          className="flex items-center justify-center gap-2 px-6 py-2.5 mt-3 md:mt-0 md:px-8 md:py-3 md:ml-4 bg-primary hover:bg-primary-dull text-white rounded-full cursor-pointer font-medium shadow-md w-full md:w-auto text-sm"
        >
          <img src={assets.search_icon} alt="search" className="brightness-200 w-4 h-4" />
          Search
        </motion.button>
      </motion.form>

      {/* Animated Car with scroll behavior and rotating wheels */}
      <motion.div
        className="absolute bottom-[25%] left-0 right-0 w-full pointer-events-none"
        style={{ x: carX }}
        initial={{ x: '100vw' }}
        animate={{ x: '0%' }}
        transition={{
          duration: 5,
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
          <motion.img
            src={assets.main_car_wheel}
            alt="front wheel"
            className="absolute w-[15%] h-auto object-contain"
            style={{ 
              bottom: '1%',
              left: '70%',
              rotate: wheelRotation
            }}
            initial={{ rotate: 0 }}
            animate={{ rotate: -720 }}
            transition={{
              duration: 3.5,
              ease: "linear"
            }}
          />
          
          {/* Rear Wheel */}
          <motion.img
            src={assets.main_car_wheel}
            alt="rear wheel"
            className="absolute w-[15%] h-auto object-contain"
            style={{ 
              bottom: '1%',
              left: '14%',
              rotate: wheelRotation
            }}
            initial={{ rotate: 0 }}
            animate={{ rotate: -720 }}
            transition={{
              duration: 3.5,
              ease: "linear"
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Hero
