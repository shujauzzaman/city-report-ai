import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { State, City } from 'country-state-city'
import {
  User, Phone, MapPin, Building2, Mail,
  Camera, CheckCircle, Save, Hash, ArrowLeft
} from 'lucide-react'

const calculateCompletion = (profile) => {
  const fields = [
    { key: 'full_name', required: true },
    { key: 'phone', required: true },
    { key: 'city', required: true },
    { key: 'province', required: true },
    { key: 'district', required: true },
    { key: 'address', required: false },
    { key: 'postal_code', required: false },
    { key: 'avatar_url', required: false },
  ]
  const filled = fields.filter(f => profile[f.key] && profile[f.key].toString().trim() !== '').length
  return Math.round((filled / fields.length) * 100)
}

export default function ProfilePage({ backPath }) {
  const navigate = useNavigate()
  const fileRef = useRef()

  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    city: '',
    province: '',
    district: '',
    address: '',
    postal_code: '',
    avatar_url: '',
  })
  const [email, setEmail] = useState('')
  const [provinceCode, setProvinceCode] = useState('')
  const [completion, setCompletion] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  const provinces = State.getStatesOfCountry('PK')
  const cities = City.getCitiesOfState('PK', provinceCode)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setEmail(user.email)

      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone, city, province, district, address, postal_code, avatar_url, profile_completion')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          city: data.city || '',
          province: data.province || '',
          district: data.district || '',
          address: data.address || '',
          postal_code: data.postal_code || '',
          avatar_url: data.avatar_url || '',
        })
        setAvatarPreview(data.avatar_url || null)
        setCompletion(data.profile_completion || 0)

        // Set province code from saved province name
        if (data.province) {
          const found = provinces.find(p => p.name === data.province)
          if (found) setProvinceCode(found.isoCode)
        }
      }

      setLoading(false)
    }

    fetchProfile()
  }, [])

  useEffect(() => {
    setCompletion(calculateCompletion(profile))
  }, [profile])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!profile.full_name.trim()) { setError('Full name is required.'); return }
    if (!profile.phone.trim()) { setError('Phone number is required.'); return }
    if (!profile.city.trim()) { setError('City is required.'); return }
    if (!profile.province.trim()) { setError('Province is required.'); return }
    if (!profile.district.trim()) { setError('District is required.'); return }

    setError('')
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()

    let avatarUrl = profile.avatar_url

    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `avatars/${user.id}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('complaint-images')
        .upload(fileName, avatarFile, { upsert: true })

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('complaint-images')
          .getPublicUrl(fileName)
        avatarUrl = publicUrl
      }
    }

    const newCompletion = calculateCompletion({ ...profile, avatar_url: avatarUrl })

    const { error: saveError } = await supabase
      .from('profiles')
      .update({
        ...profile,
        avatar_url: avatarUrl,
        profile_completion: newCompletion,
      })
      .eq('id', user.id)

    setSaving(false)

    if (saveError) {
      setError(saveError.message)
      return
    }

    setProfile(prev => ({ ...prev, avatar_url: avatarUrl }))
    setCompletion(newCompletion)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      navigate(backPath)
    }, 1500)
  }

  const completionColor = completion < 40
    ? 'bg-danger'
    : completion < 80
    ? 'bg-warning'
    : 'bg-success'

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-surface px-4 py-8">
      <div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-medium text-brand-dark">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your personal information</p>
        </div>

        {/* Profile completion */}
        <div className="bg-white border border-gray-200 rounded-md p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-brand-dark">Profile Completion</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
              completion < 40 ? 'bg-red-100 text-red-700' :
              completion < 80 ? 'bg-amber-100 text-amber-700' :
              'bg-emerald-100 text-emerald-700'
            }`}>
              {completion}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${completionColor}`}
              style={{ width: `${completion}%` }}
            />
          </div>
          {completion < 100 && (
            <p className="text-xs text-gray-400 mt-2">
              Fill in all fields to complete your profile.
            </p>
          )}
          {completion === 100 && (
            <p className="text-xs text-success mt-2 flex items-center gap-1">
              <CheckCircle size={11} />
              Profile complete!
            </p>
          )}
        </div>

        {/* Avatar */}
        <div className="bg-white border border-gray-200 rounded-md p-5 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-4">Profile Picture
            <span className="text-gray-400 font-normal"> (optional)</span>
          </p>
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-brand-light"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-brand-surface border-2 border-brand-light flex items-center justify-center">
                  <User size={28} className="text-brand" />
                </div>
              )}
              <button
                onClick={() => fileRef.current.click()}
                className="absolute bottom-0 right-0 w-6 h-6 bg-brand rounded-full flex items-center justify-center border-2 border-white"
              >
                <Camera size={10} className="text-white" />
              </button>
            </div>
            <div>
              <button
                onClick={() => fileRef.current.click()}
                className="text-sm text-brand hover:underline font-medium"
              >
                Upload photo
              </button>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG up to 5MB</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-md p-5 space-y-4">
          <p className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-3">
            Personal Information
          </p>

          {/* Email */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
              <Mail size={12} />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          {/* Full name + Phone */}
        <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
            <User size={12} />
            Full Name <span className="text-danger">*</span>
            </label>
            <input
            type="text"
            value={profile.full_name}
            onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
            placeholder="Enter your full name"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand"
            />
        </div>
        <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
            <Phone size={12} />
            Phone Number <span className="text-danger">*</span>
            </label>
            <input
            type="tel"
            value={profile.phone}
            onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
            placeholder="03XX-XXXXXXX"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand"
            />
        </div>
        </div>
          

          {/* Province */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
              <MapPin size={12} />
              Province <span className="text-danger">*</span>
            </label>
            <select
              value={provinceCode}
              onChange={e => {
                const code = e.target.value
                const name = provinces.find(p => p.isoCode === code)?.name || ''
                setProvinceCode(code)
                setProfile(p => ({ ...p, province: name, city: '' }))
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand bg-white"
            >
              <option value="">Select province...</option>
              {provinces.map(p => (
                <option key={p.isoCode} value={p.isoCode}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* City + District */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
                <Building2 size={12} />
                City <span className="text-danger">*</span>
              </label>
              <select
                value={profile.city}
                onChange={e => setProfile(p => ({ ...p, city: e.target.value }))}
                disabled={!provinceCode}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select city...</option>
                {cities.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
                <MapPin size={12} />
                District <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={profile.district}
                onChange={e => setProfile(p => ({ ...p, district: e.target.value }))}
                placeholder="e.g. Lahore District"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand"
              />
            </div>
          </div>

          {/* Address + Postal code */}
        <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
            <MapPin size={12} />
            Address
            <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <input
            type="text"
            value={profile.address}
            onChange={e => setProfile(p => ({ ...p, address: e.target.value }))}
            placeholder="Street address"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand"
            />
        </div>
        <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
            <Hash size={12} />
            Postal Code
            <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <input
            type="text"
            value={profile.postal_code}
            onChange={e => setProfile(p => ({ ...p, postal_code: e.target.value }))}
            placeholder="e.g. 54000"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand"
            />
        </div>
        </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {/* Success */}
          {success && (
            <p className="text-sm text-success bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 flex items-center gap-2">
              <CheckCircle size={14} />
              Profile saved! Redirecting...
            </p>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-brand hover:bg-brand-accent text-white text-sm font-medium px-6 py-2 rounded-md transition-colors disabled:opacity-60"
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>

        </div>
      </div>
    </div>
  )
}