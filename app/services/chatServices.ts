import { v7 as uuidv7 } from 'uuid';
import type { ChatMessage } from '~/types/chat';
import { Chat } from '~/constant/api';

export async function postMessage(newMsg: ChatMessage, sessionId: string) {
  try {
    const resp = await fetch(Chat.POST.Chat, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: newMsg.text, sessionId }),
    });

    if (!resp.ok) throw new Error(`Server responded ${resp.status}`);
    const data = await resp.json();

    const assistantMsg: ChatMessage = {
      id: uuidv7(),
      role: 'assistant',
      text: data.output ?? 'Maaf — saya tidak mendapat respon.',
      createdAt: new Date().toISOString(),
    };

    return assistantMsg;
  } catch (err) {
    console.error(err);
    const failMsg: ChatMessage = {
      id: uuidv7(),
      role: 'assistant',
      text: 'Saya tidak dapat menjangkau server. Jika ini terus berlanjut, beri tahu tim perawatan Anda atau coba lagi nanti.',
      createdAt: new Date().toISOString(),
    };
    return failMsg;
  }
}
