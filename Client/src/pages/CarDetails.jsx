import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets, dummyCarData } from '../assets/assets'
import Loader from '../components/Loader'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'motion/react'
import { validatePhoneNumber, getPhoneErrorMessage } from '../utils/validation.js'

const CarDetails = () => {
  const { id } = useParams()
  const { cars, axios, pickupDate, setPickupDate, returnDate, setReturnDate } = useAppContext()
  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [contactNumber, setContactNumber] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [isPhoneValid, setIsPhoneValid] = useState(false)
  const [phoneInputFocused, setPhoneInputFocused] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [formErrors, setFormErrors] = useState({
    pickupDate: '',
    returnDate: '',
    contactNumber: '',
    paymentMethod: ''
  })
  const [showErrors, setShowErrors] = useState(false)
  const currency = import.meta.env.VITE_CURRENCY

  // Handle phone input change with real-time validation
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setContactNumber(value);

    // Real-time validation
    if (value) {
      const isValid = validatePhoneNumber(value);
      setIsPhoneValid(isValid);
      
      // Show error only if user has typed enough characters
      if (!isValid && value.replace(/\D/g, '').length >= 10) {
        const error = getPhoneErrorMessage(value);
        setPhoneError(error);
        setFormErrors(prev => ({ ...prev, contactNumber: error }));
      } else {
        setPhoneError('');
        setFormErrors(prev => ({ ...prev, contactNumber: '' }));
      }
    } else {
      setPhoneError('');
      setFormErrors(prev => ({ ...prev, contactNumber: '' }));
      setIsPhoneValid(false);
    }
  };

  // Handle phone blur
  const handlePhoneBlur = () => {
    setPhoneInputFocused(false);
    
    if (contactNumber && !isPhoneValid) {
      const error = getPhoneErrorMessage(contactNumber);
      setPhoneError(error);
      setFormErrors(prev => ({ ...prev, contactNumber: error }));
    }
  };

  // Validate all form fields
  const validateForm = () => {
    const errors = {
      pickupDate: '',
      returnDate: '',
      contactNumber: '',
      paymentMethod: ''
    };

    let hasErrors = false;

    // Validate pickup date
    if (!pickupDate) {
      errors.pickupDate = 'Pickup date is required';
      hasErrors = true;
    } else {
      const today = new Date().toISOString().split('T')[0];
      if (pickupDate < today) {
        errors.pickupDate = 'Pickup date cannot be in the past';
        hasErrors = true;
      }
    }

    // Validate return date
    if (!returnDate) {
      errors.returnDate = 'Return date is required';
      hasErrors = true;
    } else if (pickupDate && returnDate <= pickupDate) {
      errors.returnDate = 'Return date must be after pickup date';
      hasErrors = true;
    }

    // Validate contact number
    if (!contactNumber.trim()) {
      errors.contactNumber = 'Contact number is required';
      hasErrors = true;
    } else if (!validatePhoneNumber(contactNumber)) {
      errors.contactNumber = getPhoneErrorMessage(contactNumber);
      hasErrors = true;
    }

    // Validate payment method
    if (!paymentMethod) {
      errors.paymentMethod = 'Please select a payment method';
      hasErrors = true;
    }

    setFormErrors(errors);
    setShowErrors(hasErrors);
    return hasErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form but don't prevent submission
    const hasErrors = validateForm();
    
    if (hasErrors) {
      toast.error('Please check the highlighted fields');
      return;
    }

    try {
      // Clean phone number before sending (remove formatting)
      const cleanedPhone = contactNumber.replace(/\D/g, '');
      
      const { data } = await axios.post('/api/bookings/create', {
        carId: car._id,
        pickupDate,
        returnDate,
        contactNumber: cleanedPhone,
        paymentMethod
      })
      if (data.success) {
        toast.success(data.message)
        navigate('/my-bookings/')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Update form errors when fields change
  useEffect(() => {
    if (showErrors) {
      validateForm();
    }
  }, [pickupDate, returnDate, contactNumber, paymentMethod]);

  useEffect(() => {
    setCar(cars.find((car) => car._id === id))
  }, [cars, id])

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const backButtonVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  }

  const imageVariants = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        duration: 0.7, 
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  const titleVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, delay: 0.3 }
    }
  }

  const specsContainerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.4
      }
    }
  }

  const specItemVariants = {
    initial: { opacity: 0, y: 20, scale: 0.9 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.4 }
    }
  }

  const sectionVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  }

  const formVariants = {
    initial: { opacity: 0, x: 50, scale: 0.95 },
    animate: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: { 
        duration: 0.7, 
        delay: 0.2,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  const formFieldVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  }

  const errorVariants = {
    initial: { opacity: 0, y: -10, height: 0 },
    animate: { 
      opacity: 1, 
      y: 0, 
      height: 'auto',
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      height: 0,
      transition: { duration: 0.2 }
    }
  }

  return (
    <AnimatePresence mode="wait">
      {car ? (
        <motion.div 
          variants={pageVariants}
          initial="initial"
          animate="animate"
          className="px-6 md:px-16 lg:px-24 xl:px-32 mt-16"
        >
          {/* Back Button */}
          <motion.button
            variants={backButtonVariants}
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-6 text-gray-500 cursor-pointer"
          >
            <img
              src={assets.arrow_icon}
              alt=""
              className="rotate-180 opacity-65"
            />
            Back to all Cars
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left: Car Image & Details */}
            <div className="lg:col-span-2">
              {/* Car Image */}
              <motion.div
                variants={imageVariants}
                className="relative overflow-hidden rounded-xl mb-6 shadow-md"
              >
                <motion.img
                  src={car.image}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-auto md:max-h-100 object-cover"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: imageLoaded ? 1 : 1.1 }}
                  transition={{ duration: 0.7 }}
                  onLoad={() => setImageLoaded(true)}
                />
                {!imageLoaded && (
                  <motion.div 
                    className="absolute inset-0 bg-gray-200 animate-pulse"
                    exit={{ opacity: 0 }}
                  />
                )}
              </motion.div>

              <div className="space-y-6">
                {/* Title */}
                <motion.div variants={titleVariants}>
                  <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-2xl font-bold"
                  >
                    {car.brand} {car.model}
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-gray-500 text-lg"
                  >
                    {car.category} · {car.year}
                  </motion.p>
                </motion.div>

                <motion.hr 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="border-borderColor my-6 origin-left" 
                />

                {/* Car Specs */}
                <motion.div 
                  variants={specsContainerVariants}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                >
                  {[
                    { icon: assets.users_icon, text: `${car.seating_capacity} Seats` },
                    { icon: assets.fuel_icon, text: car.fuel_type },
                    { icon: assets.car_icon, text: car.transmission },
                    { icon: assets.location_icon, text: car.location },
                  ].map(({ icon, text }, index) => (
                    <motion.div
                      key={text}
                      variants={specItemVariants}
                      whileHover={{ 
                        scale: 1.05, 
                        y: -5,
                        transition: { duration: 0.2 }
                      }}
                      className="flex flex-col items-center bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 rounded-lg shadow-sm"
                    >
                      <motion.img
                        src={icon}
                        alt=""
                        className="w-6 h-6 mb-2"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: 0.5 + (index * 0.1),
                          type: 'spring',
                          stiffness: 200
                        }}
                      />
                      {text}
                    </motion.div>
                  ))}
                </motion.div>

                {/* Description */}
                <motion.div
                  variants={sectionVariants}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <h1 className="text-xl font-medium mb-3">Description</h1>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-gray-500"
                  >
                    {car.description}
                  </motion.p>
                </motion.div>
              </div>
            </div>

            {/* Right: Booking Form */}
            <motion.form
              variants={formVariants}
              initial="initial"
              animate="animate"
              onSubmit={handleSubmit}
              className="shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6 text-gray-500"
            >
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-center justify-between text-2xl text-gray-800 font-semibold"
              >
                {currency}{car.price_per_day}
                <span className="text-base text-gray-400 font-normal">per day</span>
              </motion.p>

              <motion.hr 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="border-borderColor my-6 origin-left" 
              />

              {/* Pickup Date Field */}
              <motion.div 
                variants={formFieldVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.6 }}
                className="flex flex-col gap-2"
              >
                <label htmlFor="pickup-date">Pickup Date</label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  type="date"
                  className={`border px-3 py-2 rounded-lg outline-none transition-all ${
                    formErrors.pickupDate 
                      ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200' 
                      : 'border-borderColor focus:ring-2 focus:ring-primary/20'
                  }`}
                  id="pickup-date"
                  min={new Date().toISOString().split('T')[0]}
                />
                <AnimatePresence>
                  {formErrors.pickupDate && (
                    <motion.p
                      variants={errorVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="text-red-500 text-xs flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.pickupDate}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Return Date Field */}
              <motion.div 
                variants={formFieldVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.7 }}
                className="flex flex-col gap-2"
              >
                <label htmlFor="return-date">Return Date</label>
                <motion.input 
                  whileFocus={{ scale: 1.02 }}
                  value={returnDate} 
                  onChange={(e) => setReturnDate(e.target.value)}
                  type="date"
                  className={`border px-3 py-2 rounded-lg outline-none transition-all ${
                    formErrors.returnDate 
                      ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200' 
                      : 'border-borderColor focus:ring-2 focus:ring-primary/20'
                  }`}
                  id="return-date"
                  min={pickupDate || new Date().toISOString().split('T')[0]}
                />
                <AnimatePresence>
                  {formErrors.returnDate && (
                    <motion.p
                      variants={errorVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="text-red-500 text-xs flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.returnDate}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Enhanced Contact Number Field with Validation */}
              <motion.div 
                variants={formFieldVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.8 }}
                className="flex flex-col gap-2"
              >
                <label htmlFor="contact-number">
                  Contact Number
                  <span className="text-xs text-gray-400 ml-2">
                    (09XX-XXX-XXXX)
                  </span>
                </label>
                <div className="relative">
                  <motion.input 
                    whileFocus={{ scale: 1.02 }}
                    value={contactNumber} 
                    onChange={handlePhoneChange}
                    onFocus={() => setPhoneInputFocused(true)}
                    onBlur={handlePhoneBlur}
                    type="tel"
                    placeholder="09XX-XXX-XXXX or +639XX-XXX-XXXX"
                    className={`w-full border px-3 py-2 pr-10 rounded-lg outline-none transition-all ${
                      formErrors.contactNumber && !phoneInputFocused
                        ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200'
                        : isPhoneValid
                        ? 'border-green-500 focus:ring-2 focus:ring-green-200'
                        : 'border-borderColor focus:ring-2 focus:ring-primary/20'
                    }`}
                    id="contact-number"
                  />
                  
                  {/* Validation Icon */}
                  {contactNumber && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isPhoneValid ? (
                        <motion.svg 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 text-green-500" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </motion.svg>
                      ) : contactNumber.replace(/\D/g, '').length >= 10 ? (
                        <motion.svg 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 text-red-500" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </motion.svg>
                      ) : null}
                    </div>
                  )}
                </div>
                
                {/* Error Message */}
                <AnimatePresence>
                  {formErrors.contactNumber && !phoneInputFocused && (
                    <motion.p
                      variants={errorVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="text-red-500 text-xs flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.contactNumber}
                    </motion.p>
                  )}
                </AnimatePresence>
                
                {/* Success Message */}
                <AnimatePresence>
                  {isPhoneValid && (
                    <motion.p
                      variants={errorVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="text-green-600 text-xs flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Valid phone number
                    </motion.p>
                  )}
                </AnimatePresence>
                
                {/* Help Text */}
                <p className="text-xs text-gray-400">
                  Enter Philippine mobile number (11 digits starting with 09)
                </p>
              </motion.div>

              {/* Payment Method Selection */}
              <motion.div 
                variants={formFieldVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.85 }}
                className="flex flex-col gap-2"
              >
                <label htmlFor="payment-method">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'cash', label: 'Cash', icon: '' },
                    { value: 'card', label: 'Card', icon: '' },
                    { value: 'gcash', label: 'Gcash', icon: '' },
                    { value: 'maya', label: 'Maya', icon: '' }
                  ].map((method) => (
                    <motion.button
                      key={method.value}
                      type="button"
                      onClick={() => setPaymentMethod(method.value)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        paymentMethod === method.value
                          ? formErrors.paymentMethod
                            ? 'border-red-500 bg-red-50 text-red-600 font-semibold'
                            : 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-borderColor hover:border-primary/50 text-gray-600'
                      }`}
                    >
                      <span className="text-xl">{method.icon}</span>
                      <span className="text-sm">{method.label}</span>
                    </motion.button>
                  ))}
                </div>
                <AnimatePresence>
                  {formErrors.paymentMethod && (
                    <motion.p
                      variants={errorVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="text-red-500 text-xs flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.paymentMethod}
                    </motion.p>
                  )}
                </AnimatePresence>
                {!paymentMethod && !formErrors.paymentMethod && (
                  <p className="text-xs text-gray-400">
                    Select your preferred payment method
                  </p>
                )}
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.95 }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
                }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary hover:bg-primary-dull transition-all py-3 font-medium text-white rounded-xl cursor-pointer"
                type="submit"
              >
                Book Now
              </motion.button>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.05 }}
                className="text-center text-sm"
              >
                No credit card required to reserve
              </motion.p>
            </motion.form>
          </div>
        </motion.div>
      ) : (
        <Loader />
      )}
    </AnimatePresence>
  )
}

export default CarDetails;
