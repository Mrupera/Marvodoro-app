"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Trophy, Star, Zap } from "lucide-react"
import type { SessionType } from "@/app/page"

type TimerMode = "work" | "shortBreak" | "longBreak"

interface CongratulationsModalProps {
  isOpen: boolean
  onClose: () => void
  sessionType: SessionType
  mode: TimerMode
  userName?: string
}

export function CongratulationsModal({
  isOpen,
  onClose,
  sessionType,
  mode,
  userName = "Hero",
}: CongratulationsModalProps) {
  const [confetti, setConfetti] = useState<
    Array<{ id: number; x: number; y: number; rotation: number; delay: number }>
  >([])

  useEffect(() => {
    if (isOpen) {
      // Generate confetti particles
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        rotation: Math.random() * 360,
        delay: Math.random() * 2,
      }))
      setConfetti(particles)

      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        onClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getCharacterTheme = () => {
    switch (sessionType) {
      case "work":
        return {
          gradient: "bg-gradient-to-br from-red-600 via-red-400 to-blue-600",
          textGradient: "bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent",
          icon: "🛡️",
          character: "Captain America",
          message: "Mission Accomplished!",
          subtitle: "You've shown the discipline of a true leader",
          colors: ["#DC2626", "#EF4444", "#2563EB"],
        }
      case "school":
        return {
          gradient: "bg-gradient-to-br from-red-600 via-orange-500 to-yellow-600",
          textGradient: "bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent",
          icon: "⚡",
          character: "Iron Man",
          message: "Genius Level Achieved!",
          subtitle: "Your intellect continues to evolve",
          colors: ["#DC2626", "#F97316", "#CA8A04"],
        }
      case "relaxation":
        return {
          gradient: "bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600",
          textGradient: "bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent",
          icon: "🧘",
          character: "Hulk",
          message: "Inner Peace Found!",
          subtitle: "You've mastered the art of balance",
          colors: ["#16A34A", "#10B981", "#0D9488"],
        }
    }
  }

  const getModeMessage = () => {
    switch (mode) {
      case "work":
        return "Focus session completed"
      case "shortBreak":
        return "Short break finished"
      case "longBreak":
        return "Long break completed"
    }
  }

  const theme = getCharacterTheme()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Confetti Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-3 h-3 animate-bounce"
            style={{
              left: `${particle.x}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: "3s",
              transform: `rotate(${particle.rotation}deg)`,
            }}
          >
            <div
              className="w-full h-full rounded-sm"
              style={{
                background: theme.colors[particle.id % theme.colors.length],
                animation: `fall 3s linear ${particle.delay}s forwards`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Modal Content */}
      <div className="w-full max-w-md mx-4 space-y-4">
        <Card className={`${theme.gradient} border-2 border-white/30 shadow-2xl animate-in zoom-in-95 duration-300`}>
          <CardContent className="p-8 text-center relative">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Character Icon */}
            <div className="text-6xl mb-4 animate-bounce">{theme.icon}</div>

            {/* Congratulations Message */}
            <div className="space-y-4 mb-6">
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">Congratulations, {userName}!</h1>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white/90">{theme.message}</h2>
                <p className="text-white/80 text-sm">
                  {getModeMessage()} • {theme.character} Mode
                </p>
                <p className="text-white/70 text-xs italic">{theme.subtitle}</p>
              </div>
            </div>

            {/* Achievement Icons */}
            <div className="flex justify-center gap-4 mb-6">
              <div className="flex items-center gap-1 text-white/90">
                <Trophy className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-medium">Achievement</span>
              </div>
              <div className="flex items-center gap-1 text-white/90">
                <Star className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-medium">Unlocked</span>
              </div>
              <div className="flex items-center gap-1 text-white/90">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-medium">Power Up</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <div
            onClick={onClose}
            className="continue-mission-button px-8 py-3 font-semibold rounded-lg shadow-lg cursor-pointer transition-colors duration-200 border-2 select-none"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onClose()
              }
            }}
          >
            Continue Mission
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(720deg);
          }
        }
        
        .continue-mission-button {
          background-color: #1e293b !important;
          color: #ffffff !important;
          border-color: #475569 !important;
        }
        
        .continue-mission-button:hover {
          background-color: #0f172a !important;
          border-color: #334155 !important;
        }
        
        .continue-mission-button:focus {
          background-color: #0f172a !important;
          border-color: #334155 !important;
          outline: 2px solid #ffffff !important;
          outline-offset: 2px !important;
        }
      `}</style>
    </div>
  )
}
