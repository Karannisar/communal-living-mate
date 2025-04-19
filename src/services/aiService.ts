
// Using the types from the types/ai.ts file
import { AiMessage, AiResponseOptions } from "@/types/ai";

const DEFAULT_OPTIONS: AiResponseOptions = {
  model: "google/gemini-1.5-flash-latest",
  systemPrompt: 
    "You are a helpful chat assistant for the DormMate platform, a specialized service for student hostel bookings. " +
    "Our platform connects students with hostels and PG accommodations near their colleges and universities. " +
    "Your role is to guide users through: \n" +
    "1. Finding the right hostel based on location, budget, and amenities\n" +
    "2. Understanding the booking process and payment options\n" +
    "3. Explaining hostel policies and student discounts\n" +
    "4. For hostel owners, providing guidance on registration and commission structures\n" +
    "5. Troubleshooting common issues with bookings or the platform\n\n" +
    "Remember that students get a 5% discount on all bookings. " +
    "Be friendly, concise, and focus on helping both students and hostel owners get the most from our platform.",
  temperature: 0.3,
  maxTokens: 1000,
};

export const generateAiResponse = async (
  messages: AiMessage[],
  options: Partial<AiResponseOptions> = {}
): Promise<string> => {
  try {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    // Add system message if not present
    if (messages.every(msg => msg.role !== "system") && mergedOptions.systemPrompt) {
      messages = [
        { role: "system", content: mergedOptions.systemPrompt },
        ...messages
      ];
    }
    
    const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    if (!OPENROUTER_API_KEY) {
      console.error("OpenRouter API key not found");
      throw new Error("OpenRouter API key not found");
    }
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "DormMate Assistant"
      },
      body: JSON.stringify({
        model: mergedOptions.model,
        messages,
        temperature: mergedOptions.temperature,
        max_tokens: mergedOptions.maxTokens
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Service Error:", errorText);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.choices[0].message.content;
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
  }
};
