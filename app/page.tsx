"use client"

import { useState, useEffect } from "react"
import { SessionSelector } from "@/components/session-selector"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { HistoryView } from "@/components/history-view"
import { SettingsView } from "@/components/settings-view"
import { WelcomeHome } from "@/components/welcome-home"

export type SessionType = "work" | "school" | "relaxation"
export type ViewType = "welcome" | "home" | "timer" | "history" | "settings"

export interface SessionRecord {
  id: string
  type: SessionType
  mode: "work" | "shortBreak" | "longBreak"
  duration: number
  completedAt: Date
  interrupted: boolean
}

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>("welcome")
  const [selectedSessionType, setSelectedSessionType] = useState<SessionType | null>(null)
  const [userName, setUserName] = useState<string>("")
  const [isFirstTime, setIsFirstTime] = useState<boolean>(true)

  useEffect(() => {
    const savedName = localStorage.getItem("pomodoroUserName")
    if (savedName) {
      setUserName(savedName)
      setIsFirstTime(false)
    }
  }, [])

  const handleNameSubmit = (name: string) => {
    setUserName(name)
    localStorage.setItem("pomodoroUserName", name)
    setIsFirstTime(false)
    setCurrentView("home")
  }

  const handleContinue = () => {
    setCurrentView("home")
  }

  const handleSessionSelect = (type: SessionType) => {
    setSelectedSessionType(type)
    setCurrentView("timer")
  }

  const handleBackToHome = () => {
    setCurrentView("home")
    setSelectedSessionType(null)
  }

  const handleViewHistory = () => {
    setCurrentView("history")
  }

  const handleViewSettings = () => {
    setCurrentView("settings")
  }

  const handleGoHome = () => {
    setCurrentView("welcome")
    setSelectedSessionType(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center p-4">
      {currentView === "welcome" && (
        <WelcomeHome
          userName={userName}
          isFirstTime={isFirstTime}
          onNameSubmit={handleNameSubmit}
          onContinue={handleContinue}
        />
      )}
      {currentView === "home" && (
        <SessionSelector
          onSessionSelect={handleSessionSelect}
          onViewHistory={handleViewHistory}
          onViewSettings={handleViewSettings}
          onGoHome={handleGoHome}
          userName={userName}
        />
      )}
      {currentView === "timer" && selectedSessionType && (
        <PomodoroTimer sessionType={selectedSessionType} onBackToHome={handleBackToHome} />
      )}
      {currentView === "history" && <HistoryView onBackToHome={handleBackToHome} />}
      {currentView === "settings" && <SettingsView onBackToHome={handleBackToHome} />}
    </main>
  )
}
