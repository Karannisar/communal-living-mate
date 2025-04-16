
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, SendHorizonal, Bot, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function OpenRouterChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi there! I'm your DormMate AI assistant powered by Gemini. How can I help you with your dormitory needs today?",
      timestamp: new Date(),
    },
  ]);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!query.trim()) return;
    
    // Add user message
    const userMessageId = Date.now().toString();
    const userMessage: Message = {
      id: userMessageId,
      role: "user",
      content: query,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);
    
    try {
      // Call our Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('openrouter-chat', {
        body: { message: query }
      });
      
      if (error) {
        console.error("Error calling openrouter-chat function:", error);
        toast({
          title: "Error",
          description: "Failed to get a response. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error in chat:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating button to toggle AI assistant */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 rounded-full p-4 shadow-lg hover:scale-105 transition-all duration-300 z-50",
          !isOpen ? "bg-student-dark text-white" : "bg-destructive text-white"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </Button>
      
      {/* AI Assistant Dialog */}
      <div
        className={cn(
          "fixed bottom-24 right-6 w-[350px] transition-all duration-300 ease-in-out transform z-40",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}
      >
        <Card className="shadow-xl border-student animate-fade-in">
          <CardHeader className="pb-2 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 bg-student-dark">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <CardTitle className="text-base">DormMate Gemini Assistant</CardTitle>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                Online
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="h-[350px] overflow-y-auto p-3">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg p-3 animate-fade-in",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1 text-right">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted max-w-[80%] rounded-lg p-3">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-student-dark rounded-full animate-pulse"></span>
                        <span 
                          className="w-2 h-2 bg-student-dark rounded-full animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        ></span>
                        <span 
                          className="w-2 h-2 bg-student-dark rounded-full animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        ></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={endOfMessagesRef} />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="p-3 border-t">
            <div className="flex w-full items-center gap-2">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about dormitory services..."
                className="min-h-9 flex-1 resize-none hover:scale-[1.01] transition-all"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!query.trim() || isLoading}
                size="icon"
                className="h-9 w-9 hover:scale-110 transition-transform"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SendHorizonal className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
