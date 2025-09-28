"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface WelcomeHomeProps {
  userName: string
  isFirstTime: boolean
  onNameSubmit: (name: string) => void
  onContinue: () => void
}

export function WelcomeHome({ userName, isFirstTime, onNameSubmit, onContinue }: WelcomeHomeProps) {
  const [inputName, setInputName] = useState("")

  const playStartupSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Create a welcoming startup chime
    const oscillator1 = audioContext.createOscillator()
    const oscillator2 = audioContext.createOscillator()
    const oscillator3 = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator1.connect(gainNode)
    oscillator2.connect(gainNode)
    oscillator3.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Create a pleasant startup chord progression
    oscillator1.type = "sine"
    oscillator2.type = "sine"
    oscillator3.type = "triangle"

    // C major chord progression for welcoming sound
    oscillator1.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
    oscillator2.frequency.setValueAtTime(659.25, audioContext.currentTime) // E5
    oscillator3.frequency.setValueAtTime(783.99, audioContext.currentTime) // G5

    // Volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.06, audioContext.currentTime + 0.1)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8)

    oscillator1.start(audioContext.currentTime)
    oscillator2.start(audioContext.currentTime + 0.05)
    oscillator3.start(audioContext.currentTime + 0.1)

    oscillator1.stop(audioContext.currentTime + 0.8)
    oscillator2.stop(audioContext.currentTime + 0.8)
    oscillator3.stop(audioContext.currentTime + 0.8)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputName.trim()) {
      playStartupSound() // Added sound when submitting name
      onNameSubmit(inputName.trim())
    }
  }

  const handleContinue = () => {
    playStartupSound() // Added sound when continuing
    onContinue()
  }

  if (isFirstTime) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-3xl">🦸‍♂️</span>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
            Welcome, Future Hero!
          </CardTitle>
          <CardDescription className="text-gray-600">
            Ready to unlock your productivity superpowers? Let's start by getting to know you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="heroName" className="block text-sm font-medium text-gray-700 mb-2">
                What's your superhero name? (or just your regular name)
              </label>
              <Input
                id="heroName"
                type="text"
                placeholder="Enter your name..."
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-blue-600 hover:from-red-600 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
              disabled={!inputName.trim()}
            >
              Begin My Hero Journey
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
          <span className="text-3xl">👋</span>
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Welcome Back, {userName}!
        </CardTitle>
        <CardDescription className="text-gray-600">
          Ready to continue your productivity mission? Your superhero training awaits!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleContinue}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
        >
          Continue Mission
        </Button>
      </CardContent>
    </Card>
  )
}
