import { Chat } from '~/constant/api';

export async function action({ request }: { request: Request }) {
  const body = await request.json();

  try {
    const reply = await fetch(Chat.POST.Prompt, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const text = await reply.text();

    if (!reply.ok) {
      console.error('n8n proxy error:', reply.status, text);
      return new Response(JSON.stringify({ error: `Proxy error: ${reply.status}`, details: text }), {
        status: reply.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const QUOTA_WARNING = 'Maaf, kuota pertanyaan Anda telah habis atau server sedang sibuk. Silakan coba lagi nanti.';

    if (!text) {
      console.warn('n8n returned an empty response');
      return new Response(JSON.stringify({ output: QUOTA_WARNING }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const data = JSON.parse(text);
      if (!data.output) {
        data.output = QUOTA_WARNING;
      }
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      console.error('Failed to parse n8n JSON:', text);
      return new Response(JSON.stringify({ output: QUOTA_WARNING, error: 'Invalid JSON from upstream' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Fetch to n8n failed:', error);
    return new Response(JSON.stringify({ error: 'Failed to connect to n8n' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
