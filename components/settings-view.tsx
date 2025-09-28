"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Settings, Save, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SettingsViewProps {
  onBackToHome: () => void
}

interface TimerSettings {
  work: { work: number; shortBreak: number; longBreak: number }
  school: { work: number; shortBreak: number; longBreak: number }
  relaxation: { work: number; shortBreak: number; longBreak: number }
}

export function SettingsView({ onBackToHome }: SettingsViewProps) {
  const { toast } = useToast()

  const defaultSettings: TimerSettings = {
    work: { work: 25, shortBreak: 5, longBreak: 15 },
    school: { work: 30, shortBreak: 10, longBreak: 20 },
    relaxation: { work: 15, shortBreak: 5, longBreak: 10 },
  }

  const [settings, setSettings] = useState<TimerSettings>(defaultSettings)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("pomodoro-settings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const saveSettings = async () => {
    if (isSaving) return
    setIsSaving(true)

    console.log("[v0] Saving settings:", settings)
    localStorage.setItem("pomodoro-settings", JSON.stringify(settings))

    const event = new CustomEvent("pomodoroSettingsChanged", {
      detail: settings,
    })
    console.log("[v0] Dispatching settings change event:", event.detail)
    window.dispatchEvent(event)

    toast({
      title: "Settings Saved! ⚙️",
      description: "Your timer preferences have been updated and will take effect immediately.",
    })

    const audio = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
    )
    audio.volume = 0.4
    audio.play().catch(() => {})

    setTimeout(() => setIsSaving(false), 1000)
  }

  const resetToDefaults = () => {
    setSettings(defaultSettings)
    toast({
      title: "Settings Reset! 🔄",
      description: "All timer settings have been restored to defaults.",
    })
  }

  const updateSetting = (character: keyof TimerSettings, mode: keyof TimerSettings["work"], value: number) => {
    setSettings((prev) => ({
      ...prev,
      [character]: {
        ...prev[character],
        [mode]: Math.max(1, Math.min(120, value)), // Limit between 1-120 minutes
      },
    }))
  }

  const getCharacterInfo = (character: keyof TimerSettings) => {
    switch (character) {
      case "work":
        return { icon: "🛡️", name: "Captain America", subtitle: "Work Focus Mode", gradient: "from-red-500 to-blue-500" }
      case "school":
        return { icon: "⚡", name: "Iron Man", subtitle: "Study Session Mode", gradient: "from-red-500 to-yellow-500" }
      case "relaxation":
        return { icon: "🧘", name: "Hulk", subtitle: "Mindful Break Mode", gradient: "from-green-500 to-emerald-500" }
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBackToHome}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Timer Settings
          </h1>
          <p className="text-muted-foreground">Customize your superhero productivity timers</p>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="space-y-6">
        {(Object.keys(settings) as Array<keyof TimerSettings>).map((character) => {
          const info = getCharacterInfo(character)
          return (
            <Card key={character} className="bg-white/30 dark:bg-black/20 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-2xl">{info.icon}</span>
                  <div>
                    <div
                      className={`text-lg font-bold bg-gradient-to-r ${info.gradient} bg-clip-text text-transparent`}
                    >
                      {info.name}
                    </div>
                    <div className="text-sm text-muted-foreground font-normal">{info.subtitle}</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor={`${character}-work`} className="text-sm font-medium">
                      Focus Time (minutes)
                    </Label>
                    <Input
                      id={`${character}-work`}
                      type="number"
                      min="1"
                      max="120"
                      value={settings[character].work}
                      onChange={(e) => updateSetting(character, "work", Number.parseInt(e.target.value) || 1)}
                      className="bg-white/50 dark:bg-black/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${character}-short`} className="text-sm font-medium">
                      Short Break (minutes)
                    </Label>
                    <Input
                      id={`${character}-short`}
                      type="number"
                      min="1"
                      max="60"
                      value={settings[character].shortBreak}
                      onChange={(e) => updateSetting(character, "shortBreak", Number.parseInt(e.target.value) || 1)}
                      className="bg-white/50 dark:bg-black/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${character}-long`} className="text-sm font-medium">
                      Long Break (minutes)
                    </Label>
                    <Input
                      id={`${character}-long`}
                      type="number"
                      min="1"
                      max="60"
                      value={settings[character].longBreak}
                      onChange={(e) => updateSetting(character, "longBreak", Number.parseInt(e.target.value) || 1)}
                      className="bg-white/50 dark:bg-black/20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <Button
          onClick={saveSettings}
          disabled={isSaving}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
        <Button onClick={resetToDefaults} variant="outline" className="bg-white/50 dark:bg-black/20 backdrop-blur-sm">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>

      {/* Help Text */}
      <Card className="bg-white/20 dark:bg-black/10 backdrop-blur-sm border-white/30">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Timer Guidelines
          </h3>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Focus sessions: 15-45 minutes work best for sustained concentration</p>
            <p>• Short breaks: 5-15 minutes help maintain energy throughout the day</p>
            <p>• Long breaks: 15-30 minutes provide deeper rest after multiple sessions</p>
            <p>• Each character has optimized defaults based on their productivity style</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
