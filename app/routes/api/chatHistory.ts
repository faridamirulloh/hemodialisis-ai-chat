import { data } from 'react-router';
import { v7 as uuidv7 } from 'uuid';
import type { Route } from './+types/chatHistory';
import type { ChatMessage, N8nChatMessage } from '~/types/chat';
import prisma from '~/lib/prisma.server';

// GET - Fetch user's chat sessions or messages for a specific session
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const sessionId = url.searchParams.get('sessionId');

  // If sessionId is provided, fetch messages from n8n_chat_histories
  if (sessionId) {
    try {
      const n8nMessages = await prisma.chatHistory.findMany({
        where: { sessionId },
        orderBy: { id: 'asc' },
      });
      // Convert n8n format to app format
      const messages: ChatMessage[] = n8nMessages.map((msg) => {
        const messageData = msg.message as N8nChatMessage['message'];

        let content = messageData.content || '';
        if (messageData.type !== 'human' && typeof content === 'string') {
          const removeStrings = [
            '(Hemodialysis Trained Data - Quick Prompt Answer.pdf)',
            '(Hemodialysis Trained Data - Quick Prompt Answer)',
            'Hemodialysis Trained Data - Quick Prompt Answer.pdf,',
            ', Hemodialysis Trained Data - Quick Prompt Answer.pdf)',
            'Hemodialysis Trained Data - ',
            '.pdf',
          ];
          removeStrings.forEach((str) => {
            content = content.split(str).join('');
          });
        }

        return {
          id: uuidv7(),
          role: messageData.type === 'human' ? 'user' : 'assistant',
          text: content,
          createdAt: new Date().toISOString(),
        };
      });
      return data(messages, { status: 200 });
    } catch (error) {
      console.error('Failed to fetch messages from database:', error);
      return data({ error: 'Failed to fetch chat messages' }, { status: 500 });
    }
  }

  // If no userId provided, return empty array
  if (!userId) {
    return data([], { status: 200 });
  }

  // Fetch user's chat sessions from local DB
  try {
    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    });

    // Map to include sessionId for frontend compatibility
    const sessionsWithSessionId = sessions.map((s) => ({
      id: s.id,
      sessionId: s.id, // sessionId is the same as id
      title: s.title,
      createdAt: s.createdAt.toISOString(),
    }));

    return data(sessionsWithSessionId, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch chat sessions:', error);
    return data({ error: 'Failed to fetch chat sessions' }, { status: 500 });
  }
}

// POST - Create a new chat session relation
export async function action({ request }: Route.ActionArgs) {
  const method = request.method;

  if (method === 'POST') {
    try {
      const body = await request.json();
      const { userId, sessionId, title } = body;

      if (!userId || !sessionId) {
        return data({ error: 'userId and sessionId are required' }, { status: 400 });
      }

      // Check if session already exists
      const existing = await prisma.chatSession.findUnique({
        where: { id: sessionId },
      });

      if (existing) {
        // Update title if provided
        if (title && !existing.title) {
          const updated = await prisma.chatSession.update({
            where: { id: sessionId },
            data: { title },
          });
          return data(updated, { status: 200 });
        }
        return data(existing, { status: 200 });
      }

      // Create new session relation
      const session = await prisma.chatSession.create({
        data: {
          userId,
          id: sessionId,
          title: title || null,
        },
      });

      return data(session, { status: 201 });
    } catch (error) {
      console.error('Failed to save chat session:', error);
      return data({ error: 'Failed to save chat session' }, { status: 500 });
    }
  }

  if (method === 'DELETE') {
    try {
      const url = new URL(request.url);
      const sessionId = url.searchParams.get('sessionId');

      if (!sessionId) {
        return data({ error: 'sessionId is required' }, { status: 400 });
      }

      // Delete chat history messages first (from n8n_chat_histories)
      await prisma.chatHistory.deleteMany({
        where: { sessionId },
      });

      // Delete the chat session
      await prisma.chatSession.delete({
        where: { id: sessionId },
      });

      return data({ success: true }, { status: 200 });
    } catch (error) {
      console.error('Failed to delete chat session:', error);
      return data({ error: 'Failed to delete chat session' }, { status: 500 });
    }
  }

  return data({ error: 'Method not allowed' }, { status: 405 });
}
