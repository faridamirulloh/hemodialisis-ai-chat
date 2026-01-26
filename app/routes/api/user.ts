import prisma from '~/lib/prisma.server';
import { getUserId } from '~/utils/sessions.server';

export async function loader({ request }: { request: Request }) {
  const userId = await getUserId(request);

  if (!userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  return Response.json(user);
}
