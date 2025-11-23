import type { AuthFormData } from '~/types/auth';
import { login, signup } from '~/utils/auth.server';

export async function authAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const mode = formData.get('mode') as AuthFormData['mode'];
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;
  const password = formData.get('password') as string;

  if (mode === 'signup') {
    if (!email || !name || !password) {
      return { error: 'Harap isi semua data!' };
    }

    return await signup({ email, name, password });
  } else {
    const response = await login({ email, password });
    if (!response) {
      return { error: 'Email atau password tidak sesuai!' };
    }

    return response;
  }
}
