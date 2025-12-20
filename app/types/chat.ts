export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  createdAt: string;
};

export type ChatPrompt = {
  message: string;
  sessionId: string;
};
