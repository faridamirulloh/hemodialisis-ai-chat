import { createCookieSessionStorage, redirect } from 'react-router';

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    secrets: [process.env.SESSION_SECRET || 'dev_secret'],
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  },
});

const USER_SESSION_KEY = 'userId';

// Create session after login
export async function createUserSession(userId: string, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set(USER_SESSION_KEY, userId);
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  });
}

// Get user session (returns ID)
export async function getUserId(request: Request): Promise<string | null> {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'));
  const userId = session.get(USER_SESSION_KEY);
  return typeof userId === 'string' ? userId : null;
}

// Destroy session (logout)
export async function logout(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'));
  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}
