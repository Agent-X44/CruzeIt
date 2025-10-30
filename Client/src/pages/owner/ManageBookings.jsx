import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Title from '../../components/owner/Title'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import {toast} from 'react-hot-toast'

const ManageBookings = () => {

  const {currency, axios} = useAppContext()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const fetchOwnerBookings = async () => {
    try {
      setLoading(true)
      const {data} = await axios.get('/api/bookings/owner')
      data.success ? setBookings(data.bookings) : toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const changeBookingStatus = async (bookingId, status) => {
    try {
      const {data} = await axios.post('/api/bookings/change-status', {bookingId, status})
      if(data.success){
        toast.success(data.message)
        fetchOwnerBookings()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const cancelConfirmedBooking = async (bookingId) => {
    try {
      const {data} = await axios.post('/api/bookings/cancel-confirmed', {bookingId})
      if(data.success){
        toast.success(data.message)
        fetchOwnerBookings()
        closeModal()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleRowClick = (booking) => {
    setSelectedBooking(booking)
  }

  const closeModal = () => {
    setSelectedBooking(null)
    setShowCancelModal(false)
  }

  const handleCancelConfirmed = () => {
    setShowCancelModal(true)
  }

  const confirmCancellation = () => {
    if (selectedBooking) {
      cancelConfirmedBooking(selectedBooking._id)
    }
  }

  const formatPaymentMethod = (method) => {
    if (!method) return { label: 'Not specified', icon: null };
    
    const paymentMethods = {
      'cash': { 
        label: 'Cash', 
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16V8C21 6.89543 20.1046 6 19 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 9V9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 15V15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      },
      'card': { 
        label: 'Card', 
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 15H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16V8C21 6.89543 20.1046 6 19 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      },
      'gcash': { 
        label: 'Gcash', 
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="4" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M6 7H18" stroke="currentColor" strokeWidth="2"/>
            <path d="M10 11H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 11V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M10 15H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="18" r="0.5" fill="currentColor"/>
          </svg>
        )
      },
      'maya': { 
        label: 'Maya', 
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 10H3M21 10C21 8.89543 20.1046 8 19 8H5C3.89543 8 3 10M21 10V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 18V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8V6C12 4.89543 12.8954 4 14 4H16C17.1046 4 18 4.89543 18 6V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="15" r="1.5" fill="currentColor"/>
          </svg>
        )
      }
    };
    
    return paymentMethods[method.toLowerCase()] || { label: method, icon: null };
  }

  useEffect(() => {
    fetchOwnerBookings()
  }, [])

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

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.3
      }
    }
  }

  const tableVariants = {
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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  }

  return (
    <motion.div 
      className="px-4 pt-10 md:px-10 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Title
        title="Manage Bookings"
        subTitle="Track all customer bookings, approve or cancel requests, and manage booking statuses"
      />

      <motion.div 
        variants={tableVariants}
        initial="hidden"
        animate="show"
        className="max-w-6xl w-full rounded-2xl overflow-hidden border border-borderColor mt-6 bg-white shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-gray-600">
            <thead className="bg-gray-50">
              <motion.tr
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <th className="p-4 font-semibold text-gray-700">Car</th>
                <th className="p-4 font-semibold text-gray-700 max-md:hidden">Date Range</th>
                <th className="p-4 font-semibold text-gray-700">Contact</th>
                <th className="p-4 font-semibold text-gray-700">Total</th>
                <th className="p-4 font-semibold text-gray-700 max-lg:hidden">Payment</th>
                <th className="p-4 font-semibold text-gray-700">Actions</th>
              </motion.tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan="6" className="p-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <motion.div
                          className="w-2 h-2 bg-primary rounded-full"
                          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-primary rounded-full"
                          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-primary rounded-full"
                          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </td>
                  </motion.tr>
                ) : bookings.length === 0 ? (
                  <motion.tr
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <td colSpan="6" className="p-12 text-center">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col items-center gap-3"
                      >
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <p className="text-gray-400 font-medium">No bookings yet</p>
                        <p className="text-gray-400 text-xs">Bookings will appear here once customers make reservations</p>
                      </motion.div>
                    </td>
                  </motion.tr>
                ) : (
                  bookings.map((booking, index) => {
                    const paymentInfo = formatPaymentMethod(booking.paymentMethod);
                    
                    return (
                      <motion.tr
                        key={booking._id}
                        variants={rowVariants}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        custom={index}
                        onClick={() => handleRowClick(booking)}
                        whileHover={{ 
                          backgroundColor: '#f9fafb',
                          transition: { duration: 0.2 }
                        }}
                        className="border-t border-borderColor text-gray-600 cursor-pointer"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <motion.img
                              src={booking.car?.image || assets.car_icon}
                              alt={`${booking.car?.brand || ''} ${booking.car?.model || ''}`}
                              className="h-14 w-14 aspect-square rounded-lg object-cover shadow-sm"
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            />
                            <p className="font-medium text-gray-700 max-md:hidden">
                              {booking.car?.brand ? `${booking.car.brand} ${booking.car.model || ''}` : 'Unknown vehicle'}
                            </p>
                          </div>
                        </td>

                        <td className="p-4 max-md:hidden">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-500">From</span>
                            <span className="font-medium text-gray-700">{(booking.pickupDate || '').split('T')[0] || 'N/A'}</span>
                            <span className="text-xs text-gray-500">To</span>
                            <span className="font-medium text-gray-700">{(booking.returnDate || '').split('T')[0] || 'N/A'}</span>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-gray-700">
                              {booking.customerContact || 'Not provided'}
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <motion.span 
                            className="font-semibold text-gray-800"
                            whileHover={{ scale: 1.05 }}
                          >
                            {currency}{(booking.price ?? 0).toLocaleString()}
                          </motion.span>
                        </td>

                        <td className="p-4 max-lg:hidden">
                          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full w-fit">
                            {paymentInfo.icon}
                            <span className="text-xs font-medium text-gray-700">{paymentInfo.label}</span>
                          </div>
                        </td>

                        <td className="p-4">
                          {booking.status === 'Pending' ? (
                            <motion.select 
                              onChange={(e) => {
                                e.stopPropagation()
                                changeBookingStatus(booking._id, e.target.value)
                              }}
                              onClick={(e) => e.stopPropagation()}
                              value={booking.status}
                              className="px-3 py-2 text-gray-700 bg-white border border-borderColor rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-medium text-sm"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Cancelled">Cancel</option>
                              <option value="Confirmed">Confirm</option>
                            </motion.select>
                          ) : (
                            <motion.span
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold ${
                                booking.status === 'Confirmed'
                                  ? 'bg-green-100 text-green-700 border border-green-200'
                                  : booking.status === 'Cancelled'
                                  ? 'bg-red-100 text-red-700 border border-red-200'
                                  : booking.status === 'Completed'
                                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                  : 'bg-gray-100 text-gray-700 border border-gray-200'
                              }`}
                            >
                              {booking.status}
                            </motion.span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {selectedBooking && !showCancelModal && (
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

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                    selectedBooking.status === 'Confirmed' 
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : selectedBooking.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      : selectedBooking.status === 'Cancelled'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : selectedBooking.status === 'Completed'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}>
                    {selectedBooking.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    Booking ID: {selectedBooking._id}
                  </span>
                </div>

                <div className="border border-borderColor rounded-xl p-5 bg-gray-50">
                  <h3 className="text-lg font-medium mb-3">Car Information</h3>
                  <div className="flex items-start gap-4 mb-4">
                    <img 
                      src={selectedBooking.car?.image || assets.car_icon} 
                      alt={`${selectedBooking.car?.brand || ''} ${selectedBooking.car?.model || ''}`}
                      className="w-24 h-24 rounded-lg object-cover shadow-sm"
                    />
                    <div className="flex-1">
                      <p className="text-xl font-semibold text-gray-800">
                        {selectedBooking.car ? `${selectedBooking.car.brand} ${selectedBooking.car.model || ''}` : 'Unknown vehicle'}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {selectedBooking.car.year && (
                          <div>
                            <p className="text-xs text-gray-500">Year</p>
                            <p className="text-sm font-medium">{selectedBooking.car.year}</p>
                          </div>
                        )}
                        {selectedBooking.car.category && (
                          <div>
                            <p className="text-xs text-gray-500">Category</p>
                            <p className="text-sm font-medium">{selectedBooking.car.category}</p>
                          </div>
                        )}
                        {selectedBooking.car.transmission && (
                          <div>
                            <p className="text-xs text-gray-500">Transmission</p>
                            <p className="text-sm font-medium">{selectedBooking.car.transmission}</p>
                          </div>
                        )}
                        {selectedBooking.car.fuel_type && (
                          <div>
                            <p className="text-xs text-gray-500">Fuel Type</p>
                            <p className="text-sm font-medium">{selectedBooking.car.fuel_type}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

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

                <div className="border border-borderColor rounded-xl p-5 bg-gradient-to-br from-primary/5 to-primary/10">
                  <h3 className="text-lg font-medium mb-3">Payment Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Payment Method</span>
                      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-primary/20">
                        <span className="text-xl">{formatPaymentMethod(selectedBooking.paymentMethod).icon}</span>
                        <span className="font-semibold text-gray-800">
                          {formatPaymentMethod(selectedBooking.paymentMethod).label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-primary/20">
                        <span className="text-lg font-medium">Total Price</span>
                      <span className="text-2xl font-semibold text-primary">
                        {currency}{(selectedBooking.price ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedBooking.status === 'Pending' && (
                  <div className="flex gap-3 pt-4">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation()
                        changeBookingStatus(selectedBooking._id, 'Confirmed')
                        closeModal()
                      }}
                      className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Confirm Booking
                    </motion.button>
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation()
                        changeBookingStatus(selectedBooking._id, 'Cancelled')
                        closeModal()
                      }}
                      className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel Booking
                    </motion.button>
                  </div>
                )}

                {selectedBooking.status === 'Confirmed' && (
                  <div className="pt-4">
                    <motion.button
                      onClick={handleCancelConfirmed}
                      className="w-full bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel Confirmed Booking
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCancelModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6"
            >
              <div className="flex justify-center">
                <motion.div 
                  className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </motion.div>
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Cancel Confirmed Booking?
                </h2>
                <p className="text-gray-600">
                  This will cancel a confirmed booking. The customer will be notified. This action cannot be undone.
                </p>
              </div>

                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Car:</span>
                  <span className="font-semibold">{selectedBooking.car ? `${selectedBooking.car.brand} ${selectedBooking.car.model || ''}` : 'Unknown vehicle'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Customer:</span>
                  <span className="font-semibold">
                    {selectedBooking.user?.name || selectedBooking.user?.username || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Pickup:</span>
                  <span className="font-semibold">{(selectedBooking.pickupDate || '').split('T')[0] || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Return:</span>
                  <span className="font-semibold">{(selectedBooking.returnDate || '').split('T')[0] || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-gray-600 text-sm">Total:</span>
                    <span className="font-bold text-lg text-primary">
                    {currency}{(selectedBooking.price ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm text-red-800">
                  <p className="font-semibold">Important</p>
                  <p>Cancelling confirmed bookings may affect your reputation and customer satisfaction.</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Keep Booking
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmCancellation}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  Yes, Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default ManageBookings;
