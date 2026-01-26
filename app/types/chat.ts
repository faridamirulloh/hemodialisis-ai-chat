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

export type ChatSessionSummary = {
  id: string;
  sessionId: string;
  title: string | null;
  createdAt: string;
};

// Message format from n8n_chat_histories table
export type N8nChatMessage = {
  id: number;
  session_id: string;
  message: {
    type: 'human' | 'ai';
    content: string;
  };
};
