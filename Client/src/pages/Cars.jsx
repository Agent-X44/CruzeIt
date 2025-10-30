import React, { useEffect, useState, useRef } from 'react'
import Title from '../components/Title'
import { assets, cityList } from '../assets/assets'
import CarCards from '../components/CarCards'
import { useSearchParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'motion/react'

const Cars = () => {
  // Get search params from URL
  const [searchParams, setSearchParams] = useSearchParams()
  
  const urlPickupLocation = searchParams.get('pickupLocation')
  const urlPickupDate = searchParams.get('pickupDate')
  const urlReturnDate = searchParams.get('returnDate')
  const urlSearch = searchParams.get('search')

  const { cars, axios } = useAppContext()

  // State management
  const [input, setInput] = useState(urlSearch || '')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedFuelTypes, setSelectedFuelTypes] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [pickupLocation, setPickupLocation] = useState(urlPickupLocation || '')
  const [locationSearchTerm, setLocationSearchTerm] = useState('')
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false)
  const [pickupDate, setPickupDate] = useState(urlPickupDate || '')
  const [returnDate, setReturnDate] = useState(urlReturnDate || '')
  const [dynamicCities, setDynamicCities] = useState([])
  const [bookings, setBookings] = useState([])
  const [isScrolled, setIsScrolled] = useState(false)

  // Refs
  const locationDropdownRef = useRef(null)

  // Filtered cars state
  const [filteredCars, setFilteredCars] = useState([])

  // Constants
  const categories = ['SUV', 'Sedan', 'Hatchback', 'Sports', 'Luxury', 'Electric']
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid']

  // Fetch data on component mount
  useEffect(() => {
    fetchLocations()
    fetchBookings()
  }, [axios])

  // Fetch locations from API
  const fetchLocations = async () => {
    try {
      const { data } = await axios.get('/api/owner/locations')
      if (data.success && data.locations) {
        setDynamicCities(data.locations)
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
  }

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      const { data } = await axios.get('/api/bookings')
      if (data.success && data.bookings) {
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  // Merge and filter cities
  const allCities = [...new Set([...(cityList || []), ...dynamicCities])].sort()
  const filteredCities = allCities.filter(city =>
    city.toLowerCase().includes(locationSearchTerm.toLowerCase())
  )

  // Check car availability for selected dates
  const isCarAvailableForDates = (carId, selectedPickup, selectedReturn) => {
    if (!selectedPickup && !selectedReturn) return true

    const pickup = selectedPickup ? new Date(selectedPickup) : null
    const returnDate = selectedReturn ? new Date(selectedReturn) : null

    // Find bookings for this car
    const carBookings = bookings.filter(booking => 
      booking.car && booking.car.$oid === carId
    )

    // Check for date conflicts
    return !carBookings.some(booking => {
      const bookingPickup = new Date(booking.pickupDate.$date.$numberLong)
      const bookingReturn = new Date(booking.returnDate.$date.$numberLong)

      if (pickup && returnDate) {
        // Check if selected dates overlap with booking dates
        return (
          (pickup >= bookingPickup && pickup <= bookingReturn) ||
          (returnDate >= bookingPickup && returnDate <= bookingReturn) ||
          (pickup <= bookingPickup && returnDate >= bookingReturn)
        )
      } else if (pickup) {
        return pickup >= bookingPickup && pickup <= bookingReturn
      } else if (returnDate) {
        return returnDate >= bookingPickup && returnDate <= bookingReturn
      }

      return false
    })
  }

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      setIsScrolled(scrollTop > 100)
      
      if (scrollTop > 200 && showFilters) {
        setShowFilters(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [showFilters])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
        setIsLocationDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter toggles
  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const toggleFuelType = (fuelType) => {
    setSelectedFuelTypes(prev => 
      prev.includes(fuelType) 
        ? prev.filter(f => f !== fuelType)
        : [...prev, fuelType]
    )
  }

  // Main filter function
  const applyFilter = () => {
    let filtered = cars.filter(car => car.isAvailable === true)

    // Text search filter
    if (input.trim()) {
      const searchTerm = input.toLowerCase()
      filtered = filtered.filter((car) => {
        return (
          car.brand?.toLowerCase().includes(searchTerm) ||
          car.model?.toLowerCase().includes(searchTerm) ||
          car.category?.toLowerCase().includes(searchTerm) ||
          car.fuel_type?.toLowerCase().includes(searchTerm) ||
          car.transmission?.toLowerCase().includes(searchTerm) ||
          car.location?.toLowerCase().includes(searchTerm) ||
          car.pickupLocation?.toLowerCase().includes(searchTerm) ||
          car.year?.toString().includes(searchTerm) ||
          `${car.brand} ${car.model}`.toLowerCase().includes(searchTerm)
        )
      })
    }

    // Location filter
    if (pickupLocation && !input.trim()) {
      const loc = pickupLocation.toLowerCase()
      filtered = filtered.filter((car) => {
        return (
          car.location?.toLowerCase().includes(loc) ||
          car.pickupLocation?.toLowerCase().includes(loc)
        )
      })
    }

    // Date filter
    if (pickupDate || returnDate) {
      filtered = filtered.filter((car) => {
        return isCarAvailableForDates(car._id, pickupDate, returnDate)
      })
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((car) => selectedCategories.includes(car.category))
    }

    // Fuel type filter
    if (selectedFuelTypes.length > 0) {
      filtered = filtered.filter((car) => selectedFuelTypes.includes(car.fuel_type))
    }

    setFilteredCars(filtered)
    setIsLoading(false)
  }

  // Search availability via API
  const searchCarAvailability = async () => {
    setIsLoading(true)
    try {
      const { data } = await axios.post('/api/bookings/check-availability', {
        location: pickupLocation,
        pickupDate: pickupDate,
        returnDate: returnDate
      })
      
      if (data.success) {
        const availableCars = data.availableCars.filter(car => car.isAvailable === true)
        setFilteredCars(availableCars)
        if (availableCars.length === 0) {
          toast.error('No cars available for selected criteria')
        }
      } else {
        toast.error(data.message || 'Failed to fetch available cars')
      }
    } catch (error) {
      toast.error('Error fetching available cars')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle search action
  const handleSearch = () => {
    if (!pickupLocation && !pickupDate && !returnDate && !input.trim() && 
        selectedCategories.length === 0 && selectedFuelTypes.length === 0) {
      toast.error('Please fill at least one field to search')
      return
    }

    // Update URL params
    const params = new URLSearchParams()
    if (pickupLocation) params.set('pickupLocation', pickupLocation)
    if (pickupDate) params.set('pickupDate', pickupDate)
    if (returnDate) params.set('returnDate', returnDate)
    if (input.trim()) params.set('search', input.trim())
    setSearchParams(params)

    // Choose search method
    if (pickupLocation && pickupDate && returnDate) {
      searchCarAvailability()
    } else {
      applyFilter()
    }
    
    setShowFilters(false)
  }

  // Location selection handler
  const handleLocationSelect = (city) => {
    setPickupLocation(city)
    setLocationSearchTerm('')
    setIsLocationDropdownOpen(false)
  }

  // Input handlers
  const handleSearchChange = (e) => {
    setInput(e.target.value)
  }

  const handlePickupDateChange = (e) => {
    const newDate = e.target.value
    setPickupDate(newDate)
    if (returnDate && newDate > returnDate) {
      setReturnDate('')
    }
  }

  const handleReturnDateChange = (e) => {
    setReturnDate(e.target.value)
  }

  // Clear filters
  const clearFilters = () => {
    setInput('')
    setPickupLocation('')
    setLocationSearchTerm('')
    setPickupDate('')
    setReturnDate('')
    setSelectedCategories([])
    setSelectedFuelTypes([])
    setIsLocationDropdownOpen(false)
    setSearchParams(new URLSearchParams())
    setFilteredCars(cars.filter(car => car.isAvailable === true))
    setShowFilters(false)
  }

  // Clear only date and location filters
  const clearDateLocationFilters = () => {
    setPickupLocation('')
    setLocationSearchTerm('')
    setPickupDate('')
    setReturnDate('')
    setIsLocationDropdownOpen(false)
    
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('pickupLocation')
    newParams.delete('pickupDate')
    newParams.delete('returnDate')
    setSearchParams(newParams)

    applyFilter()
  }

  // Initial load and URL param handling
  useEffect(() => {
    if (urlPickupLocation && urlPickupDate && urlReturnDate) {
      searchCarAvailability()
    } else {
      setTimeout(() => {
        applyFilter()
      }, 500)
    }
  }, [])

  // Apply filters when dependencies change
  useEffect(() => {
    if (cars.length > 0 && bookings.length > 0) {
      applyFilter()
    }
  }, [input, cars, selectedCategories, selectedFuelTypes, pickupLocation, pickupDate, returnDate, bookings])

  // Sync state with URL params
  useEffect(() => {
    if (urlPickupLocation) setPickupLocation(urlPickupLocation)
    if (urlPickupDate) setPickupDate(urlPickupDate)
    if (urlReturnDate) setReturnDate(urlReturnDate)
    if (urlSearch) setInput(urlSearch)
  }, [urlPickupLocation, urlPickupDate, urlReturnDate, urlSearch])

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const hasActiveFilters = selectedCategories.length > 0 || selectedFuelTypes.length > 0 || 
                          input || pickupLocation || pickupDate || returnDate

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.3 }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className='flex flex-col items-center py-20 bg-light max-md:px-4'
      >
        <Title 
          title='Available Cars' 
          subTitle='Browse our selection of premium vehicles available for your next adventure' 
        />

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.02 }}
          className={`flex items-center bg-white px-4 mt-6 max-w-140 w-full h-12 rounded-full shadow-lg ${
            isScrolled ? 'sticky top-4 z-40 max-w-4xl transition-all duration-300' : ''
          }`}
        >
          <motion.img 
            animate={{ rotate: input ? 360 : 0 }}
            transition={{ duration: 0.5 }}
            src={assets.search_icon} 
            alt="Search" 
            className='w-4.5 h-4.5 mr-2' 
          />

          <input 
            onChange={handleSearchChange}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            value={input} 
            type="text" 
            placeholder='Search by brand, model, features...' 
            className='w-full h-full outline-none text-gray-500' 
          />

          {input && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setInput('')}
              className='text-gray-400 hover:text-gray-600 mr-2'
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowFilters(!showFilters)}
            className='cursor-pointer'
          >
            <img src={assets.filter_icon} alt="Filter" className='w-4.5 h-4.5 ml-2' />
          </motion.button>
        </motion.div>

        {/* Filters Section */}
        <div className='w-full max-w-140 overflow-hidden'>
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className='mt-4 bg-white rounded-2xl shadow-lg p-6 w-full'
              >
                {/* Location & Dates Section */}
                <div className='mb-6'>
                  <h3 className='text-sm font-semibold text-gray-700 mb-4'>Location & Dates</h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    {/* Location Input */}
                    <div className="flex flex-col items-start gap-1.5 w-full relative" ref={locationDropdownRef}>
                      <label className="text-xs font-medium text-gray-700">Pickup Location</label>
                      <input
                        type="text"
                        value={locationSearchTerm || pickupLocation}
                        onChange={(e) => {
                          setLocationSearchTerm(e.target.value)
                          setPickupLocation('')
                          setIsLocationDropdownOpen(true)
                        }}
                        onFocus={() => setIsLocationDropdownOpen(true)}
                        className="text-gray-800 border border-gray-300 rounded-lg px-3 py-2 w-full placeholder:text-gray-500 focus:outline-primary focus:border-primary text-sm"
                        placeholder="Select or type"
                      />
                      {isLocationDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50 w-full">
                          {filteredCities.length > 0 ? (
                            filteredCities.map((city) => (
                              <div
                                key={city}
                                onClick={() => handleLocationSelect(city)}
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
                    <div className="flex flex-col items-start gap-1.5">
                      <label className="text-xs font-medium text-gray-700">Pick-up Date</label>
                      <input 
                        value={pickupDate} 
                        onChange={handlePickupDateChange}
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        className={`text-sm border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-primary focus:border-primary ${pickupDate ? 'text-gray-800' : 'text-gray-500'}`}
                      />
                    </div>

                    {/* Return Date */}
                    <div className="flex flex-col items-start gap-1.5">
                      <label className="text-xs font-medium text-gray-700">Return Date</label>
                      <input 
                        value={returnDate} 
                        onChange={handleReturnDateChange}
                        type="date"
                        min={pickupDate || new Date().toISOString().split('T')[0]}
                        className={`text-sm border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-primary focus:border-primary ${returnDate ? 'text-gray-800' : 'text-gray-500'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Category & Fuel Type Filters */}
                <div className='flex flex-col sm:flex-row gap-6'>
                  <div className='flex-1'>
                    <label className='text-sm font-semibold text-gray-700 mb-2 block'>
                      Category {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                    </label>
                    <div className='flex flex-wrap gap-2'>
                      {categories.map((category) => (
                        <motion.button
                          key={category}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleCategory(category)}
                          className={`px-4 py-2 rounded-full text-sm transition-all ${
                            selectedCategories.includes(category)
                              ? 'bg-primary text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {category}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className='flex-1'>
                    <label className='text-sm font-semibold text-gray-700 mb-2 block'>
                      Fuel Type {selectedFuelTypes.length > 0 && `(${selectedFuelTypes.length})`}
                    </label>
                    <div className='flex flex-wrap gap-2'>
                      {fuelTypes.map((fuelType) => (
                        <motion.button
                          key={fuelType}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleFuelType(fuelType)}
                          className={`px-4 py-2 rounded-full text-sm transition-all ${
                            selectedFuelTypes.includes(fuelType)
                              ? 'bg-primary text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {fuelType}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t'>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSearch}
                    className='flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dull text-white rounded-lg cursor-pointer font-medium shadow-md text-sm flex-1'
                  >
                    <img src={assets.search_icon} alt="Search" className="brightness-200 w-4 h-4" />
                    Apply Filters
                  </motion.button>

                  {hasActiveFilters && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={clearFilters}
                      className='px-6 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all text-sm font-medium'
                    >
                      Clear All
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Cars Grid Section */}
      <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-10 mb-20'>
        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className='flex justify-between items-center mb-4 max-w-7xl mx-auto flex-wrap gap-4'
        >
          <p className='text-gray-500'>
            Showing {filteredCars.length} {filteredCars.length === 1 ? 'Car' : 'Cars'}
            {pickupLocation && ` in ${pickupLocation}`}
          </p>
          
          {/* Active Filters */}
          {hasActiveFilters && (
            <div className='flex items-center gap-2 text-sm flex-wrap'>
              <span className='text-gray-500'>Filters:</span>
              
              {pickupLocation && (
                <span className='px-3 py-1 bg-purple-50 text-purple-600 rounded-full flex items-center gap-1'>
                  📍 {pickupLocation}
                  <button onClick={() => setPickupLocation('')} className='hover:text-purple-800'>×</button>
                </span>
              )}
              
              {pickupDate && returnDate && (
                <span className='px-3 py-1 bg-green-50 text-green-600 rounded-full flex items-center gap-1'>
                  📅 {formatDate(pickupDate)} - {formatDate(returnDate)}
                  <button onClick={() => { setPickupDate(''); setReturnDate('') }} className='hover:text-green-800'>×</button>
                </span>
              )}
              
              {input && (
                <span className='px-3 py-1 bg-primary/10 text-primary rounded-full flex items-center gap-1'>
                  "{input}"
                  <button onClick={() => setInput('')} className='hover:text-primary-dull'>×</button>
                </span>
              )}
              
              {selectedCategories.map(category => (
                <span key={category} className='px-3 py-1 bg-blue-50 text-blue-600 rounded-full flex items-center gap-1'>
                  {category}
                  <button onClick={() => toggleCategory(category)} className='hover:text-blue-800'>×</button>
                </span>
              ))}
              
              {selectedFuelTypes.map(fuelType => (
                <span key={fuelType} className='px-3 py-1 bg-green-50 text-green-600 rounded-full flex items-center gap-1'>
                  {fuelType}
                  <button onClick={() => toggleFuelType(fuelType)} className='hover:text-green-800'>×</button>
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Loading State */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='flex justify-center'
            >
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 max-w-7xl mx-auto w-full justify-items-center'>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="bg-gray-200 rounded-lg h-80 w-full max-w-sm animate-pulse"
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className='flex justify-center'
            >
              <div className={`
                grid gap-8 mt-4 max-w-7xl mx-auto w-full
                ${filteredCars.length === 1 ? 'grid-cols-1 justify-items-center' : ''}
                ${filteredCars.length === 2 ? 'grid-cols-1 sm:grid-cols-2 justify-items-center' : ''}
                ${filteredCars.length >= 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : ''}
              `}>
                <AnimatePresence mode="popLayout">
                  {filteredCars.map((car) => (
                    <motion.div 
                      key={car._id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.3 } }}
                      className={`
                        ${filteredCars.length === 1 ? 'w-full max-w-sm' : ''}
                        ${filteredCars.length === 2 ? 'w-full max-w-sm' : ''}
                        ${filteredCars.length >= 3 ? 'w-full' : ''}
                      `}
                    >
                      <CarCards car={car} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Results State */}
        <AnimatePresence>
          {!isLoading && filteredCars.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-20"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                🚗
              </motion.div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">No cars found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearFilters}
                className='px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dull transition-all'
              >
                Clear Filters
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default Cars