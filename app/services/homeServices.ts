import type { Route } from '../routes/+types/home';
import { getUserById } from '~/db/user.server';
import { getUserId, logout } from '~/utils/sessions.server';

export async function homeLoader({ request }: Route.LoaderArgs) {
  const id = await getUserId(request);

  if (id) {
    const user = await getUserById(id);
    return { user };
  }

  return null;
}

export async function homeAction({ request }: { request: Request }) {
  return await logout(request);
}
