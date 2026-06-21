import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function BackButton({ to = -1, className = '' }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(to)}
      className={`absolute top-6 left-6 text-gray-500 hover:text-gray-800 transition group ${className}`}
    >
      <ArrowLeft 
        size={22} 
        className="transition-transform duration-200 group-hover:-translate-x-1"
      />
    </button>
  )
}