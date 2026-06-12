import { useNavigate } from 'react-router-dom'
import {
  Camera, MapPin, ClipboardList, Bell,
  Building2, ShieldCheck, Zap, ArrowRight,
  CheckCircle
} from 'lucide-react'

const STEPS = [
  {
    icon: Camera,
    title: 'Take a Photo',
    description: 'Capture the issue with your phone or upload an existing image as evidence.',
  },
  {
    icon: MapPin,
    title: 'Submit with Location',
    description: 'Your GPS location is attached automatically so the right team can find it.',
  },
  {
    icon: ClipboardList,
    title: 'Track Until Resolved',
    description: 'Follow your complaint status in real-time from submission to resolution.',
  },
]

const FEATURES = [
  {
    icon: Camera,
    title: 'Photo Evidence',
    description: 'Attach images to complaints so issues are clear and undeniable.',
  },
  {
    icon: MapPin,
    title: 'GPS Location',
    description: 'Automatic location detection routes complaints to the right department.',
  },
  {
    icon: Bell,
    title: 'Real-Time Notifications',
    description: 'Get notified instantly when your complaint status changes.',
  },
  {
    icon: Building2,
    title: 'Department Routing',
    description: 'Complaints are automatically assigned to Infrastructure, Traffic, or Municipal.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Private',
    description: 'Your data is protected and only visible to authorized personnel.',
  },
  {
    icon: Zap,
    title: 'Fast Response',
    description: 'Priority system ensures urgent issues are handled first.',
  },
]

const STATS = [
  { value: '3', label: 'Departments Covered' },
  { value: '24/7', label: 'System Availability' },
  { value: '100%', label: 'Tracked to Resolution' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-brand-surface text-brand-dark">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand rounded-md flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-brand-dark">Smart City</span>
        </div>
        <button
          onClick={() => navigate('/authenticate')}
          className="flex items-center gap-2 bg-brand hover:bg-brand-accent text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          Get Started
          <ArrowRight size={14} />
        </button>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-white border border-gray-200 text-brand text-xs font-medium px-3 py-1.5 rounded-md mb-6">
          <Zap size={12} />
          Real-time complaint tracking
        </div>
        <h1 className="text-4xl font-bold text-brand-dark leading-tight mb-4">
          Report City Issues,<br />
          <span className="text-brand">Get Them Fixed</span>
        </h1>
        <p className="text-gray-500 text-base max-w-xl mx-auto mb-8">
          A direct line between citizens and city departments. Submit issues, track progress, and see your city improve — one complaint at a time.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/authenticate')}
            className="flex items-center gap-2 bg-brand hover:bg-brand-accent text-white text-sm font-medium px-6 py-2.5 rounded-md transition-colors"
          >
            Report an Issue
            <ArrowRight size={14} />
          </button>
          <button
            onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
            className="text-sm font-medium text-gray-500 hover:text-brand border border-gray-200 bg-white px-6 py-2.5 rounded-md transition-colors"
          >
            See How It Works
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-y border-gray-200 py-10">
        <div className="max-w-4xl mx-auto px-8 grid grid-cols-3 gap-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-bold text-brand mb-1">{value}</p>
              <p className="text-sm text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-4xl mx-auto px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-brand-dark mb-2">How It Works</h2>
          <p className="text-sm text-gray-400">Three simple steps to get your issue resolved</p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {STEPS.map(({ icon: Icon, title, description }, i) => (
            <div key={title} className="bg-white border border-gray-200 rounded-md p-6 relative">
              <div className="w-8 h-8 bg-brand-surface border border-brand-light rounded-md flex items-center justify-center mb-4">
                <Icon size={15} className="text-brand" />
              </div>
              <span className="absolute top-4 right-4 text-xs font-medium text-gray-200">
                0{i + 1}
              </span>
              <h3 className="text-sm font-semibold text-brand-dark mb-2">{title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-y border-gray-200 py-20">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-brand-dark mb-2">Everything You Need</h2>
            <p className="text-sm text-gray-400">Built for citizens, managed by professionals</p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4">
                <div className="w-8 h-8 bg-brand-surface border border-brand-light rounded-md flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-brand" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-brand-dark mb-1">{title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-4xl mx-auto px-8 py-20 text-center">
        <div className="bg-white border border-gray-200 rounded-md px-8 py-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CheckCircle size={16} className="text-brand" />
            <span className="text-xs font-medium text-brand">Free for all citizens</span>
          </div>
          <h2 className="text-2xl font-bold text-brand-dark mb-3">
            Your City Needs Your Voice
          </h2>
          <p className="text-sm text-gray-400 max-w-md mx-auto mb-8">
            Every complaint you submit helps make your city better. Join thousands of citizens already making a difference.
          </p>
          <button
            onClick={() => navigate('/authenticate')}
            className="flex items-center gap-2 bg-brand hover:bg-brand-accent text-white text-sm font-medium px-8 py-2.5 rounded-md transition-colors mx-auto"
          >
            Get Started Today
            <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-8 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand rounded-md flex items-center justify-center">
              <Building2 size={12} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-brand-dark">Smart City</span>
          </div>
          <p className="text-xs text-gray-400">
            Built for citizens. Managed by professionals.
          </p>
        </div>
      </footer>

    </div>
  )
}