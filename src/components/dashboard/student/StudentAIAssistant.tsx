
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function StudentAIAssistant() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { 
      role: "assistant", 
      content: "Hello! I'm your DormMate AI assistant. How can I help you today? You can ask me about your room, mess menu, or any other dormitory services."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Automatically scroll to bottom when messages change
  useEffect(() => {
    const scrollArea = document.getElementById("chat-scroll-area");
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  const generateAIResponse = async (userMessage: string) => {
    setIsLoading(true);
    try {
      // Simulated AI response for now
      const responseOptions = [
        "I can help you with information about your room, mess menu, and other dormitory services.",
        "The mess menu is updated daily. You can check today's menu in the mess menu section.",
        "If you need to report any issues with your room, please use the complaint form or contact the admin.",
        "Your attendance is important. Remember to check in when you enter and check out when you leave.",
        "The hostel has various amenities including Wi-Fi, laundry services, and common areas for studying.",
        "Need help with something else? Please let me know how I can assist you."
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get a random response
      const randomResponse = responseOptions[Math.floor(Math.random() * responseOptions.length)];
      
      return randomResponse;
    } catch (error) {
      console.error("Error generating AI response:", error);
      return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    // Generate AI response
    const aiResponse = await generateAIResponse(input.trim());
    setMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
  };

  return (
    <div className="flex flex-col h-[400px]">
      <ScrollArea id="chat-scroll-area" className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`flex items-start gap-2 max-w-[80%] ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback>
                    {message.role === "user" ? "U" : "AI"}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className={`rounded-lg p-3 ${
                    message.role === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="rounded-lg p-3 bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={isLoading || !input.trim()}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
