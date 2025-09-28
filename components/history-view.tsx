"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock, TrendingUp, Award, ChevronLeft, ChevronRight } from "lucide-react"
import type { SessionRecord } from "@/app/page"

interface HistoryViewProps {
  onBackToHome: () => void
}

export function HistoryView({ onBackToHome }: HistoryViewProps) {
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    streak: 0,
    todaySessions: 0,
  })
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    const savedSessions = localStorage.getItem("pomodoro-sessions")
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
        ...session,
        completedAt: new Date(session.completedAt),
      }))
      setSessions(parsedSessions)
      calculateStats(parsedSessions)

      // Check if we should show milestone celebration
      checkForMilestoneCelebration(parsedSessions)
    }
  }, [])

  const checkForMilestoneCelebration = (sessionList: SessionRecord[]) => {
    const lastShownMilestone = localStorage.getItem("lastShownMilestone")
    const currentStreak = calculateStreak(sessionList)

    // Check if we've reached a new milestone since last shown
    let milestoneToShow = null
    if (currentStreak >= 30 && (!lastShownMilestone || Number.parseInt(lastShownMilestone) < 30)) {
      milestoneToShow = { type: "month", streak: currentStreak }
    } else if (currentStreak >= 7 && (!lastShownMilestone || Number.parseInt(lastShownMilestone) < 7)) {
      milestoneToShow = { type: "week", streak: currentStreak }
    }

    if (milestoneToShow) {
      setTimeout(() => {
        // Create confetti celebration
        createMilestoneCelebration()

        // Show celebration toast
        const title = milestoneToShow.type === "week" ? "🎉 Week Streak Champion!" : "🏆 Month Streak Master!"
        const description = `Incredible dedication! You've maintained a ${milestoneToShow.streak}-day streak!`

        // Store that we've shown this milestone
        localStorage.setItem("lastShownMilestone", milestoneToShow.streak.toString())

        // You would typically show a modal or toast here
        // For now, we'll use console.log to indicate the celebration
        console.log(`[v0] Milestone celebration: ${title} - ${description}`)
      }, 1000)
    }
  }

  const createMilestoneCelebration = () => {
    const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]
    const confettiCount = 100

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement("div")
      confetti.style.position = "fixed"
      confetti.style.left = Math.random() * 100 + "vw"
      confetti.style.top = "-10px"
      confetti.style.width = Math.random() * 8 + 6 + "px"
      confetti.style.height = confetti.style.width
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.pointerEvents = "none"
      confetti.style.zIndex = "9999"
      confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "0%"

      document.body.appendChild(confetti)

      const animation = confetti.animate(
        [
          {
            transform: "translateY(-10px) rotate(0deg) scale(1)",
            opacity: 1,
          },
          {
            transform: `translateY(100vh) translateX(${(Math.random() - 0.5) * 200}px) rotate(${Math.random() * 720}deg) scale(0)`,
            opacity: 0,
          },
        ],
        {
          duration: 4000 + Math.random() * 3000,
          easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        },
      )

      animation.onfinish = () => {
        if (document.body.contains(confetti)) {
          document.body.removeChild(confetti)
        }
      }
    }
  }

  const calculateStats = (sessionList: SessionRecord[]) => {
    const today = new Date().toDateString()
    const todaySessions = sessionList.filter((s) => s.completedAt.toDateString() === today)

    setStats({
      totalSessions: sessionList.length,
      totalMinutes: sessionList.reduce((acc, session) => acc + session.duration, 0),
      streak: calculateStreak(sessionList),
      todaySessions: todaySessions.length,
    })
  }

  const calculateStreak = (sessionList: SessionRecord[]) => {
    if (sessionList.length === 0) return 0

    const dates = [...new Set(sessionList.map((s) => s.completedAt.toDateString()))].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime(),
    )

    let streak = 0
    const today = new Date().toDateString()

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

    return streak
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getSessionIcon = (type: string) => {
    switch (type) {
      case "work":
        return "🛡️"
      case "school":
        return "⚡"
      case "relaxation":
        return "🧘"
      default:
        return "⏱️"
    }
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "work":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "shortBreak":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "longBreak":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const currentDateObj = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      const dayStr = currentDateObj.toDateString()
      const daySessions = sessions.filter((s) => s.completedAt.toDateString() === dayStr)
      const isCurrentMonth = currentDateObj.getMonth() === month
      const isToday = dayStr === new Date().toDateString()

      const sessionsByType = daySessions.reduce(
        (acc, session) => {
          const key = `${session.type}-${session.mode}`
          if (!acc[key]) {
            acc[key] = { count: 0, duration: 0, type: session.type, mode: session.mode }
          }
          acc[key].count++
          acc[key].duration += session.duration
          return acc
        },
        {} as Record<string, { count: number; duration: number; type: string; mode: string }>,
      )

      days.push({
        date: new Date(currentDateObj),
        sessions: daySessions,
        sessionsByType,
        isCurrentMonth,
        isToday,
        sessionCount: daySessions.length,
        totalMinutes: daySessions.reduce((acc, s) => acc + s.duration, 0),
      })

      currentDateObj.setDate(currentDateObj.getDate() + 1)
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h3>
          <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              className={`
                aspect-square p-1 rounded-lg border text-center text-xs relative
                ${day.isCurrentMonth ? "bg-white/20 dark:bg-black/20" : "bg-white/5 dark:bg-black/5 text-muted-foreground"}
                ${day.isToday ? "ring-2 ring-blue-500" : ""}
                ${day.sessionCount > 0 ? "bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30" : ""}
              `}
            >
              <div className="font-medium">{day.date.getDate()}</div>
              {day.sessionCount > 0 && (
                <div className="space-y-0.5">
                  <div className="flex flex-wrap justify-center gap-0.5 mb-1">
                    {Object.values(day.sessionsByType).map((sessionGroup, idx) => (
                      <div key={idx} className="flex items-center">
                        <span className="text-xs">
                          {sessionGroup.type === "work" ? "🛡️" : sessionGroup.type === "school" ? "⚡" : "🧘"}
                        </span>
                        <span
                          className={`text-xs ml-0.5 ${
                            sessionGroup.mode === "work"
                              ? "text-blue-600 dark:text-blue-400"
                              : sessionGroup.mode === "shortBreak"
                                ? "text-green-600 dark:text-green-400"
                                : "text-purple-600 dark:text-purple-400"
                          }`}
                        >
                          {sessionGroup.count}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-blue-500 dark:text-blue-300">
                    {Math.floor(day.totalMinutes / 60) > 0
                      ? `${Math.floor(day.totalMinutes / 60)}h`
                      : `${day.totalMinutes}m`}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white/20 dark:bg-black/20 rounded-lg p-3 text-xs">
          <div className="font-semibold mb-2">Legend:</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1">
              <span>🛡️</span>
              <span>Captain America (Work)</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⚡</span>
              <span>Iron Man (Study)</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🧘</span>
              <span>Hulk (Mindful)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-blue-600 dark:text-blue-400">●</span>
              <span>Focus</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-600 dark:text-green-400">●</span>
              <span>Short Break</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-purple-600 dark:text-purple-400">●</span>
              <span>Long Break</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBackToHome}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Session History
          </h1>
          <p className="text-muted-foreground">Track your productivity journey</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.totalSessions}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Total Sessions</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 border-indigo-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
              {formatDuration(stats.totalMinutes)}
            </div>
            <div className="text-xs text-indigo-600 dark:text-indigo-400">Total Time</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              {stats.streak >= 7 && <span className="ml-1 text-xs">🔥</span>}
              {stats.streak >= 30 && <span className="ml-1 text-xs">👑</span>}
            </div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.streak}</div>
            <div className="text-xs text-purple-600 dark:text-purple-400">
              Day Streak
              {stats.streak >= 30 && <div className="text-xs mt-1">🏆 Month Master!</div>}
              {stats.streak >= 7 && stats.streak < 30 && <div className="text-xs mt-1">🔥 Week Warrior!</div>}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 border-cyan-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{stats.todaySessions}</div>
            <div className="text-xs text-cyan-600 dark:text-cyan-400">Today</div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle Buttons */}
      <div className="flex gap-2 justify-center">
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("list")}
          className="bg-white/50 dark:bg-black/20"
        >
          <Clock className="w-4 h-4 mr-2" />
          List View
        </Button>
        <Button
          variant={viewMode === "calendar" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("calendar")}
          className="bg-white/50 dark:bg-black/20"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Calendar View
        </Button>
      </div>

      {/* Conditional Rendering based on View Mode */}
      {viewMode === "calendar" ? (
        <Card className="bg-white/30 dark:bg-black/20 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Session Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>{renderCalendar()}</CardContent>
        </Card>
      ) : (
        <Card className="bg-white/30 dark:bg-black/20 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No sessions completed yet</p>
                <p className="text-sm">Start your first Pomodoro session to see your history here!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sessions.slice(0, 20).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getSessionIcon(session.type)}</span>
                      <div>
                        <div className="font-medium capitalize">{session.type} Session</div>
                        <div className="text-sm text-muted-foreground">
                          {session.completedAt.toLocaleDateString()} at{" "}
                          {session.completedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getModeColor(session.mode)}`}>
                        {session.mode === "shortBreak"
                          ? "Short Break"
                          : session.mode === "longBreak"
                            ? "Long Break"
                            : "Focus"}
                      </span>
                      <span className="text-sm font-medium">{formatDuration(session.duration)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
