export interface AiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Export the interface to resolve the build error
export const aiService = {
  // Placeholder for any future AI service methods
};
