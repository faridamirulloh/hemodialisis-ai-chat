import { sendChat } from './chat';
import { Chat } from '~/constant/api';

export async function action({ request }: { request: Request }) {
  const body = await request.json();

  return sendChat(body, Chat.POST.PromptTest);
}
