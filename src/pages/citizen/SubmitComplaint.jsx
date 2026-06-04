import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { ImagePlus, MapPin, FileText, X, Navigation, Send } from 'lucide-react'

export default function SubmitComplaint() {
  const navigate = useNavigate()

  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleImageDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
  }

  const handleGetLocation = () => {
    setLocationLoading(true)
    setLocationError('')

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.')
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setLatitude(lat)
        setLongitude(lng)

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          )
          const data = await res.json()
          setAddress(data.display_name || `${lat}, ${lng}`)
        } catch {
          setAddress(`${lat}, ${lng}`)
        }

        setLocationLoading(false)
      },
      () => {
        setLocationError('Could not get your location. Please enter it manually.')
        setLocationLoading(false)
      }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!image) { setError('Please upload an image of the issue.'); return }
    if (!address) { setError('Please provide a location.'); return }
    if (!description.trim()) { setError('Please add a description.'); return }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    const fileExt = image.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('complaint-images')
      .upload(fileName, image)

    if (uploadError) {
      setError(uploadError.message)
      setLoading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('complaint-images')
      .getPublicUrl(fileName)

    const { error: insertError } = await supabase
      .from('complaints')
      .insert({
        citizen_id: user.id,
        image_url: publicUrl,
        description: description.trim(),
        latitude,
        longitude,
        address,
        status: 'pending',
        priority: 'medium',
      })

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    navigate('/c/complaints')
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-medium text-brand-dark">Submit a Complaint</h1>
        <p className="text-sm text-gray-500 mt-1">
          Report an issue in your city with an image and location
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* US1 — Image upload */}
        <div className="bg-white border border-gray-200 rounded-md p-5">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <ImagePlus size={15} className="text-brand" />
            Issue Image <span className="text-danger">*</span>
          </label>

          {!imagePreview ? (
            <div
              onDrop={handleImageDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById('image-input').click()}
              className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center hover:border-brand transition-colors cursor-pointer"
            >
              <ImagePlus size={28} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                Drag & drop an image here, or{' '}
                <span className="text-brand font-medium">browse</span>
              </p>
              <p className="text-xs text-gray-300 mt-1">Max size 20MB</p>
              <input
                id="image-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-56 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 flex items-center gap-1 bg-white border border-gray-200 text-gray-500 hover:text-danger text-xs px-2 py-1 rounded-md"
              >
                <X size={12} />
                Remove
              </button>
            </div>
          )}
        </div>

        {/* US2 — Location */}
        <div className="bg-white border border-gray-200 rounded-md p-5">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <MapPin size={15} className="text-brand" />
            Location <span className="text-danger">*</span>
          </label>

          <button
            type="button"
            onClick={handleGetLocation}
            disabled={locationLoading}
            className="mb-3 flex items-center gap-2 bg-brand-surface border border-brand-light text-brand text-sm font-medium px-4 py-2 rounded-md hover:bg-brand hover:text-white transition-colors disabled:opacity-60"
          >
            <Navigation size={14} />
            {locationLoading ? 'Getting location...' : 'Use my current location'}
          </button>

          {locationError && (
            <p className="text-xs text-danger mb-2">{locationError}</p>
          )}

          <input
            type="text"
            placeholder="Or type your address manually"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand"
          />

          {latitude && longitude && (
            <p className="text-xs text-gray-400 mt-1">
              GPS: {latitude.toFixed(5)}, {longitude.toFixed(5)}
            </p>
          )}
        </div>

        {/* US3 — Description */}
        <div className="bg-white border border-gray-200 rounded-md p-5">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <FileText size={15} className="text-brand" />
            Description <span className="text-danger">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="Describe the issue in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={255}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand resize-none"
          />
          <p className={`text-xs mt-1 text-right ${description.length >= 255 ? 'text-danger' : 'text-gray-400'}`}>
            {description.length}/255
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-brand hover:bg-brand-accent text-white text-sm font-medium px-6 py-2 rounded-md transition-colors disabled:opacity-60"
          >
            <Send size={14} />
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/c/dashboard')}
            className="border border-gray-300 text-gray-500 text-sm font-medium px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  )
}