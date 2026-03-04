import prisma from '~/lib/prisma.server';
import { getUserId } from '~/utils/sessions.server';

export async function loader({ request }: { request: Request }) {
  const userId = await getUserId(request);

  if (!userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, data: true },
  });

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  return Response.json(user);
}

export async function action({ request }: { request: Request }) {
  if (request.method !== 'PATCH') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const userId = await getUserId(request);
  if (!userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json();

  // Merge new data into existing data
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { data: true },
  });

  const existingData = (existingUser?.data as Record<string, unknown>) || {};
  const mergedData = { ...existingData, ...body };

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { data: mergedData },
    select: { id: true, email: true, name: true, data: true },
  });

  return Response.json(updated);
}
