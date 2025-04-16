
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, SendHorizonal, Bot, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi there! I'm your DormMate AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  // Sample responses for demonstration
  const demoResponses: Record<string, string> = {
    "room": "Your room is B-204 in Block B on the 2nd floor. You have 2 roommates: Alex Johnson and Ray Chen. If you need to request a room change, you can submit a request through your dashboard.",
    "mess": "Today's breakfast includes Bread and Butter, Eggs, Cereal, and Fruits. Lunch will have Rice, Dal, Vegetable Curry, Chapati, and Salad. Dinner will consist of Noodles, Soup, Grilled Vegetables, and Ice Cream.",
    "wifi": "The WiFi network name is 'DormNet' and the password is posted on the notice board in your block's common area. If you're having connection issues, you can raise a technical support ticket.",
    "laundry": "Laundry services are available in the basement of each block. The operating hours are from 7 AM to 10 PM. You can use your student ID card to operate the machines.",
    "complaint": "You can submit a complaint through your dashboard by clicking on the 'Report an Issue' button. Your complaint will be reviewed by the admin and addressed accordingly.",
    "visitors": "Visitors are allowed from 9 AM to 8 PM. They need to register at the security desk with a valid ID. Overnight guests need special permission from the dorm administration.",
    "default": "I don't have specific information about that yet. Would you like me to connect you with someone who can help?"
  };
  
  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!query.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setIsTyping(true);
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      let responseContent = demoResponses.default;
      
      // Check if the query contains any keywords we have responses for
      const lowerQuery = query.toLowerCase();
      for (const [keyword, response] of Object.entries(demoResponses)) {
        if (lowerQuery.includes(keyword.toLowerCase()) && keyword !== "default") {
          responseContent = response;
          break;
        }
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
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
          "fixed bottom-6 right-6 rounded-full p-4 shadow-lg hover-scale transition-all duration-300 z-50",
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
        <Card className="shadow-xl border-student animate-scale-in">
          <CardHeader className="pb-2 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 bg-student-dark">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <CardTitle className="text-base">DormMate Assistant</CardTitle>
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
                
                {isTyping && (
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
                placeholder="Ask a question..."
                className="min-h-9 flex-1 resize-none hover-lift"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!query.trim() || isTyping}
                size="icon"
                className="h-9 w-9 hover-scale"
              >
                {isTyping ? (
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
