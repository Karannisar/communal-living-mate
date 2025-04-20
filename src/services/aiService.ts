import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export interface AiResponseOptions {
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

type Room = Database["public"]["Tables"]["rooms"]["Row"];
type MessMenu = Database["public"]["Tables"]["mess_menu"]["Row"];
type Booking = Database["public"]["Tables"]["bookings"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];

async function fetchDatabaseContext(userMessage: string) {
  const context: string[] = [];
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return context;

  // Fetch user's room information and roommates
  if (userMessage.toLowerCase().includes("room") || userMessage.toLowerCase().includes("roommate")) {
    const { data: bookingData } = await supabase
      .from("bookings")
      .select(`
        *,
        rooms (*),
        room:rooms!inner (
          bookings!inner (
            user:users!inner (
              full_name
            )
          )
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "approved")
      .single();
    
    if (bookingData?.rooms) {
      const room = bookingData.rooms as Room;
      context.push(`Your room information: Room ${room.room_number}, Floor ${room.floor}`);
      if (room.amenities && room.amenities.length > 0) {
        context.push(`Room amenities: ${room.amenities.join(", ")}`);
      }
      
      // Add roommates information
      const roommates = bookingData.room?.bookings
        ?.map(booking => booking.user.full_name)
        .filter(name => name) // Remove null/undefined
        .filter(name => name !== user.email); // Filter out current user
      
      if (roommates && roommates.length > 0) {
        context.push(`Your roommates are: ${roommates.join(", ")}`);
      } else {
        context.push("You currently have no roommates.");
      }
    }
  }

  // Fetch mess menu information
  if (userMessage.toLowerCase().includes("food") || userMessage.toLowerCase().includes("menu") || userMessage.toLowerCase().includes("mess")) {
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const { data: menuData } = await supabase
      .from("mess_menu")
      .select("*")
      .eq("day_of_week", dayOfWeek);

    if (menuData && menuData.length > 0) {
      const todayMenu = menuData[0];
      context.push(`Today's menu (${dayOfWeek}):`);
      const items = todayMenu.items;
      if (items.length > 0) {
        context.push(`${todayMenu.meal_type}: ${items.join(", ")}`);
      }
    } else {
      // If specific day's menu not found, fetch full week's menu
      const { data: weekMenuData } = await supabase
        .from("mess_menu")
        .select("*")
        .order("day_of_week");
      
      if (weekMenuData && weekMenuData.length > 0) {
        context.push("Here's the weekly menu schedule:");
        const menuByDay = weekMenuData.reduce((acc: { [key: string]: typeof weekMenuData[0][] }, item) => {
          if (!acc[item.day_of_week]) {
            acc[item.day_of_week] = [];
          }
          acc[item.day_of_week].push(item);
          return acc;
        }, {});

        for (const [day, meals] of Object.entries(menuByDay)) {
          context.push(`\n${day.charAt(0).toUpperCase() + day.slice(1)}:`);
          meals.forEach(meal => {
            context.push(`${meal.meal_type}: ${meal.items.join(", ")}`);
          });
        }
      } else {
        context.push("I apologize, but I couldn't find any menu information in the database.");
      }
    }
  }

  // Fetch user's bookings if asked about bookings
  if (userMessage.toLowerCase().includes("booking")) {
    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", user.id)
      .order("start_date", { ascending: true })
      .limit(5);
    
    if (bookings && bookings.length > 0) {
      const bookingInfo = bookings.map((booking: Booking) => 
        `Room booking from ${new Date(booking.start_date).toLocaleDateString()} to ${new Date(booking.end_date).toLocaleDateString()} (${booking.status})`
      ).join("\n");
      context.push(`Your recent bookings:\n${bookingInfo}`);
    }
  }

  return context;
}

export async function generateAiResponse(messages: AiMessage[]): Promise<string> {
  try {
    // Get context from database based on the last user message
    const lastUserMessage = messages[messages.length - 1].content;
    const context = await fetchDatabaseContext(lastUserMessage);
    
    // Prepare the messages array with system context
    const systemContext = [
      "You are a helpful dormitory assistant that helps students with their queries about rooms, mess food, and bookings.",
      "You have access to the following information from the database:",
      ...context,
      "\nWhen responding about food or mess menu:",
      "1. Always specify which day's menu you're showing",
      "2. List all meals (breakfast, lunch, dinner) separately",
      "3. If no specific day is mentioned, show the full week's menu",
      "\nWhen responding about rooms or roommates:",
      "1. Always include roommate names when asked",
      "2. Include room amenities when relevant",
      "3. Be specific about room location (floor, room number)"
    ].join("\n");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "DormMate Assistant"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          {
            role: "system",
            content: systemContext
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get AI response");
    }

    const data: OpenRouterResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error in generateAiResponse:", error);
    throw error;
  }
} 