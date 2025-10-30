import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { assets } from '../../assets/assets'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { axios, isOwner, currency } = useAppContext()

  const [data, setData] = useState({
    totalCars: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completeBookings: 0,
    recentBookings: [],
    monthlyRevenue: 0,
  })

  const [selectedBooking, setSelectedBooking] = useState(null)

  const dashboardCards = [
    { title: 'Total Cars', value: data.totalCars, icon: assets.carIconColored },
    { title: 'Total Bookings', value: data.totalBookings, icon: assets.listIconColored },
    { title: 'Pending', value: data.pendingBookings, icon: assets.cautionIconColored },
    { title: 'Confirmed', value: data.completeBookings, icon: assets.listIconColored },
  ]

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get('/api/owner/dashboard')
      if (data.success) {
        setData(data.dashboardData)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (isOwner) fetchDashboardData()
  }, [isOwner])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  }

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking)
  }

  const closeModal = () => {
    setSelectedBooking(null)
  }

  return (
    <motion.div
      className="px-4 pt-10 md:px-10 flex-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Title
        title="Dashboard"
        subTitle="Monitor overall platform performance including total cars, booking, revenue and recent activities"
      />

      {/* Dashboard Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-8 max-w-3xl"
      >
        {dashboardCards.map((card, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
              borderColor: '#3a5a40',
            }}
            className="flex gap-2 items-center justify-between p-5 rounded-2xl border border-borderColor bg-white shadow-sm transition-all duration-200"
          >
            <div>
              <h1 className="text-xs text-gray-500">{card.title}</h1>
              <motion.p
                className="text-lg font-semibold"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {card.value}
              </motion.p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <img src={card.icon} alt="" className="h-5 w-5" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Bookings + Monthly Revenue */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={containerVariants}
        className="flex flex-col gap-6 mb-8 max-w-3xl"
      >
        {/* Recent Bookings */}
        <motion.div
          variants={cardVariants}
          className="w-full p-6 md:p-8 border border-borderColor rounded-2xl bg-white shadow-sm"
          whileHover={{ scale: 1.01 }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-medium">Recent Bookings</h2>
            <p className="text-sm text-gray-500">Latest customer bookings</p>
          </div>

          {/* Scrollable bookings */}
          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {data.recentBookings.length > 0 ? (
              data.recentBookings.map((booking, index) => (
                <motion.div
                  key={booking.id || index}
                  variants={cardVariants}
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: '#f9fafb',
                  }}
                  onClick={() => handleBookingClick(booking)}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer border border-transparent hover:border-primary/20"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 shrink-0">
                    <img src={assets.listIconColored} alt="Booking icon" className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {booking.car?.brand ? `${booking.car.brand} ${booking.car.model || ''}` : 'Unknown vehicle'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'Date N/A'}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <p className="text-sm font-semibold whitespace-nowrap">
                      {currency}{booking.price}
                    </p>
                    <span className={`px-3 py-0.5 rounded-full text-xs capitalize ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No recent bookings</p>
            )}
          </div>
        </motion.div>

        {/* Monthly Revenue */}
        <motion.div
          variants={cardVariants}
          whileHover={{ scale: 1.02 }}
          className="w-full p-6 md:p-8 border border-borderColor rounded-2xl bg-white shadow-sm"
        >
          <h2 className="text-lg font-medium">Monthly Revenue</h2>
          <p className="text-sm text-gray-500">Revenue for current month</p>
          <p
            className="text-3xl pt-6 font-semibold text-primary"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {currency}
            {data.monthlyRevenue.toLocaleString()}
          </p>
        </motion.div>
      </motion.div>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Booking Details</h2>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Status Badge */}
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                    selectedBooking.status === 'confirmed' 
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : selectedBooking.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}>
                    {selectedBooking.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    Booking ID: {selectedBooking.id || 'N/A'}
                  </span>
                </div>

                {/* Car Details */}
                {selectedBooking.car ? (
                  <div className="border border-borderColor rounded-xl p-5 bg-gray-50">
                    <h3 className="text-lg font-medium mb-3">Car Information</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-gray-500">Brand & Model</p>
                        <p className="font-medium">
                          {selectedBooking.car.brand} {selectedBooking.car.model || ''}
                        </p>
                      </div>
                      {selectedBooking.car.year && (
                        <div>
                          <p className="text-sm text-gray-500">Year</p>
                          <p className="font-medium">{selectedBooking.car.year}</p>
                        </div>
                      )}
                      {selectedBooking.car.licensePlate && (
                        <div>
                          <p className="text-sm text-gray-500">License Plate</p>
                          <p className="font-medium">{selectedBooking.car.licensePlate}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border border-borderColor rounded-xl p-5 bg-gray-50">
                    <h3 className="text-lg font-medium mb-3">Car Information</h3>
                    <p className="text-sm text-gray-500">No car data available for this booking.</p>
                  </div>
                )}

                {/* Booking Information */}
                <div className="border border-borderColor rounded-xl p-5">
                  <h3 className="text-lg font-medium mb-3">Booking Information</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Booking Date</p>
                      <p className="font-medium">
                        {new Date(selectedBooking.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    {selectedBooking.pickupDate && (
                      <div>
                        <p className="text-sm text-gray-500">Pickup Date</p>
                        <p className="font-medium">
                          {new Date(selectedBooking.pickupDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                    {selectedBooking.returnDate && (
                      <div>
                        <p className="text-sm text-gray-500">Return Date</p>
                        <p className="font-medium">
                          {new Date(selectedBooking.returnDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                    {selectedBooking.pickupDate && selectedBooking.returnDate && (
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium">
                          {Math.ceil((new Date(selectedBooking.returnDate) - new Date(selectedBooking.pickupDate)) / (1000 * 60 * 60 * 24))} days
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Information */}
                {selectedBooking.user && (
                  <div className="border border-borderColor rounded-xl p-5">
                    <h3 className="text-lg font-medium mb-3">Customer Information</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {(selectedBooking.user.name || selectedBooking.user.username) && (
                        <div>
                          <p className="text-sm text-gray-500">Customer Name</p>
                          <p className="font-medium">{selectedBooking.user.name || selectedBooking.user.username}</p>
                        </div>
                      )}
                      {selectedBooking.user.email && (
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{selectedBooking.user.email}</p>
                        </div>
                      )}
                      {selectedBooking.customerContact && (
                        <div>
                          <p className="text-sm text-gray-500">Contact Number</p>
                          <p className="font-medium">{selectedBooking.customerContact}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="border-t border-borderColor pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">Total Price</span>
                    <span className="text-2xl font-semibold text-primary">
                      {currency}{(selectedBooking.price ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Dashboard

    
