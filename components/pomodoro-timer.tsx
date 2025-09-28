"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { SessionType, SessionRecord } from "@/app/page"

type TimerMode = "work" | "shortBreak" | "longBreak"

interface TimerSettings {
  work: number
  shortBreak: number
  longBreak: number
}

interface PomodoroTimerProps {
  sessionType: SessionType
  onBackToHome: () => void
}

export function PomodoroTimer({ sessionType, onBackToHome }: PomodoroTimerProps) {
  const youtubeEmbedIds = {
    rain: "eTeD8DAta4c",
    ocean: "bn9F19Hi1Lk",
    forest: "xNN7iTA57jM",
    birds: "rYoZgpAEkFs",
  }

  const getSessionSettings = (): TimerSettings => {
    const savedSettings = localStorage.getItem("pomodoro-settings")
    if (savedSettings) {
      const allSettings = JSON.parse(savedSettings)
      return allSettings[sessionType] || getDefaultSettings()
    }
    return getDefaultSettings()
  }

  const getDefaultSettings = (): TimerSettings => {
    switch (sessionType) {
      case "work":
        return { work: 25, shortBreak: 5, longBreak: 15 }
      case "school":
        return { work: 30, shortBreak: 10, longBreak: 20 }
      case "relaxation":
        return { work: 15, shortBreak: 5, longBreak: 10 }
      default:
        return { work: 25, shortBreak: 5, longBreak: 15 }
    }
  }

  const [settings, setSettings] = useState<TimerSettings>(getSessionSettings())
  const [timeLeft, setTimeLeft] = useState(settings.work * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<TimerMode>("work")
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [showCongratulations, setShowCongratulations] = useState(false)
  const [completedMode, setCompletedMode] = useState<TimerMode>("work")
  const [isBreathingActive, setIsBreathingActive] = useState(false)
  const [isMeditationActive, setIsMeditationActive] = useState(false)
  const [isNatureSoundsActive, setIsNatureSoundsActive] = useState(false)
  const [breathingStep, setBreathingStep] = useState("")
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("rest")
  const [breathingProgress, setBreathingProgress] = useState(0)
  const [meditationStep, setMeditationStep] = useState("")
  const [currentNatureSound, setCurrentNatureSound] = useState("rain")

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const tipIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const handleStorageChange = () => {
      const newSettings = getSessionSettings()
      setSettings(newSettings)
      if (!isRunning) {
        setTimeLeft(newSettings[mode] * 60)
      }
    }

    const handleSettingsChange = (event: CustomEvent) => {
      console.log("[v0] Settings change event received:", event.detail)
      const newSettings = event.detail[sessionType] || getDefaultSettings()
      console.log("[v0] Applying new settings:", newSettings)
      setSettings(newSettings)

      if (!isRunning) {
        const newTime = newSettings[mode] * 60
        setTimeLeft(newTime)
        toast({
          title: "Settings Applied! ✅",
          description: `Timer updated to ${newSettings[mode]} minutes for ${mode} mode.`,
        })
      } else {
        toast({
          title: "Settings Saved! ⚙️",
          description: "Changes will apply when you start your next session.",
        })
      }
    }

    const settingsChangeHandler = handleSettingsChange as EventListener
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("pomodoroSettingsChanged", settingsChangeHandler)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("pomodoroSettingsChanged", settingsChangeHandler)
    }
  }, [sessionType, mode, isRunning])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgress = () => {
    const totalTime = settings[mode] * 60
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  const startTimer = () => {
    playClickSound()
    setIsRunning(true)
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimerComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const pauseTimer = () => {
    playClickSound()
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const resetTimer = () => {
    playClickSound()
    pauseTimer()
    setTimeLeft(settings[mode] * 60)
  }

  const saveSessionToHistory = (mode: TimerMode, duration: number, interrupted = false) => {
    const session: SessionRecord = {
      id: Date.now().toString(),
      type: sessionType,
      mode,
      duration,
      completedAt: new Date(),
      interrupted,
    }

    const existingSessions = localStorage.getItem("pomodoro-sessions")
    const sessions = existingSessions ? JSON.parse(existingSessions) : []
    sessions.unshift(session)

    if (sessions.length > 100) {
      sessions.splice(100)
    }

    localStorage.setItem("pomodoro-sessions", JSON.stringify(sessions))
  }

  const createConfetti = () => {
    const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"]
    const confettiCount = 50

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement("div")
      confetti.style.position = "fixed"
      confetti.style.left = Math.random() * 100 + "vw"
      confetti.style.top = "-10px"
      confetti.style.width = "10px"
      confetti.style.height = "10px"
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.pointerEvents = "none"
      confetti.style.zIndex = "9999"
      confetti.style.borderRadius = "50%"

      document.body.appendChild(confetti)

      const animation = confetti.animate(
        [
          { transform: "translateY(-10px) rotate(0deg)", opacity: 1 },
          { transform: `translateY(100vh) translateX(${(Math.random() - 0.5) * 100}px) rotate(720deg)`, opacity: 0 },
        ],
        {
          duration: 3000 + Math.random() * 2000,
          easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        },
      )

      animation.onfinish = () => {
        document.body.removeChild(confetti)
      }
    }
  }

  const checkStreakMilestones = () => {
    const savedSessions = localStorage.getItem("pomodoro-sessions")
    if (!savedSessions) return null

    const sessions = JSON.parse(savedSessions).map((session: any) => ({
      ...session,
      completedAt: new Date(session.completedAt),
    }))

    const dates = [...new Set(sessions.map((s: any) => s.completedAt.toDateString()))].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime(),
    )

    let streak = 0
    for (let i = 0; i < dates.length; i++) {
      const currentDate = new Date(dates[i])
      const expectedDate = new Date()
      expectedDate.setDate(expectedDate.getDate() - i)

      if (currentDate.toDateString() === expectedDate.toDateString()) {
        streak++
      } else {
        break
      }
    }

    // Check for milestone achievements
    if (streak === 7) return { type: "week", streak }
    if (streak === 30) return { type: "month", streak }
    if (streak % 100 === 0 && streak > 0) return { type: "century", streak }

    return null
  }

  const CongratulationsModal = ({
    mode,
    sessionType,
    onClose,
  }: {
    mode: TimerMode
    sessionType: SessionType
    onClose: () => void
  }) => {
    useEffect(() => {
      createConfetti()
    }, [])

    const getModalContent = () => {
      const messages = {
        work: {
          work: "🛡️ Mission Accomplished! Captain America is proud of your dedication!",
          shortBreak: "🛡️ Strategic Rest Complete! Ready for the next mission!",
          longBreak: "🛡️ Full Recovery Achieved! You're recharged and ready!",
        },
        school: {
          work: "⚡ Genius Level Achieved! Tony Stark approves of your innovation!",
          shortBreak: "⚡ Quick Recharge Complete! Back to inventing!",
          longBreak: "⚡ Full System Upgrade! Your mind is now optimized!",
        },
        relaxation: {
          work: "🧘 Inner Peace Achieved! Bruce Banner is impressed by your calm!",
          shortBreak: "🧘 Mindful Moment Complete! Serenity restored!",
          longBreak: "🧘 Deep Meditation Finished! You've found perfect balance!",
        },
      }

      return messages[sessionType][mode]
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-sm bg-white dark:bg-gray-800 animate-bounce">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-4 animate-pulse">🎉</div>
            <h2 className="text-xl font-bold mb-4">Congratulations!</h2>
            <p className="text-sm text-muted-foreground mb-6">{getModalContent()}</p>
            <Button onClick={onClose} className="w-full">
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleTimerComplete = () => {
    pauseTimer()
    const sessionDuration = settings[mode]
    saveSessionToHistory(mode, sessionDuration)

    if (mode === "work") {
      setCompletedPomodoros((prev) => prev + 1)
    }

    setCompletedMode(mode)
    setShowCongratulations(true)

    setTimeout(() => {
      createConfetti()
      playVictorySound()
    }, 500)

    const milestone = checkStreakMilestones()
    if (milestone) {
      setTimeout(() => {
        toast({
          title: `🎉 ${milestone.type === "week" ? "Week" : milestone.type === "month" ? "Month" : "Century"} Streak Achieved!`,
          description: `Amazing! You've maintained a ${milestone.streak}-day streak! Keep up the incredible work!`,
          duration: 8000,
        })
        createConfetti()
        setTimeout(() => createConfetti(), 1000)
      }, 2000)
    }
  }

  const switchMode = (newMode: TimerMode) => {
    playClickSound()
    pauseTimer()
    setMode(newMode)
    setTimeLeft(settings[newMode] * 60)
  }

  const getSessionTips = () => {
    switch (sessionType) {
      case "work":
        return {
          title: "🛡️ Captain America's Work Protocol",
          tips: [
            "• 'I can do this all day' - Maintain unwavering focus on your mission",
            "• Lead by example - Tackle the most challenging task first",
            "• Strategic planning - Break complex problems into manageable objectives",
            "• Team coordination - Eliminate distractions to protect your focus",
            "• Never give up - Push through obstacles with determination",
            "• Honor your commitments - Complete what you start",
          ],
        }
      case "school":
        return {
          title: "⚡ Tony Stark's Learning System",
          tips: [
            "• 'Genius is 1% inspiration, 99% perspiration' - Study with intensity",
            "• Innovate constantly - Question everything and seek better solutions",
            "• Build on fundamentals - Master the basics before advancing",
            "• Use technology wisely - Leverage tools to enhance learning",
            "• Experiment fearlessly - Learn from both success and failure",
            "• Stay curious - Ask 'what if' and 'how can I improve this?'",
          ],
        }
      case "relaxation":
        return {
          title: "🧘 Bruce Banner's Mindfulness Guide",
          tips: [
            "• 'That's my secret... I'm always calm' - Find your center",
            "• Breathe deeply - Control your breath to control your mind",
            "• Practice acceptance - Acknowledge emotions without judgment",
            "• Gentle movement - Stretch and release physical tension",
            "• Mindful observation - Notice thoughts without getting caught in them",
            "• Cultivate patience - Growth happens in its own time",
          ],
        }
    }
  }

  const shuffleTip = () => {
    const tips = getSessionTips().tips
    const newIndex = Math.floor(Math.random() * tips.length)
    setCurrentTipIndex(newIndex)
    playClickSound()
  }

  useEffect(() => {
    tipIntervalRef.current = setInterval(() => {
      const tips = getSessionTips().tips
      const newIndex = Math.floor(Math.random() * tips.length)
      setCurrentTipIndex(newIndex)
    }, 10000)

    return () => {
      if (tipIntervalRef.current) {
        clearInterval(tipIntervalRef.current)
      }
    }
  }, [sessionType])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (tipIntervalRef.current) {
        clearInterval(tipIntervalRef.current)
      }
    }
  }, [])

  const RelaxationFeatures = () => {
    if (sessionType !== "relaxation") return null

    const startBreathingExercise = () => {
      playClickSound()
      setIsBreathingActive(true)
      setBreathingStep("Starting 4-7-8 breathing exercise...")
      setBreathingPhase("rest")
      setBreathingProgress(0)

      toast({
        title: "🌬️ 4-7-8 Breathing Exercise Started",
        description: "Follow the visual guide below. Inhale for 4, hold for 7, exhale for 8.",
        duration: 5000,
      })

      const runBreathingCycle = (cycle: number) => {
        if (cycle >= 4) {
          setBreathingStep("✨ Breathing exercise complete! Well done!")
          setBreathingPhase("rest")
          setBreathingProgress(0)
          setTimeout(() => {
            setIsBreathingActive(false)
            setBreathingStep("")
          }, 3000)
          return
        }

        const phases = [
          { phase: "inhale" as const, text: "Inhale slowly through your nose...", duration: 4000 },
          { phase: "hold" as const, text: "Hold your breath gently...", duration: 7000 },
          { phase: "exhale" as const, text: "Exhale slowly through your mouth...", duration: 8000 },
          { phase: "rest" as const, text: "Rest and prepare for next cycle...", duration: 2000 },
        ]

        const runPhase = (phaseIndex: number) => {
          if (phaseIndex >= phases.length) {
            setTimeout(() => runBreathingCycle(cycle + 1), 500)
            return
          }

          const currentPhase = phases[phaseIndex]
          setBreathingPhase(currentPhase.phase)
          setBreathingStep(`Cycle ${cycle + 1}/4 - ${currentPhase.text}`)

          let progress = 0
          const progressInterval = setInterval(() => {
            progress += 100 / (currentPhase.duration / 50)
            setBreathingProgress(Math.min(progress, 100))
          }, 50)

          setTimeout(() => {
            clearInterval(progressInterval)
            setBreathingProgress(0)
            runPhase(phaseIndex + 1)
          }, currentPhase.duration)
        }

        runPhase(0)
      }

      setTimeout(() => runBreathingCycle(0), 1000)
    }

    const startMeditation = () => {
      console.log("[v0] Starting meditation...")
      playClickSound()
      setIsMeditationActive(true)
      setMeditationStep("Starting 5-minute mindfulness meditation...")

      toast({
        title: "🧘 Mindfulness Meditation Started",
        description: "Find a comfortable position and focus on your breath.",
        duration: 5000,
      })

      const meditationSteps = [
        "Close your eyes and settle into a comfortable position...",
        "Notice your natural breathing rhythm...",
        "When thoughts arise, gently return focus to your breath...",
        "Feel your body relaxing with each exhale...",
        "Continue breathing mindfully...",
      ]

      let stepIndex = 0
      console.log("[v0] Setting up meditation interval...")

      const meditationInterval = setInterval(() => {
        console.log("[v0] Meditation step:", stepIndex)
        if (stepIndex < meditationSteps.length) {
          setMeditationStep(meditationSteps[stepIndex])
          stepIndex++
        } else {
          setMeditationStep("Continue breathing mindfully...")
        }
      }, 60000)

      setTimeout(() => {
        console.log("[v0] Meditation complete")
        clearInterval(meditationInterval)
        setMeditationStep("✨ Meditation complete! Well done!")
        setTimeout(() => {
          setIsMeditationActive(false)
          setMeditationStep("")
        }, 3000)
      }, 300000)
    }

    const toggleNatureSounds = () => {
      console.log("[v0] Toggling nature sounds, current state:", isNatureSoundsActive)
      playClickSound()

      if (!isNatureSoundsActive) {
        setIsNatureSoundsActive(true)
        toast({
          title: "🌿 Nature Sounds Started",
          description: `Playing ${currentNatureSound} sounds for relaxation.`,
          duration: 3000,
        })
      } else {
        setIsNatureSoundsActive(false)
        toast({
          title: "🔇 Nature Sounds Stopped",
          description: "Returning to silence.",
          duration: 2000,
        })
      }
    }

    const switchNatureSound = (sound: string) => {
      console.log("[v0] Switching nature sound to:", sound)
      setCurrentNatureSound(sound)
      playClickSound()

      if (isNatureSoundsActive) {
        toast({
          title: "🌿 Sound Changed",
          description: `Now playing ${sound} sounds.`,
          duration: 2000,
        })
      }
    }

    const BreathingVisualizer = () => {
      const getCircleSize = () => {
        switch (breathingPhase) {
          case "inhale":
            return `scale-[${1 + (breathingProgress / 100) * 0.5}]`
          case "hold":
            return "scale-150"
          case "exhale":
            return `scale-[${1.5 - (breathingProgress / 100) * 0.5}]`
          default:
            return "scale-100"
        }
      }

      const getCircleColor = () => {
        switch (breathingPhase) {
          case "inhale":
            return "bg-gradient-to-r from-blue-400 to-cyan-400"
          case "hold":
            return "bg-gradient-to-r from-purple-400 to-pink-400"
          case "exhale":
            return "bg-gradient-to-r from-green-400 to-emerald-400"
          default:
            return "bg-gradient-to-r from-gray-300 to-gray-400"
        }
      }

      return (
        <div className="flex flex-col items-center space-y-4 p-6">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div
              className={`w-20 h-20 rounded-full transition-all duration-1000 ease-in-out ${getCircleColor()} ${getCircleSize()}`}
            />
            <div className="absolute inset-0 rounded-full border-2 border-green-300 opacity-30" />
          </div>
          <div className="text-center space-y-2">
            <div className="text-lg font-semibold text-green-800 dark:text-green-200 capitalize">
              {breathingPhase === "rest" ? "Ready" : breathingPhase}
            </div>
            <div className="w-48 h-2 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-100 ease-out"
                style={{ width: `${breathingProgress}%` }}
              />
            </div>
          </div>
        </div>
      )
    }

    return (
      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
        <CardContent className="p-4 space-y-4">
          <h3 className="font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
            ❤️ Relaxation Tools
          </h3>

          <div className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              className={`w-full justify-start text-xs transition-all ${
                isBreathingActive
                  ? "bg-green-200 dark:bg-green-800 border-green-400"
                  : "bg-transparent hover:bg-green-100"
              }`}
              onClick={startBreathingExercise}
              disabled={isBreathingActive}
            >
              🌬️ {isBreathingActive ? "Breathing Exercise Active..." : "4-7-8 Breathing Exercise"}
            </Button>

            {isBreathingActive && (
              <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <BreathingVisualizer />
                <p className="text-sm text-green-700 dark:text-green-300 text-center mt-2">{breathingStep}</p>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className={`w-full justify-start text-xs transition-all ${
              isMeditationActive
                ? "bg-purple-200 dark:bg-purple-800 border-purple-400"
                : "bg-transparent hover:bg-purple-100"
            }`}
            onClick={startMeditation}
            disabled={isMeditationActive}
          >
            <div className="w-3 h-3 mr-2 rounded-full bg-purple-500" />
            {isMeditationActive ? "Meditation Active..." : "5-Minute Mindfulness"}
          </Button>

          {isMeditationActive && (
            <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Meditation</span>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300">{meditationStep}</p>
            </div>
          )}

          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className={`w-full justify-start text-xs transition-all ${
                isNatureSoundsActive
                  ? "bg-teal-200 dark:bg-teal-800 border-teal-400"
                  : "bg-transparent hover:bg-teal-100"
              }`}
              onClick={toggleNatureSounds}
            >
              <div className="w-3 h-3 mr-2 rounded-full bg-teal-500" />
              {isNatureSoundsActive ? "Nature Sounds Playing..." : "Nature Sounds"}
            </Button>

            {isNatureSoundsActive && (
              <div className="space-y-3 mt-2">
                <div className="flex gap-1">
                  {[
                    { key: "rain", label: "Rain", emoji: "🌧️" },
                    { key: "ocean", label: "Ocean", emoji: "🌊" },
                    { key: "forest", label: "Forest", emoji: "🌲" },
                    { key: "birds", label: "Birds", emoji: "🐦" },
                  ].map((sound) => (
                    <Button
                      key={sound.key}
                      variant={currentNatureSound === sound.key ? "default" : "outline"}
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => switchNatureSound(sound.key)}
                    >
                      {sound.emoji} {sound.label}
                    </Button>
                  ))}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                  <div className="aspect-video w-full">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${youtubeEmbedIds[currentNatureSound as keyof typeof youtubeEmbedIds]}?autoplay=1&loop=1&playlist=${youtubeEmbedIds[currentNatureSound as keyof typeof youtubeEmbedIds]}&controls=1&modestbranding=1`}
                      title={`${currentNatureSound} nature sounds`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded"
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    🎵 High-quality {currentNatureSound} sounds from YouTube
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getSessionHeader = () => {
    const characters = {
      work: { icon: "🛡️", title: "Captain America - Work Focus", subtitle: "Leading the mission with discipline" },
      school: { icon: "⚡", title: "Iron Man - Study Session", subtitle: "Genius-level learning protocol" },
      relaxation: { icon: "🧘", title: "Hulk - Mindful Break", subtitle: "Finding inner peace and balance" },
    }

    const character = characters[sessionType]

    return (
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBackToHome}>
          ← Back
        </Button>
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {character.icon} {character.title}
          </h1>
          <p className="text-sm text-muted-foreground">{character.subtitle}</p>
        </div>
      </div>
    )
  }

  const getModeColors = (currentMode: TimerMode) => {
    const colors = {
      work: {
        work: currentMode === "work" ? "bg-gradient-to-r from-red-500 to-blue-500" : "",
        shortBreak: currentMode === "shortBreak" ? "bg-gradient-to-r from-blue-500 to-red-500" : "",
        longBreak: currentMode === "longBreak" ? "bg-gradient-to-r from-red-600 to-blue-500" : "",
      },
      school: {
        work: currentMode === "work" ? "bg-gradient-to-r from-red-500 to-yellow-500" : "",
        shortBreak: currentMode === "shortBreak" ? "bg-gradient-to-r from-yellow-500 to-red-500" : "",
        longBreak: currentMode === "longBreak" ? "bg-gradient-to-r from-red-600 to-orange-600" : "",
      },
      relaxation: {
        work: currentMode === "work" ? "bg-gradient-to-r from-green-500 to-emerald-500" : "",
        shortBreak: currentMode === "shortBreak" ? "bg-gradient-to-r from-emerald-500 to-green-500" : "",
        longBreak: currentMode === "longBreak" ? "bg-gradient-to-r from-green-600 to-emerald-500" : "",
      },
    }
    return colors[sessionType]
  }

  const getTimerColors = () => {
    switch (sessionType) {
      case "work":
        return "bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent"
      case "school":
        return "bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent"
      case "relaxation":
        return "bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
    }
  }

  const getProgressColors = () => {
    switch (sessionType) {
      case "work":
        return "from-red-500 to-blue-500"
      case "school":
        return "from-red-500 to-yellow-500"
      case "relaxation":
        return "from-green-500 to-emerald-500"
    }
  }

  const playClickSound = () => {
    const audio = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
    )
    audio.volume = 0.3
    audio.play().catch(() => {})
  }

  const playVictorySound = () => {
    const createSuccessSound = () => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2)

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
      } catch (error) {
        console.error("Could not create success sound:", error)
      }
    }

    let soundFile = ""
    switch (sessionType) {
      case "work":
        soundFile = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/captain-america-complete-jVo3nZFnRHuyqkp4lpcV4BqxabpA6N.mp3"
        break
      case "school":
        soundFile = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/iron-man-complete-9PvBtN34RXHpE7MmaOXpwUNY24zTHP.mp3"
        break
      case "relaxation":
        soundFile = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hulk-complete-w4ZspENr2nkbYBfPCiVHESHJllcT8A.mp3"
        break
      default:
        createSuccessSound()
        return
    }

    const audio = new Audio(soundFile)
    audio.volume = 0.6

    audio
      .play()
      .then(() => {
        console.log("Victory sound playing successfully!")
      })
      .catch(() => {
        createSuccessSound()
        toast({
          title: "🔇 Audio Notice",
          description: "Using fallback success sound. Make sure your audio files are uploaded.",
          duration: 3000,
        })
      })
  }

  const getBackgroundGradient = () => {
    switch (sessionType) {
      case "work":
        return "bg-gradient-to-br from-red-100 via-white to-blue-100 dark:from-red-950/30 dark:via-slate-900 dark:to-blue-950/30"
      case "school":
        return "bg-gradient-to-br from-red-100 via-yellow-50 to-orange-100 dark:from-red-950/30 dark:via-yellow-950/20 dark:to-orange-950/30"
      case "relaxation":
        return "bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 dark:from-green-950/30 dark:via-emerald-950/20 dark:to-teal-950/30"
    }
  }

  return (
    <div className={`min-h-screen w-full ${getBackgroundGradient()}`}>
      <div className="w-full max-w-md mx-auto space-y-6 p-4">
        {getSessionHeader()}

        <div className="flex gap-2 p-1 bg-white/30 dark:bg-black/20 backdrop-blur-sm rounded-lg border border-white/50">
          <Button
            variant={mode === "work" ? "default" : "ghost"}
            size="sm"
            className={`flex-1 ${getModeColors(mode).work}`}
            onClick={() => switchMode("work")}
          >
            Work
          </Button>
          <Button
            variant={mode === "shortBreak" ? "default" : "ghost"}
            size="sm"
            className={`flex-1 ${getModeColors(mode).shortBreak}`}
            onClick={() => switchMode("shortBreak")}
          >
            Short Break
          </Button>
          <Button
            variant={mode === "longBreak" ? "default" : "ghost"}
            size="sm"
            className={`flex-1 ${getModeColors(mode).longBreak}`}
            onClick={() => switchMode("longBreak")}
          >
            Long Break
          </Button>
        </div>

        <Card className="bg-white/50 dark:bg-black/30 backdrop-blur-sm border-white/50">
          <CardContent className="p-8 text-center">
            <div className={`text-6xl font-bold mb-4 ${getTimerColors()}`}>{formatTime(timeLeft)}</div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${getProgressColors()} transition-all duration-1000`}
                style={{ width: `${getProgress()}%` }}
              />
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={isRunning ? pauseTimer : startTimer} size="lg" className="px-8">
                {isRunning ? "Pause" : "Start"}
              </Button>
              <Button onClick={resetTimer} variant="outline" size="lg">
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <RelaxationFeatures />

        <Card className="bg-white/50 dark:bg-black/30 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">📊 Session Stats</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Completed Pomodoros</div>
                <div className="text-2xl font-bold">{completedPomodoros}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Current Mode</div>
                <div className="text-lg font-semibold capitalize">{mode.replace(/([A-Z])/g, " $1")}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-black/30 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{getSessionTips().title}</h3>
              <Button variant="ghost" size="sm" onClick={shuffleTip}>
                🎲
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{getSessionTips().tips[currentTipIndex]}</p>
          </CardContent>
        </Card>

        {showCongratulations && (
          <CongratulationsModal
            mode={completedMode}
            sessionType={sessionType}
            onClose={() => setShowCongratulations(false)}
          />
        )}
      </div>
    </div>
  )
}
