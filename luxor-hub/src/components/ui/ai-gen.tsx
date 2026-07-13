import type React from "react"
import { useState, useEffect } from "react"
import {
  ChatCircle,
  Sparkle,
  MagicWand,
  Spinner,
  Play,
  Pause,
  ArrowsClockwise,
  Clock,
  WarningCircle,
  Palette,
  Image,
  Sun,
  User,
  Monitor,
  Cpu,
  Film,
  Cube,
  ArrowLeft,
  ClockCounterClockwise,
  MagnifyingGlass,
} from "@phosphor-icons/react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type GenerationMode = "image" | "video" | "avatar"

interface GenerationSettings {
  style: string
  backgroundColor: string
  lighting: string
  pose: string
  aspectRatio: string
  aiModel: string
  resolution: string
  prompt: string
  negativePrompt: string
  seed?: number
  steps?: number
}

interface HistoryItem {
  id: string
  type: GenerationMode
  url: string
  prompt: string
  timestamp: Date
}

function AIMultiModalGeneration() {
  const [mode, setMode] = useState<GenerationMode>("image")
  const [showForm, setShowForm] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [advancedMode, setAdvancedMode] = useState(false)
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  const [generatedItems, setGeneratedItems] = useState<HistoryItem[]>([])

  const [settings, setSettings] = useState<GenerationSettings>({
    style: "artistic",
    backgroundColor: "studio",
    lighting: "studio",
    pose: "profile",
    aspectRatio: "4:5",
    aiModel: "stable-diffusion-xl",
    resolution: "1024x1024",
    prompt: "",
    negativePrompt: "blurry, low quality, distorted features",
  })

  const placeholderPrompts = {
    image: "Professional portrait with blue background, studio lighting",
    video: "Short video of a person walking in a park, cinematic lighting",
    avatar: "3D avatar of a young professional with glasses, detailed face",
  }

  const loadingTexts = {
    image: ["Creating your masterpiece...", "Finding the perfect colors...", "Adding the final touches..."],
    video: ["Generating video frames...", "Applying motion effects...", "Rendering your video..."],
    avatar: ["Building 3D mesh...", "Applying textures...", "Finalizing your avatar..."],
  }

  const aiModels = {
    image: [
      { value: "stable-diffusion-xl", label: "Stable Diffusion XL" },
      { value: "midjourney-v5", label: "Midjourney v5" },
      { value: "dalle-3", label: "DALL-E 3" },
      { value: "imagen", label: "Imagen" },
    ],
    video: [
      { value: "gen-2", label: "Gen-2" },
      { value: "runway-gen-2", label: "Runway Gen-2" },
      { value: "pika-labs", label: "Pika Labs" },
      { value: "sora", label: "Sora" },
    ],
    avatar: [
      { value: "dreamshaper-3d", label: "DreamShaper 3D" },
      { value: "3d-diffusion", label: "3D Diffusion" },
      { value: "meshy", label: "Meshy" },
      { value: "luma", label: "Luma AI" },
    ],
  }

  const resolutions = {
    image: [
      { value: "512x512", label: "512x512" },
      { value: "768x768", label: "768x768" },
      { value: "1024x1024", label: "1024x1024" },
      { value: "1536x1536", label: "1536x1536" },
    ],
    video: [
      { value: "512x512", label: "512x512" },
      { value: "768x768", label: "768x768" },
      { value: "1024x576", label: "1024x576 (16:9)" },
      { value: "1280x720", label: "1280x720 (HD)" },
    ],
    avatar: [
      { value: "512x512", label: "512x512" },
      { value: "768x768", label: "768x768" },
      { value: "1024x1024", label: "1024x1024" },
      { value: "2048x2048", label: "2048x2048" },
    ],
  }

  useEffect(() => {
    if (mode === "image") {
      setPromptSuggestions([
        "Professional headshot with neutral background",
        "Artistic portrait with dramatic lighting",
        "Casual portrait in natural outdoor setting",
      ])
    } else if (mode === "video") {
      setPromptSuggestions([
        "Person walking in urban environment, cinematic lighting",
        "Close-up of face with changing expressions",
        "Rotating view of subject in studio setting",
      ])
    } else {
      setPromptSuggestions([
        "Realistic 3D avatar with professional attire",
        "Stylized cartoon character with expressive features",
        "Detailed 3D bust with photorealistic textures",
      ])
    }
  }, [mode])

  useEffect(() => {
    if (!isLoading) { setProgress(0); return }
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); return 100 }
        return prev + (mode === "image" ? 1.5 : mode === "video" ? 0.8 : 0.5)
      })
    }, 30)
    return () => clearInterval(interval)
  }, [isLoading, mode])

  useEffect(() => {
    if (!isLoading) return
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % loadingTexts[mode].length)
    }, 1500)
    return () => clearInterval(interval)
  }, [isLoading, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setShowForm(false)
    setIsLoading(true)
    setError(null)
    try {
      const loadingTime = mode === "image" ? 3000 : mode === "video" ? 5000 : 7000
      await new Promise((resolve) => setTimeout(resolve, loadingTime))
      const newItem = {
        id: Date.now().toString(),
        type: mode,
        url: "https://cdn.pixabay.com/photo/2023/08/03/09/57/ai-generated-8166705_1280.png",
        prompt: settings.prompt || "AI generated content",
        timestamp: new Date(),
      }
      setGeneratedItems((prev) => [newItem, ...prev])
    } catch (err) {
      setError(`Failed to generate ${mode}. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleModeChange = (newMode: GenerationMode) => {
    setMode(newMode); setShowForm(true); setShowHistory(false); setError(null)
  }

  const formatDate = (date: Date) => {
    const diffMs = Date.now() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  const renderSettings = () => (
    <div className="space-y-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-zinc-500" />
          <span className="text-xs text-zinc-500">AI Model</span>
        </div>
        <Select value={settings.aiModel} onValueChange={(v) => setSettings({ ...settings, aiModel: v })}>
          <SelectTrigger className="w-[140px] h-7 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {aiModels[mode].map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-zinc-500" />
          <span className="text-xs text-zinc-500">Resolution</span>
        </div>
        <Select value={settings.resolution} onValueChange={(v) => setSettings({ ...settings, resolution: v })}>
          <SelectTrigger className="w-[140px] h-7 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {resolutions[mode].map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-zinc-500" />
          <span className="text-xs text-zinc-500">Style</span>
        </div>
        <Select value={settings.style} onValueChange={(v) => setSettings({ ...settings, style: v })}>
          <SelectTrigger className="w-[140px] h-7 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="artistic">Artistic</SelectItem>
            <SelectItem value="casual">Casual</SelectItem>
            <SelectItem value="vintage">Vintage</SelectItem>
            {mode === "avatar" && <SelectItem value="cartoon">Cartoon</SelectItem>}
            {mode === "avatar" && <SelectItem value="anime">Anime</SelectItem>}
            {mode === "video" && <SelectItem value="cinematic">Cinematic</SelectItem>}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4 text-zinc-500" />
          <span className="text-xs text-zinc-500">Background</span>
        </div>
        <Select value={settings.backgroundColor} onValueChange={(v) => setSettings({ ...settings, backgroundColor: v })}>
          <SelectTrigger className="w-[140px] h-7 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="studio">Studio</SelectItem>
            <SelectItem value="gradient">Gradient</SelectItem>
            <SelectItem value="solid">Solid Color</SelectItem>
            <SelectItem value="transparent">Transparent</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 overflow-hidden text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <div className="p-3 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          {showForm ? (
            <Sparkle className="w-4 h-4 text-violet-500" />
          ) : (
            <button onClick={() => { setShowForm(true); setShowHistory(false) }} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h3 className="text-xs font-medium">AI Generation</h3>
            <p className="text-[10px] text-zinc-500">Create AI content</p>
          </div>
        </div>
        <button onClick={() => setShowHistory(!showHistory)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <ClockCounterClockwise className="w-4 h-4 text-zinc-500" />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-3 mt-2 px-3 py-2 flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/10 rounded-lg">
          <WarningCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="relative w-16 h-16 mb-3">
            <div className="absolute inset-0 rounded-full border-2 border-zinc-200 dark:border-zinc-700" />
            <div className="absolute inset-0 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">{Math.round(progress)}%</span>
          </div>
          <p className="text-xs text-zinc-500 text-center">{loadingTexts[mode][currentTextIndex]}</p>
        </div>
      )}

      {/* History */}
      {showHistory && !isLoading && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <p className="text-xs text-zinc-500 mb-2">Recent generations</p>
          {generatedItems.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-8">No generations yet</p>
          ) : (
            generatedItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                <img src={item.url} alt={item.prompt} className="w-10 h-10 rounded-md object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium truncate">{item.prompt}</p>
                  <p className="text-[9px] text-zinc-500">{formatDate(item.timestamp)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Form */}
      {showForm && !isLoading && !showHistory && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 flex-1 p-3 overflow-y-auto">
          {/* Prompt */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ChatCircle className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[10px] text-zinc-500">Prompt</span>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 px-1.5">
                    <MagicWand className="w-3 h-3 text-zinc-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2">
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-medium text-zinc-500">Suggestions</h4>
                    {promptSuggestions.map((s, i) => (
                      <button key={i} type="button" onClick={() => setSettings({ ...settings, prompt: s })}
                        className="w-full text-left p-1.5 text-[10px] hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Textarea
              value={settings.prompt}
              onChange={(e) => setSettings({ ...settings, prompt: e.target.value })}
              placeholder={placeholderPrompts[mode]}
              className="w-full min-h-[60px] bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 rounded-xl focus:outline-none focus-visible:ring-0"
            />
          </div>

          {/* Advanced toggle */}
          <div className="flex items-center gap-2">
            <Switch id="adv" checked={advancedMode} onCheckedChange={setAdvancedMode} />
            <Label htmlFor="adv" className="text-[10px] text-zinc-500">Advanced</Label>
          </div>

          {advancedMode && (
            <div className="space-y-2 p-2 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500">Negative Prompt</label>
                <Textarea value={settings.negativePrompt}
                  onChange={(e) => setSettings({ ...settings, negativePrompt: e.target.value })}
                  placeholder="Elements to avoid"
                  className="w-full min-h-[40px] bg-white dark:bg-zinc-800 text-[10px] rounded-xl" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-[10px] text-zinc-500">Seed</label>
                  <span className="text-[10px] text-zinc-700">{settings.seed || 0}</span>
                </div>
                <Slider defaultValue={[settings.seed || 0]} max={1000000} step={1}
                  onValueChange={(v) => setSettings({ ...settings, seed: v[0] })} />
              </div>
            </div>
          )}

          {/* Settings */}
          {renderSettings()}

          {/* Generate button */}
          <button type="submit"
            className="w-full h-9 flex items-center justify-center gap-2 bg-gradient-to-r from-[#E8C87A] to-[#E8C87A]/80 hover:from-[#E8C87A]/90 hover:to-[#E8C87A]/70 text-zinc-900 text-xs font-medium rounded-xl transition-colors">
            <Sparkle className="w-3.5 h-3.5" />
            Generate {mode === "image" ? "Portrait" : mode === "video" ? "Video" : "Avatar"}
          </button>
        </form>
      )}

      {/* Generated result */}
      {!showForm && !isLoading && !showHistory && generatedItems.length > 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <img src={generatedItems[0].url} alt={generatedItems[0].prompt}
            className="w-full max-w-[200px] rounded-xl object-cover mb-3" />
          <p className="text-[10px] text-zinc-500 text-center mb-3">{generatedItems[0].prompt}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-[10px] h-7" onClick={() => setShowForm(true)}>
              <MagicWand className="w-3 h-3 mr-1" /> New
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export { AIMultiModalGeneration }
