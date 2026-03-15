import { logout } from '~/utils/sessions.server';

export async function action({ request }: { request: Request }) {
  return await logout(request);
}

export async function loader({ request }: { request: Request }) {
  return await logout(request);
}
