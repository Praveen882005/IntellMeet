import { useEffect, useRef, useState, useCallback } from 'react'
import { useMeetingStore } from '../stores/meetingStore'

export const useWebRTC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [deviceError, setDeviceError] = useState<string | null>(null)

  const isMicOn = useMeetingStore((s) => s.isMicOn)
  const isCamOn = useMeetingStore((s) => s.isCamOn)
  const isScreenSharing = useMeetingStore((s) => s.isScreenSharing)
  const setScreenSharing = useMeetingStore((s) => s.setScreenSharing)

  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const screenVideoRef = useRef<HTMLVideoElement | null>(null)

  // Initialize Local Media Stream
  const initMedia = useCallback(async () => {
    try {
      setDeviceError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      setLocalStream(stream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    } catch (err: unknown) {
      const error = err as Error
      setDeviceError(
        error.name === 'NotAllowedError'
          ? 'Camera/microphone access was denied. Please allow permissions in browser.'
          : `Media device note: ${error.message}`
      )
    }
  }, [])

  // Toggle audio tracks
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = isMicOn
      })
    }
  }, [isMicOn, localStream])

  // Toggle video tracks
  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = isCamOn
      })
    }
  }, [isCamOn, localStream])

  // Handle Screen Sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop())
        setScreenStream(null)
      }
      setScreenSharing(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })

        setScreenStream(stream)
        setScreenSharing(true)

        stream.getVideoTracks()[0].onended = () => {
          setScreenSharing(false)
          setScreenStream(null)
        }
      } catch {
        // User cancelled picker or screen share failed
      }
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop())
      }
      if (screenStream) {
        screenStream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [localStream, screenStream])

  return {
    localStream,
    screenStream,
    localVideoRef,
    screenVideoRef,
    deviceError,
    initMedia,
    toggleScreenShare,
  }
}
