
export interface AiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Add the missing generateAiResponse function
export const generateAiResponse = async (messages: AiMessage[]): Promise<string> => {
  try {
    // This is a placeholder implementation
    return "I'm your DormMate AI Assistant. How can I help you find the perfect accommodation?";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "Sorry, I couldn't process your request at the moment.";
  }
};

// Export the interface to resolve the build error
export const aiService = {
  generateAiResponse,
};
