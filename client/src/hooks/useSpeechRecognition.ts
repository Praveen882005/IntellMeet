import { useEffect, useRef, useState, useCallback } from 'react'
import { useMeetingStore } from '../stores/meetingStore'
import { useAuthStore } from '../stores/authStore'
import { useSocket } from './useSocket'

// Extend window interface for browser SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: any
    webkitSpeechRecognition?: any
  }
}

export const useSpeechRecognition = (roomId: string) => {
  const recognitionRef = useRef<any>(null)
  const subtitleTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [isSupported, setIsSupported] = useState(true)
  const [speechError, setSpeechError] = useState<string | null>(null)
  const isTranscribing = useMeetingStore((s) => s.isTranscribing)
  const isMicOn = useMeetingStore((s) => s.isMicOn)
  const setLiveSubtitle = useMeetingStore((s) => s.setLiveSubtitle)
  const addTranscript = useMeetingStore((s) => s.addTranscript)
  const userName = useAuthStore((s) => s.user.name)
  const { socket } = useSocket()

  const clearSubtitleAfterDelay = useCallback((delayMs = 4000) => {
    if (subtitleTimerRef.current) {
      clearTimeout(subtitleTimerRef.current)
    }
    subtitleTimerRef.current = setTimeout(() => {
      setLiveSubtitle('', '')
    }, delayMs)
  }, [setLiveSubtitle])

  // Allows programmatic or fallback simulation of spoken voice for runtime verification
  const simulateSpeech = useCallback(
    (text: string, speakerName?: string) => {
      const speaker = speakerName || userName || 'Speaker'
      setLiveSubtitle(text, speaker)
      clearSubtitleAfterDelay(4500)

      const entry = {
        speaker,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      addTranscript(entry)

      if (socket && roomId) {
        socket.emit('transcript-chunk', {
          roomId,
          transcriptData: {
            speaker,
            text,
          },
        })
      }
    },
    [userName, setLiveSubtitle, clearSubtitleAfterDelay, addTranscript, socket, roomId]
  )

  const startRecognition = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setIsSupported(false)
      setSpeechError('SpeechRecognition API not available in this browser environment.')
      return
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // Ignore error
      }
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event: any) => {
        let interimText = ''
        let finalText = ''

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript
          } else {
            interimText += event.results[i][0].transcript
          }
        }

        const displayText = (interimText || finalText).trim()
        if (displayText) {
          setLiveSubtitle(displayText, userName)
          clearSubtitleAfterDelay(3500)

          // Broadcast live subtitle chunk via Socket.io
          if (socket && roomId) {
            socket.emit('transcript-chunk', {
              roomId,
              transcriptData: {
                speaker: userName,
                text: displayText,
              },
            })
          }
        }

        if (finalText.trim()) {
          const entry = {
            speaker: userName,
            text: finalText.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
          addTranscript(entry)
        }
      }

      recognition.onerror = (event: any) => {
        const err = event?.error || 'speech-recognition-error'
        if (err === 'service-not-allowed' || err === 'not-allowed') {
          console.warn('[useSpeechRecognition] Permission or service blocked by browser:', err)
          setSpeechError(err)
          setIsSupported(false)
        }
        // Silence timeouts ('no-speech') will naturally restart on 'onend'
      }

      recognition.onend = () => {
        // Auto-restart if transcription and mic remain active
        if (isTranscribing && isMicOn) {
          try {
            recognition.start()
          } catch {
            // Ignore restart collisions
          }
        }
      }

      recognition.start()
      recognitionRef.current = recognition
      setSpeechError(null)
      setIsSupported(true)
    } catch (err: any) {
      console.warn('[useSpeechRecognition] Start failed:', err?.message || err)
      setSpeechError(err?.message || 'Failed to initialize speech engine')
    }
  }, [roomId, userName, isTranscribing, isMicOn, socket, setLiveSubtitle, clearSubtitleAfterDelay, addTranscript])

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
        recognitionRef.current = null
      } catch {
        // Ignore
      }
    }
    if (subtitleTimerRef.current) {
      clearTimeout(subtitleTimerRef.current)
    }
    setLiveSubtitle('', '')
  }, [setLiveSubtitle])

  useEffect(() => {
    if (isTranscribing && isMicOn && roomId) {
      startRecognition()
    } else {
      stopRecognition()
    }

    return () => {
      stopRecognition()
    }
  }, [isTranscribing, isMicOn, roomId, startRecognition, stopRecognition])

  return { isSupported, speechError, simulateSpeech }
}
