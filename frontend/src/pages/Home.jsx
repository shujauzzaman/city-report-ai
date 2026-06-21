import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import {
  Camera, MapPin, ClipboardList, Bell,
  ShieldCheck, Zap, ArrowRight,
  CheckCircle, Phone, Mail, ChevronRight,
  Wrench, Trash2, Car, FileText, Users, Clock, Building2
} from 'lucide-react'

const STATS = [
  { value: '3', label: 'Departments', sub: 'Infrastructure · Municipal · Traffic' },
  { value: '24/7', label: 'Availability', sub: 'Round-the-clock monitoring' },
  { value: '100%', label: 'Tracked', sub: 'Every complaint followed up' },
  { value: 'AI', label: 'Powered', sub: 'Automated issue detection' },
]

const STEPS = [
  {
    icon: Camera,
    step: '01',
    title: 'Capture the Issue',
    description: 'Take a photo or upload an existing image as visual evidence of the problem.',
  },
  {
    icon: MapPin,
    step: '02',
    title: 'Add Your Location',
    description: 'GPS coordinates attached automatically or enter address manually.',
  },
  {
    icon: Building2,
    step: '03',
    title: 'Auto Department Routing',
    description: 'AI detects the issue type and routes it to the correct city department.',
  },
  {
    icon: CheckCircle,
    step: '04',
    title: 'Track to Resolution',
    description: 'Follow your complaint status in real-time until it is fully resolved.',
  },
]

const FEATURES = [
  {
    icon: Camera,
    color: 'bg-blue-50 text-blue-600',
    title: 'Photo Evidence',
    description: 'Attach images so issues are clear and verifiable by departments.',
  },
  {
    icon: Zap,
    color: 'bg-amber-50 text-amber-600',
    title: 'AI-Powered Detection',
    description: 'YOLOv11 model automatically identifies issue type from uploaded images.',
  },
  {
    icon: Bell,
    color: 'bg-purple-50 text-purple-600',
    title: 'Real-Time Notifications',
    description: 'Instant updates when your complaint status changes or gets assigned.',
  },
  {
    icon: ShieldCheck,
    color: 'bg-green-50 text-green-600',
    title: 'Secure & Private',
    description: 'End-to-end security. Your data is protected and encrypted at all times.',
  },
  {
    icon: Users,
    color: 'bg-rose-50 text-rose-600',
    title: 'Multi-Role System',
    description: 'Citizen, Officer, Worker and Admin roles with controlled access levels.',
  },
  {
    icon: FileText,
    color: 'bg-teal-50 text-teal-600',
    title: 'Resolution Proof',
    description: 'Workers upload before/after images to confirm every complaint is resolved.',
  },
]

const DEPARTMENTS = [
  {
    icon: Wrench,
    name: 'Infrastructure',
    description: 'Roads, potholes, bridges, street lights and structural damage.',
    issues: ['Potholes', 'Road Damage', 'Open Manholes', 'Street Lights'],
    color: 'bg-blue-50 border-blue-100',
    iconColor: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Trash2,
    name: 'Municipal',
    description: 'Garbage collection, sanitation, drainage and public cleanliness.',
    issues: ['Garbage', 'Drainage Issues', 'Sanitation', 'Public Spaces'],
    color: 'bg-green-50 border-green-100',
    iconColor: 'bg-green-100 text-green-600',
  },
  {
    icon: Car,
    name: 'Traffic',
    description: 'Traffic signals, road accidents and road safety violations.',
    issues: ['Traffic Signals', 'Road Accidents', 'Illegal Parking', 'Road Safety'],
    color: 'bg-amber-50 border-amber-100',
    iconColor: 'bg-amber-100 text-amber-600',
  },
]

// Animated counter hook
function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!started) return
    if (isNaN(target)) { setCount(target); return }

    let start = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [started, target])

  return { count, setStarted }
}

export default function Home() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const statsRef = useRef()
  const [statsVisible, setStatsVisible] = useState(false)

  // Navbar shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Trigger stats animation when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-brand-surface text-brand-dark">

      {/* Top bar */}
      <div className="bg-brand-dark py-2 px-8 hidden md:block">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xs text-brand-light flex items-center gap-1.5">
            <Phone size={11} />
            Helpline: +92-3009874137
          </span>
          <span className="text-xs text-brand-light flex items-center gap-1.5">
            <Mail size={11} />
            kfasi5032@gmail.com
          </span>
        </div>
      </div>

      {/* Navbar */}
      <nav className={`bg-white px-8 py-4 sticky top-0 z-50 transition-shadow duration-300 ${
        scrolled ? 'shadow-md border-b border-gray-100' : 'border-b border-gray-200'
      }`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Smart City Logo" className="h-16 w-auto" />
            <div>
              <p className="text-sm font-bold text-brand-dark leading-tight">Smart City</p>
              <p className="text-xs text-gray-400 leading-tight">Reporting System</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
              className="text-sm text-gray-500 hover:text-brand transition-colors hidden md:block"
            >
              How It Works
            </button>
            <button
              onClick={() => document.getElementById('departments').scrollIntoView({ behavior: 'smooth' })}
              className="text-sm text-gray-500 hover:text-brand transition-colors hidden md:block"
            >
              Departments
            </button>
            <button
              onClick={() => navigate('/authenticate')}
              className="flex items-center gap-2 bg-brand hover:bg-brand-accent text-white text-sm font-medium px-4 py-2 rounded-md transition-all duration-200 hover:shadow-md active:scale-95"
            >
              Get Started
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-brand-dark relative overflow-hidden min-h-130">

        {/* Hero image — full background */}
        <div className="absolute inset-0">
          <img
            src="/images/pak-city.jpg"
            alt="City"
            className="w-full h-full object-cover"
          />
          {/* Gradient over image */}
          <div className="absolute inset-0 bg-linear-to-r from-brand-dark via-brand-dark/60 to-brand-dark/20" />
        </div>

        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07] z-10"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="max-w-6xl mx-auto px-8 py-24 relative z-20">
          <div className="max-w-2xl">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-brand-light text-xs font-medium px-3 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              System Online · AI-Powered Detection Active
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              Report City Issues.
              <span className="block text-brand-light mt-1">
                Get Them Fixed.
              </span>
            </h1>

            <p className="text-brand-light/80 text-base max-w-lg mb-8 leading-relaxed">
              A direct line between citizens and city departments. Submit issues with photo evidence, track progress in real-time, and see your city improve.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => navigate('/authenticate')}
                className="flex items-center gap-2 bg-white text-brand hover:bg-brand-surface font-semibold text-sm px-6 py-3 rounded-md transition-all duration-200 hover:shadow-lg active:scale-95"
              >
                Report an Issue
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 text-sm font-medium text-brand-light hover:text-white border border-white/20 px-6 py-3 rounded-md transition-all duration-200 hover:border-white/40 hover:bg-white/5"
              >
                See How It Works
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section ref={statsRef} className="bg-brand border-b border-brand-accent">
        <div className="max-w-6xl mx-auto px-8 py-8 grid grid-cols-2 md:grid-cols-4">
          {[
            { value: '3', label: 'Departments', sub: 'Infrastructure · Municipal · Traffic', icon: Building2 },
            { value: '24/7', label: 'Availability', sub: 'Round-the-clock monitoring', icon: Clock },
            { value: '100%', label: 'Tracked', sub: 'Every complaint followed up', icon: CheckCircle },
            { value: 'AI', label: 'Powered', sub: 'Automated issue detection', icon: Zap },
          ].map(({ value, label, sub, icon: Icon }, i, arr) => (
            <div
              key={label}
              className={`flex items-center gap-4 px-8 py-2 ${
                i !== arr.length - 1 ? 'border-r border-white/20' : ''
              }`}
            >
              {/* Icon */}
              <div className="w-10 h-10 bg-white/10 rounded-md flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-white" />
              </div>

              {/* Text */}
              <div>
                <p className="text-2xl font-bold text-white leading-tight">{value}</p>
                <p className="text-xs font-medium text-brand-light">{label}</p>
                <p className="text-xs text-white/40 hidden md:block">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Departments */}
      <section id="departments" className="max-w-6xl mx-auto px-8 py-20">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 bg-brand rounded-full" />
            <p className="text-xs font-semibold text-brand uppercase tracking-widest">Departments</p>
          </div>
          <h2 className="text-2xl font-bold text-brand-dark">City Departments We Cover</h2>
          <p className="text-sm text-gray-400 mt-1">Your complaint reaches the right team automatically</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEPARTMENTS.map(({ icon: Icon, name, description, issues, color, iconColor }) => (
            <div
              key={name}
              className={`card-hover p-6 ${color}`}
            >
              <div className={`w-10 h-10 rounded-md flex items-center justify-center mb-4 ${iconColor}`}>
                <Icon size={18} />
              </div>
              <h3 className="text-sm font-semibold text-brand-dark mb-2">{name} Department</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">{description}</p>
              <div className="space-y-1.5">
                {issues.map(issue => (
                  <div key={issue} className="flex items-center gap-2">
                    <CheckCircle size={11} className="text-success flex-shrink-0" />
                    <span className="text-xs text-gray-500">{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white border-y border-gray-200 py-20">
        <div className="max-w-6xl mx-auto px-8">
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-5 bg-brand rounded-full" />
              <p className="text-xs font-semibold text-brand uppercase tracking-widest">Process</p>
            </div>
            <h2 className="text-2xl font-bold text-brand-dark">How It Works</h2>
            <p className="text-sm text-gray-400 mt-1">Four simple steps from complaint to resolution</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {STEPS.map(({ icon: Icon, step, title, description }) => (
              <div key={title} className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-brand rounded-md flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Icon size={16} className="text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-200">{step}</span>
                </div>
                <h3 className="text-sm font-bold text-brand-dark mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-8 py-20">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 bg-brand rounded-full" />
            <p className="text-xs font-semibold text-brand uppercase tracking-widest">Features</p>
          </div>
          <h2 className="text-2xl font-bold text-brand-dark">System Capabilities</h2>
          <p className="text-sm text-gray-400 mt-1">Built for citizens, managed by professionals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, color, title, description }) => (
            <div
              key={title}
              className="card-hover p-5 group"
            >
              <div className={`w-9 h-9 rounded-md flex items-center justify-center mb-3 ${color}`}>
                <Icon size={16} />
              </div>
              <h3 className="text-sm font-semibold text-brand-dark mb-1.5 group-hover:text-brand transition-colors">
                {title}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-dark py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="max-w-6xl mx-auto px-8 text-center relative">
          <img src="/logo.png" alt="Smart City Logo" className="h-16 w-auto mx-auto mb-6 brightness-0 invert" />
          <h2 className="text-2xl font-bold text-white mb-3">
            Your City Needs Your Voice
          </h2>
          <p className="text-sm text-brand-light/80 max-w-md mx-auto mb-8 leading-relaxed">
            Every complaint you submit helps make your city better. Join thousands of citizens already making a difference.
          </p>
          <button
            onClick={() => navigate('/authenticate')}
            className="inline-flex items-center gap-2 bg-white text-brand hover:bg-brand-surface font-semibold text-sm px-8 py-3 rounded-md transition-all duration-200 hover:shadow-lg active:scale-95"
          >
            Get Started Today
            <ArrowRight size={14} />
          </button>
          <p className="text-xs text-white/30 mt-4">
            Free for all citizens · Secure & Private · Available 24/7
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <img src="/logo.png" alt="Smart City Logo" className="h-8 w-auto" />
                <span className="text-sm font-bold text-brand-dark">Smart City Reporting</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
                A government initiative to modernize civic complaint management and improve urban service delivery for all citizens.
              </p>
              <div className="flex items-center gap-4 mt-4">
                <span className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Phone size={11} />
                  +92-3009874137
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Mail size={11} />
                  kfasi5032@gmail.com
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-brand-dark uppercase tracking-wide mb-3">Departments</p>
              <div className="space-y-2">
                {['Infrastructure', 'Municipal', 'Traffic'].map(dept => (
                  <p key={dept} className="text-xs text-gray-400 flex items-center gap-1.5">
                    <ChevronRight size={11} className="text-brand" />
                    {dept}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-brand-dark uppercase tracking-wide mb-3">Quick Links</p>
              <div className="space-y-2">
                {[
                  { label: 'Report an Issue', action: () => navigate('/authenticate') },
                  { label: 'How It Works', action: () => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' }) },
                  { label: 'Departments', action: () => document.getElementById('departments').scrollIntoView({ behavior: 'smooth' }) },
                ].map(({ label, action }) => (
                  <p
                    key={label}
                    onClick={action}
                    className="text-xs text-gray-400 flex items-center gap-1.5 cursor-pointer hover:text-brand transition-colors"
                  >
                    <ChevronRight size={11} className="text-brand" />
                    {label}
                  </p>
                ))}
              </div>
            </div>

          </div>

          <div className="border-t border-gray-100 pt-6 flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs text-gray-400">
              © 2026 Smart City Reporting System. All rights reserved.
            </p>
            <p className="text-xs text-gray-400">
              Built for citizens. Managed by professionals.
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}