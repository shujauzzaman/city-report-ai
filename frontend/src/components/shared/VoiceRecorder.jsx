import { useEffect, useRef, useState } from 'react'
import { Mic, Square, Trash2 } from 'lucide-react'

const MAX_SECONDS = 120
const MIN_SECONDS = 1

// Pick a format this browser can record (Chrome/Firefox make webm, Safari makes mp4)
const pickMimeType = () => {
  if (typeof MediaRecorder === 'undefined') return ''
  const options = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
  return options.find((t) => MediaRecorder.isTypeSupported(t)) || ''
}

const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function VoiceRecorder({ onChange }) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState('')

  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const secondsRef = useRef(0)

  const supported =
    typeof window !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined'

  const stopTimer = () => {
    clearInterval(timerRef.current)
    timerRef.current = null
  }

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  // Release the microphone if the page is left while recording
  useEffect(() => {
    return () => {
      stopTimer()
      stopStream()
    }
  }, [])

  // Free the preview audio when it is replaced or the page is left
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const startRecording = async () => {
    setError('')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = pickMimeType()
      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: 32000,
      })
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        stopTimer()
        stopStream()
        setRecording(false)

        const duration = secondsRef.current
        if (duration < MIN_SECONDS) {
          setError('That was too short. Please try again.')
          return
        }

        const type = recorder.mimeType || mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type })
        setPreviewUrl(URL.createObjectURL(blob))
        onChange({ blob, duration, mimeType: type })
      }

      recorderRef.current = recorder
      secondsRef.current = 0
      setSeconds(0)
      recorder.start()
      setRecording(true)

      timerRef.current = setInterval(() => {
        secondsRef.current += 1
        setSeconds(secondsRef.current)
        if (secondsRef.current >= MAX_SECONDS) recorder.stop()
      }, 1000)
    } catch {
      stopStream()
      setError('Could not use the microphone. Allow microphone access in your browser, or type the description instead.')
    }
  }

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
  }

  const removeRecording = () => {
    setPreviewUrl(null)
    setSeconds(0)
    onChange(null)
  }

  if (!supported) {
    return (
      <p className="text-xs text-gray-400">
        Voice recording is not supported in this browser. Please type the description.
      </p>
    )
  }

  return (
    <div>
      {!recording && !previewUrl && (
        <button
          type="button"
          onClick={startRecording}
          className="flex items-center gap-2 bg-brand-surface border border-brand-light text-brand text-sm font-medium px-4 py-2 rounded-md hover:bg-brand hover:text-white transition-colors"
        >
          <Mic size={14} />
          Record a voice message
        </button>
      )}

      {recording && (
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm text-gray-700 tabular-nums">
            {formatTime(seconds)} / {formatTime(MAX_SECONDS)}
          </span>
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-1.5 bg-danger text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            <Square size={12} />
            Stop
          </button>
        </div>
      )}

      {previewUrl && !recording && (
        <div className="flex items-center gap-2">
          <audio controls src={previewUrl} className="flex-1 h-9" />
          <button
            type="button"
            onClick={removeRecording}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-danger px-2 py-1 transition-colors"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      )}

      {error && <p className="text-xs text-danger mt-2">{error}</p>}
    </div>
  )
}