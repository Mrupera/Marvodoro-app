"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Zap, Atom, History, Home, Settings } from "lucide-react"
import type { SessionType } from "@/app/page"
import { useState } from "react"

interface SessionSelectorProps {
  onSessionSelect: (type: SessionType) => void
  onViewHistory: () => void
  onViewSettings: () => void
  onGoHome: () => void
  userName: string
}

export function SessionSelector({
  onSessionSelect,
  onViewHistory,
  onViewSettings,
  onGoHome,
  userName,
}: SessionSelectorProps) {
  const [jarvisMessage, setJarvisMessage] = useState<string>("")
  const [showJarvisMessage, setShowJarvisMessage] = useState<boolean>(false)

  const sessionTypes = [
    {
      type: "work" as SessionType,
      title: "Captain America",
      subtitle: "Work Focus",
      description: "Lead with discipline and unwavering focus",
      character: "Steve Rogers",
      icon: Shield,
      color:
        "bg-gradient-to-br from-red-100 via-white to-blue-100 hover:from-red-200 hover:via-white hover:to-blue-200 border-red-300 dark:from-red-900/30 dark:via-slate-800/50 dark:to-blue-900/30 dark:hover:from-red-800/40 dark:hover:via-slate-700/60 dark:hover:to-blue-800/40",
      iconColor: "text-red-600 dark:text-red-400",
      duration: "25 min work • 5 min break",
      quote: "I can do this all day",
      buttonStyle: {
        background: "linear-gradient(to right, #3b82f6, #ef4444)",
        color: "white",
      },
      buttonHoverStyle: {
        background: "linear-gradient(to right, #2563eb, #dc2626)",
        color: "white",
      },
      jarvisResponse: `Excellent choice, ${userName}. Work mode activated like Sir Rogers. Your shield of focus is ready for deployment.`,
    },
    {
      type: "school" as SessionType,
      title: "Iron Man",
      subtitle: "Study Session",
      description: "Genius-level intellect meets focused learning",
      character: "Tony Stark",
      icon: Zap,
      color:
        "bg-gradient-to-br from-red-100 via-yellow-100 to-orange-100 hover:from-red-200 hover:via-yellow-200 hover:to-orange-200 border-red-300 dark:from-red-900/30 dark:via-yellow-900/30 dark:to-orange-900/30 dark:hover:from-red-800/40 dark:hover:via-yellow-800/40 dark:hover:to-orange-800/40",
      iconColor: "text-red-600 dark:text-red-400",
      duration: "30 min study • 10 min break",
      quote: "Sometimes you gotta run before you can walk",
      buttonStyle: {
        background: "linear-gradient(to right, #eab308, #ef4444)",
        color: "white",
      },
      buttonHoverStyle: {
        background: "linear-gradient(to right, #ca8a04, #dc2626)",
        color: "white",
      },
      jarvisResponse: `Outstanding selection, ${userName}. Study mode engaged like Mr. Stark. Your arc reactor of knowledge is powering up.`,
    },
    {
      type: "relaxation" as SessionType,
      title: "Hulk",
      subtitle: "Mindful Break",
      description: "Find inner peace and emotional balance",
      character: "Bruce Banner",
      icon: Atom,
      color:
        "bg-gradient-to-br from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 border-green-300 dark:from-green-900/30 dark:to-emerald-900/30 dark:hover:from-green-800/40 dark:hover:to-emerald-800/40",
      iconColor: "text-green-600 dark:text-green-400",
      duration: "15 min focus • 5 min rest",
      quote: "That's my secret... I'm always calm",
      buttonStyle: {
        background: "linear-gradient(to right, #22c55e, #10b981)",
        color: "white",
      },
      buttonHoverStyle: {
        background: "linear-gradient(to right, #16a34a, #059669)",
        color: "white",
      },
      jarvisResponse: `Wise choice, ${userName}. Mindful mode activated like Dr. Banner. Your gamma-powered tranquility is initializing.`,
    },
  ]

  const playClickSound = () => {
    // Create a more complex computer boot-up sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Create multiple oscillators for a richer sound
    const oscillator1 = audioContext.createOscillator()
    const oscillator2 = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    // Connect the audio nodes
    oscillator1.connect(gainNode)
    oscillator2.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Configure the boot-up sound sequence
    oscillator1.type = "sine"
    oscillator2.type = "square"

    // Start with low frequency and sweep up (like a computer booting)
    oscillator1.frequency.setValueAtTime(200, audioContext.currentTime)
    oscillator1.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3)

    oscillator2.frequency.setValueAtTime(400, audioContext.currentTime)
    oscillator2.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.2)

    // Volume envelope for smooth boot sound
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.05)
    gainNode.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + 0.2)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4)

    // Start and stop the oscillators
    oscillator1.start(audioContext.currentTime)
    oscillator2.start(audioContext.currentTime + 0.1)
    oscillator1.stop(audioContext.currentTime + 0.4)
    oscillator2.stop(audioContext.currentTime + 0.3)
  }

  const playNavSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1)

    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.15)
  }

  const handleSessionSelect = (type: SessionType) => {
    playClickSound()
    const selectedSession = sessionTypes.find((s) => s.type === type)
    if (selectedSession) {
      setJarvisMessage(selectedSession.jarvisResponse)
      setShowJarvisMessage(true)

      setTimeout(() => {
        setShowJarvisMessage(false)
        onSessionSelect(type)
      }, 2500)
    }
  }

  const handleViewHistory = () => {
    playNavSound()
    onViewHistory()
  }

  const handleViewSettings = () => {
    playNavSound()
    onViewSettings()
  }

  const handleGoHome = () => {
    playNavSound()
    onGoHome()
  }

  if (showJarvisMessage) {
    return (
      <div className="w-full max-w-2xl mx-auto flex items-center justify-center min-h-[400px]">
        <Card className="bg-gradient-to-br from-blue-900/90 to-cyan-900/90 backdrop-blur-sm border-cyan-400/50 text-white">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold">J.A.R.V.I.S.</h3>
            <p className="text-lg leading-relaxed">{jarvisMessage}</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
          Welcome back, {userName}!
        </h1>
        <h2 className="text-2xl font-semibold text-muted-foreground">Assemble Your Focus</h2>
        <p className="text-muted-foreground text-lg">Choose your hero and begin your mission</p>
        <div className="flex gap-2 justify-center mt-4">
          <Button variant="outline" onClick={handleViewHistory} className="bg-transparent">
            <History className="w-4 h-4 mr-2" />
            Mission History
          </Button>
          <Button variant="outline" onClick={handleViewSettings} className="bg-transparent">
            <Settings className="w-4 h-4 mr-2" />
            Timer Settings
          </Button>
          <Button variant="outline" onClick={handleGoHome} className="bg-transparent">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
      </div>

      {/* Session Type Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {sessionTypes.map((session) => {
          const IconComponent = session.icon
          return (
            <Card
              key={session.type}
              className={`${session.color} cursor-pointer transition-all duration-200 hover:scale-105 border-2 backdrop-blur-sm`}
              onClick={() => handleSessionSelect(session.type)}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-3">
                  <IconComponent className={`w-12 h-12 ${session.iconColor}`} />
                </div>
                <CardTitle className="text-xl">{session.title}</CardTitle>
                <p className="text-sm font-medium text-muted-foreground">{session.subtitle}</p>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">{session.description}</p>
                <div className="text-xs italic text-foreground/80 bg-white/70 dark:bg-black/20 rounded-full px-3 py-1 backdrop-blur-sm">
                  "{session.quote}"
                </div>
                <div className="text-xs font-medium text-foreground bg-white/70 dark:bg-black/20 rounded-full px-3 py-1 backdrop-blur-sm">
                  {session.duration}
                </div>
                <button
                  className="w-full mt-4 px-4 py-2 rounded-md font-semibold text-white transition-all duration-200 hover:scale-105 border-0"
                  style={session.buttonStyle}
                  onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, session.buttonHoverStyle)
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.currentTarget.style, session.buttonStyle)
                  }}
                >
                  Start Mission
                </button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tips */}
      <Card className="bg-white/30 dark:bg-black/20 backdrop-blur-sm border-white/50">
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold mb-3 text-foreground">Hero Training Tips</h3>
          <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
            <div>🛡️ Channel Steve's discipline for maximum productivity</div>
            <div>⚡ Use Tony's genius approach to accelerate learning</div>
            <div>🧘 Find Bruce's inner calm for perfect balance</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
