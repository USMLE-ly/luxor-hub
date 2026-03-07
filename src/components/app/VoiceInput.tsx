import { useState, useCallback, useRef, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export const VoiceInput = ({ onTranscript, disabled }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const isSupported = typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (!isSupported) {
      toast.error("Voice input not supported in this browser");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        toast.error("Microphone access denied. Please allow microphone in your browser settings.");
      } else if (event.error !== "aborted") {
        toast.error("Voice input failed. Try again.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);

    // Auto-stop after 15s
    setTimeout(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }, 15000);
  }, [isListening, isSupported, onTranscript]);

  if (!isSupported) return null;

  return (
    <button
      onClick={toggleListening}
      disabled={disabled}
      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
        isListening
          ? "bg-destructive text-destructive-foreground animate-pulse shadow-[0_0_12px_hsl(var(--destructive)/0.4)]"
          : "text-muted-foreground hover:text-primary"
      }`}
      title={isListening ? "Stop listening" : "Voice input"}
    >
      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </button>
  );
};
