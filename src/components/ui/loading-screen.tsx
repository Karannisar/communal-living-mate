
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  message?: string;
  duration?: number;
  theme?: string;
}

export function LoadingScreen({ 
  message = "Loading...",
  duration = 1500,
  theme = ""
}: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    
    // Apply theme class if provided
    if (theme) {
      document.body.classList.add(theme);
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      document.body.classList.remove("overflow-hidden");
    }, duration);
    
    return () => {
      clearTimeout(timer);
      document.body.classList.remove("overflow-hidden");
      if (theme) {
        document.body.classList.remove(theme);
      }
    };
  }, [duration, theme]);
  
  if (!isVisible) return null;
  
  return (
    <div className={cn(
      "fixed inset-0 flex flex-col items-center justify-center z-50 bg-background transition-opacity duration-500",
      isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>
        <div className="text-lg font-medium animate-fade-in">{message}</div>
        <div className="flex space-x-2 mt-4">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    </div>
  );
}
