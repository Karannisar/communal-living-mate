import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AiMessage, generateAiResponse } from '@/services/aiService';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Check, Home, Loader2, Maximize2, MessageCircle, Minimize2, SendHorizonal, UtensilsCrossed, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from 'react-markdown';
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function DormAiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your DormMate assistant. I can help you with room bookings, mess menu information, and other dormitory services. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || isProcessing) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: newMessage,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setNewMessage("");
    setIsProcessing(true);
    
    try {
      const messageHistory: AiMessage[] = messages
        .filter(msg => msg.id !== "welcome")
        .map(msg => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        }));
      
      messageHistory.push({
        role: "user",
        content: userMsg.content,
      });
      
      const aiResponse = await generateAiResponse(messageHistory);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast.error("Failed to get a response. Please try again.");
      
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageIcon = (content: string) => {
    if (content.toLowerCase().includes("room") || content.toLowerCase().includes("booking")) {
      return <Home className="h-4 w-4 text-blue-400" />;
    } else if (content.toLowerCase().includes("mess") || content.toLowerCase().includes("food")) {
      return <UtensilsCrossed className="h-4 w-4 text-blue-400" />;
    } else if (content.toLowerCase().includes("success") || content.toLowerCase().includes("complete")) {
      return <Check className="h-4 w-4 text-green-400" />;
    } else {
      return <MessageCircle className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <>
      {/* Floating button to toggle AI assistant */}
      <motion.button
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg text-white z-40 ${isOpen ? 'hidden' : 'flex'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
      >
        <Bot size={24} />
      </motion.button>
      
      {/* AI Assistant Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={isMinimized 
              ? { opacity: 1, y: 0, scale: 0.9, height: '80px' }
              : { opacity: 1, y: 0, scale: 1 }
            }
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-6 right-6 w-96 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 flex flex-col overflow-hidden ${isMinimized ? 'h-20' : 'h-[600px]'}`}
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
                  <div className="flex items-center gap-2">
                    {isMinimized ? (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => setIsMinimized(false)}
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => setIsMinimized(true)}
                      >
                        <Minimize2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
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
                          {message.role === "assistant" && (
                            <div className="flex items-center gap-1 mb-1 text-xs text-muted-foreground">
                              {getMessageIcon(message.content)}
                              <span>Assistant</span>
                            </div>
                          )}
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="text-sm prose prose-invert">{children}</p>
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                          <p className="text-xs text-muted-foreground mt-1 text-right">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {isProcessing && (
                      <div className="flex justify-start">
                        <div className="bg-muted max-w-[80%] rounded-lg p-3">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                            <span 
                              className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                              style={{ animationDelay: "0.2s" }}
                            ></span>
                            <span 
                              className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                              style={{ animationDelay: "0.4s" }}
                            ></span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-3 border-t">
                <div className="flex w-full items-center gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about rooms, mess menu, or other services..."
                    className="min-h-9 flex-1 resize-none"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isProcessing}
                    size="icon"
                    className="h-9 w-9"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <SendHorizonal className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 