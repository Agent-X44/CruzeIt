import React, { useEffect, useState } from 'react'
import Title from '../components/Title'
import { assets, dummyCarData } from '../assets/assets'
import CarCards from '../components/CarCards'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'motion/react'

const Cars = () => {
  // Get search params from URL
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const pickupLocation = searchParams.get('pickupLocation')
  const pickupDate = searchParams.get('pickupDate')
  const returnDate = searchParams.get('returnDate')
  const urlSearch = searchParams.get('search') // Get search from URL

  const { cars, axios } = useAppContext()

  const [input, setInput] = useState(urlSearch || '')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedFuelTypes, setSelectedFuelTypes] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  const isSearchData = pickupLocation && pickupDate && returnDate
  const [filteredCars, setFilteredCars] = useState([])

  // Categories for filtering
  const categories = ['SUV', 'Sedan', 'Hatchback', 'Sports', 'Luxury', 'Electric']
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid']

  // Toggle category selection
  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  // Toggle fuel type selection
  const toggleFuelType = (fuelType) => {
    setSelectedFuelTypes(prev => 
      prev.includes(fuelType) 
        ? prev.filter(f => f !== fuelType)
        : [...prev, fuelType]
    )
  }

  const applyFilter = () => {
    let filtered = cars.slice()

    // Apply search filter - includes location
    if (input.trim() !== '') {
      filtered = filtered.filter((car) => {
        const searchTerm = input.toLowerCase()
        
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

    // Apply category filter (multiple selection)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((car) => selectedCategories.includes(car.category))
    }

    // Apply fuel type filter (multiple selection)
    if (selectedFuelTypes.length > 0) {
      filtered = filtered.filter((car) => selectedFuelTypes.includes(car.fuel_type))
    }

    setFilteredCars(filtered)
  }

  const searchCarAvailability = async () => {
    setIsLoading(true)
    try {
      const { data } = await axios.post('/api/bookings/check-availability',
        { location: pickupLocation, pickupDate, returnDate })
      if (data.success) {
        setFilteredCars(data.availableCars)
        if (data.availableCars.length === 0) {
          toast.error('No cars available for selected dates')
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

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value
    setInput(value)
    
    // Update URL with search param
    if (value.trim()) {
      searchParams.set('search', value.trim())
    } else {
      searchParams.delete('search')
    }
    setSearchParams(searchParams)
  }

  // Clear all filters
  const clearFilters = () => {
    setInput('')
    setSelectedCategories([])
    setSelectedFuelTypes([])
    searchParams.delete('search')
    setSearchParams(searchParams)
  }

  useEffect(() => {
    if (isSearchData) {
      searchCarAvailability()
    } else {
      setTimeout(() => setIsLoading(false), 500)
    }
  }, [])

  useEffect(() => {
    if (cars.length > 0 && !isSearchData) {
      applyFilter()
    }
  }, [input, cars, selectedCategories, selectedFuelTypes])

  // Update input when URL search param changes
  useEffect(() => {
    if (urlSearch) {
      setInput(urlSearch)
    }
  }, [urlSearch])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.3
      }
    }
  }

  const hasActiveFilters = selectedCategories.length > 0 || selectedFuelTypes.length > 0 || input

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Title 
            title='Available Cars' 
            subTitle='Browse our selection of premium vehicles available for your next adventure' 
          />
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.02 }}
          className='flex items-center bg-white px-4 mt-6 max-w-140 w-full h-12 rounded-full shadow-lg'
        >
          <motion.img 
            animate={{ rotate: input ? 360 : 0 }}
            transition={{ duration: 0.5 }}
            src={assets.search_icon} 
            alt="" 
            className='w-4.5 h-4.5 mr-2' 
          />

          <input 
            onChange={handleSearchChange}
            value={input} 
            type="text" 
            placeholder='Search by brand, model, location, year...' 
            className='w-full h-full outline-none text-gray-500' 
          />

          {input && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearFilters}
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
            <img 
              src={assets.filter_icon} 
              alt="filter" 
              className='w-4.5 h-4.5 ml-2' 
            />
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
                <div className='flex flex-col sm:flex-row gap-6'>
                  {/* Category Filter */}
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

                  {/* Fuel Type Filter */}
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

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={clearFilters}
                    className='mt-4 px-6 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all text-sm font-medium'
                  >
                    Clear All Filters
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Cars Grid Section */}
      <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-10 mb-20'>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className='flex justify-between items-center mb-4 xl:px-20 max-w-7xl mx-auto flex-wrap gap-4'
        >
          <p className='text-gray-500'>
            Showing {filteredCars.length} {filteredCars.length === 1 ? 'Car' : 'Cars'}
          </p>
          
          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className='flex items-center gap-2 text-sm flex-wrap'>
              <span className='text-gray-500'>Filters:</span>
              {input && (
                <span className='px-3 py-1 bg-primary/10 text-primary rounded-full'>
                  "{input}"
                </span>
              )}
              {selectedCategories.map(category => (
                <span key={category} className='px-3 py-1 bg-blue-50 text-blue-600 rounded-full flex items-center gap-1'>
                  {category}
                  <button
                    onClick={() => toggleCategory(category)}
                    className='hover:text-blue-800'
                  >
                    ×
                  </button>
                </span>
              ))}
              {selectedFuelTypes.map(fuelType => (
                <span key={fuelType} className='px-3 py-1 bg-green-50 text-green-600 rounded-full flex items-center gap-1'>
                  {fuelType}
                  <button
                    onClick={() => toggleFuelType(fuelType)}
                    className='hover:text-green-800'
                  >
                    ×
                  </button>
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
              className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto'
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="bg-gray-200 rounded-lg h-80 animate-pulse"
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto'
            >
              <AnimatePresence mode="popLayout">
                {filteredCars.map((car, index) => (
                  <motion.div 
                    key={car._id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    whileHover={{ 
                      y: -8, 
                      scale: 1.03,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <CarCards car={car} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Results */}
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

export default Cars;
