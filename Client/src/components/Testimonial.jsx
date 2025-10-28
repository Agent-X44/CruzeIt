import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

// Star Icon Component
const StarIcon = ({ filled, className }) => (
  <svg 
    className={className}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
    />
  </svg>
)

// Filter Icon Component
const FilterIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
)

const Testimonial = () => {
  const { axios, user, setShowLogin } = useAppContext()
  const [testimonials, setTestimonials] = useState([])
  const [filteredTestimonials, setFilteredTestimonials] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportId, setReportId] = useState(null)
  const [formData, setFormData] = useState({
    rating: 0,
    testimonial: ''
  })
  const [hoveredRating, setHoveredRating] = useState(0)

  // Enhanced bad words list for filtering
  const badWords = [
    'gago', 'putang', 'tangina', 'tanginamo', 'bobo', 'tanga', 'puta', 'punyeta',
    'shit', 'fuck', 'bullshit', 'ass', 'damn', 'hell', 'stupid', 'idiot', 
    'bitch', 'bastard', 'crap', 'suck', 'awful', 'terrible', 'worst', 'horrible', 
    'ulol', 'tarantado', 'leche', 'yawa', 'animal', 'hayop', 'peste', 'kupal',
    'kingina', 'pokpok', 'tamod', 'kantot', 'hindot', 'tite', 'bilat', 'puke',
    'inutil', 'walangya', 'putragis', 'pucha', 'buwisit', 'walanghiya'
  ]

  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .replace(/[0-9]/g, '')
      .replace(/[@#$%^&*()_+=\[\]{};':"\\|,.<>?]/g, '')
      .replace(/\s+/g, '')
  }

  const containsBadWords = (text) => {
    const normalizedText = normalizeText(text)
    
    return badWords.some(word => {
      const normalizedWord = normalizeText(word)
      
      if (normalizedText.includes(normalizedWord)) {
        return true
      }
      
      const leetVariations = text
        .toLowerCase()
        .replace(/[0]/g, 'o')
        .replace(/[1]/g, 'i')
        .replace(/[3]/g, 'e')
        .replace(/[4]/g, 'a')
        .replace(/[5]/g, 's')
        .replace(/[7]/g, 't')
        .replace(/[8]/g, 'b')
        .replace(/[@]/g, 'a')
        .replace(/[$]/g, 's')
      
      const normalizedLeet = normalizeText(leetVariations)
      return normalizedLeet.includes(normalizedWord)
    })
  }

  const censorBadWords = (text) => {
    let censoredText = text
    const normalizedInput = normalizeText(text)
    
    badWords.forEach(word => {
      const normalizedWord = normalizeText(word)
      const chars = word.split('')
      const pattern = chars.join('[0-9@#$%^&*()_+=\\[\\]{};\':"\\\\|,.<>?]*')
      const regex = new RegExp(pattern, 'gi')
      
      censoredText = censoredText.replace(regex, (match) => '*'.repeat(match.length))
    })
    
    return censoredText
  }

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/testimonials/latest')
      if (data.success) {
        const censoredTestimonials = data.testimonials.map(testimonial => ({
          ...testimonial,
          testimonial: censorBadWords(testimonial.testimonial),
          name: censorBadWords(testimonial.name)
        }))
        setTestimonials(censoredTestimonials)
        setFilteredTestimonials(censoredTestimonials)
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredTestimonials(testimonials)
    } else {
      const rating = parseInt(selectedFilter)
      setFilteredTestimonials(testimonials.filter(t => t.rating === rating))
    }
  }, [selectedFilter, testimonials])

  const handleWriteReviewClick = () => {
    if (!user) {
      toast.error('Please log in or create an account to write a review', {
        duration: 4000,
        icon: '',
        style: {
          borderRadius: '12px',
          background: '#344E41',
          color: '#fff',
          padding: '16px',
        },
      })
      return
    }
    setShowForm(!showForm)
    setEditingId(null)
    setFormData({ rating: 0, testimonial: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please log in to submit a review')
      return
    }

    if (formData.rating > 0 && formData.testimonial) {
      if (containsBadWords(formData.testimonial)) {
        toast.error('Please avoid using inappropriate language in your review.')
        return
      }

      try {
        if (editingId) {
          const { data } = await axios.put(`/api/testimonials/update/${editingId}`, {
            rating: formData.rating,
            testimonial: formData.testimonial
          })
          
          if (data.success) {
            toast.success('Review updated successfully!')
            setEditingId(null)
          } else {
            toast.error(data.message || 'Failed to update review')
          }
        } else {
          const { data } = await axios.post('/api/testimonials/create', {
            name: user.name,
            rating: formData.rating,
            testimonial: formData.testimonial
          })
          
          if (data.success) {
            toast.success('Thank you for your review!')
          } else {
            toast.error(data.message || 'Failed to submit review')
          }
        }
        
        setFormData({ rating: 0, testimonial: '' })
        setShowForm(false)
        fetchTestimonials()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error submitting review')
      }
    }
  }

  const handleEdit = (testimonial) => {
    setEditingId(testimonial._id)
    setFormData({
      rating: testimonial.rating,
      testimonial: testimonial.testimonial
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteClick = (id) => {
    setDeleteId(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      const { data } = await axios.delete(`/api/testimonials/delete/${deleteId}`)
      
      if (data.success) {
        toast.success('Review deleted successfully!')
        fetchTestimonials()
      } else {
        toast.error(data.message || 'Failed to delete review')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting review')
    } finally {
      setShowDeleteModal(false)
      setDeleteId(null)
    }
  }

  const handleReportClick = (id) => {
    if (!user) {
      toast.error('Please log in to report a review')
      return
    }
    setReportId(id)
    setShowReportModal(true)
  }

  const confirmReport = async () => {
    try {
      const { data } = await axios.post(`/api/testimonials/report/${reportId}`)
      
      if (data.success) {
        if (data.deleted) {
          toast.success('Review has been removed due to multiple reports')
          fetchTestimonials()
        } else {
          toast.success('Review reported successfully. Thank you for your feedback.')
        }
      } else {
        toast.error(data.message || 'Failed to report review')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error reporting review')
    } finally {
      setShowReportModal(false)
      setReportId(null)
    }
  }

  const handleRatingClick = (rating) => {
    setFormData({ ...formData, rating })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? 's' : ''} ago`
  }

  return (
    <div className="py-28 px-6 md:px-16 lg:px-24 xl:px-44">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">What our Customers Say</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Discover why discerning travelers choose CruzIt for their Car accommodation around the world.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex flex-wrap justify-center gap-4 mb-12"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleWriteReviewClick}
          className="bg-primary text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:bg-primary-dull transition-colors flex items-center gap-2"
        >
          <StarIcon filled={true} className="w-5 h-5" />
          {showForm ? 'Cancel' : editingId ? 'Cancel Edit' : 'Write a Review'}
        </motion.button>

        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="bg-white border-2 border-primary text-primary px-8 py-3 rounded-lg font-medium shadow-lg hover:bg-primary hover:text-white transition-colors flex items-center gap-2"
          >
            <FilterIcon className="w-5 h-5" />
            Filter by Rating
          </motion.button>

          <AnimatePresence>
            {showFilterMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-10 min-w-[200px]"
              >
                <button
                  onClick={() => {
                    setSelectedFilter('all')
                    setShowFilterMenu(false)
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                    selectedFilter === 'all' ? 'bg-primary text-white hover:bg-primary-dull' : 'text-gray-700'
                  }`}
                >
                  All Reviews
                </button>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => {
                      setSelectedFilter(rating.toString())
                      setShowFilterMenu(false)
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                      selectedFilter === rating.toString() ? 'bg-primary text-white hover:bg-primary-dull' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {Array(rating).fill(0).map((_, i) => (
                        <StarIcon key={i} filled={true} className="w-4 h-4 text-yellow-400" />
                      ))}
                    </div>
                    <span>{rating} Star{rating !== 1 ? 's' : ''}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {selectedFilter !== 'all' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-6"
        >
          <div className="bg-primary/10 text-primary px-6 py-2 rounded-full flex items-center gap-2">
            <span className="font-medium">Showing {selectedFilter} Star Reviews</span>
            <button
              onClick={() => setSelectedFilter('all')}
              className="ml-2 hover:bg-primary hover:text-white rounded-full p-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}

      {!user && showForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 mb-6 bg-primary/10 rounded-full flex items-center justify-center mx-auto"
            >
              <svg 
                className="w-10 h-10 text-primary" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-semibold text-gray-800 mb-2"
            >
              Authentication Required
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 mb-8 max-w-md mx-auto"
            >
              Please log in or create an account to write a review and share your experience with others.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowForm(false)
                  setShowLogin(true)
                }}
                className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dull transition-all shadow-md flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Log In
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(false)}
                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                Cancel
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showForm && user && (
          <motion.form
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 48 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit}
            className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-xl overflow-hidden"
          >
            <h3 className="text-2xl font-bold mb-6">
              {editingId ? 'Edit Your Review' : 'Share Your Experience'}
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Your Name
                </label>
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                  {user?.name || 'User'}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Reviews are posted with your account name
                </p>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Rating *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRatingClick(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none"
                    >
                      <StarIcon
                        filled={star <= (hoveredRating || formData.rating)}
                        className={`w-8 h-8 transition-all ${
                          star <= (hoveredRating || formData.rating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Your Review *
                </label>
                <textarea
                  value={formData.testimonial}
                  onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Share your experience with us..."
                  rows="4"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Please keep your review respectful and appropriate.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-lg font-medium shadow-lg hover:bg-primary-dull transition-colors"
              >
                {editingId ? 'Update Review' : 'Submit Review'}
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredTestimonials.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-8 px-4">
          {filteredTestimonials.map((testimonial) => (
            <motion.div 
              key={testimonial._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              className="bg-white p-6 rounded-xl shadow-lg cursor-pointer relative w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-sm"
            >
              {/* Action buttons - Only show for logged in users */}
              {user && (
                <div className="absolute top-4 right-4 flex gap-2">
                  {String(user._id) === String(testimonial.userId) && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(testimonial)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Edit review"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteClick(testimonial._id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Delete review"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </motion.button>
                    </>
                  )}
                  {String(user._id) !== String(testimonial.userId) && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleReportClick(testimonial._id)}
                      className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"
                      title="Report review"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                      </svg>
                    </motion.button>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 mt-8">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dull flex items-center justify-center text-white font-bold text-xl"
                >
                  {testimonial.name.charAt(0).toUpperCase()}
                </motion.div>
                <div>
                  <p className="text-lg font-semibold">{testimonial.name}</p>
                  <p className="text-gray-400 text-sm">{formatDate(testimonial.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 mt-4">
                {Array(testimonial.rating).fill(0).map((_, starIndex) => (
                  <StarIcon key={starIndex} filled={true} className="w-5 h-5 text-yellow-400" />
                ))}
              </div>

              <p className="text-gray-600 mt-4 leading-relaxed">
                "{testimonial.testimonial}"
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">
            {selectedFilter === 'all' 
              ? 'No reviews yet. Be the first to share your experience!' 
              : `No ${selectedFilter} star reviews found. Try a different filter.`
            }
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Delete Review?</h3>
                <p className="text-gray-500 mb-6">
                  Are you sure you want to delete this review? This action cannot be undone.
                </p>
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={confirmDelete}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Confirmation Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Report Review?</h3>
                <p className="text-gray-500 mb-6">
                  Are you sure you want to report this review? It will be reviewed by our team for inappropriate content.
                </p>
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={confirmReport}
                    className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-xl font-semibold hover:bg-yellow-700 transition-colors"
                  >
                    Report
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Testimonial
