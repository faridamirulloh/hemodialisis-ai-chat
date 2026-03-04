import bcrypt from 'bcrypt';
import { createUserSession } from './sessions.server';
import prisma from '~/lib/prisma.server';

export async function checkEmailExists(email: string): Promise<boolean> {
  const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  return !!existingUser;
}

export async function signup({ email, name, password }: { email: string; name: string; password: string }) {
  // Check if email already exists
  const emailExists = await checkEmailExists(email);
  if (emailExists) {
    return { error: 'Email sudah terdaftar!' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email: email.toLowerCase(), name, password: hashedPassword } });
  return createUserSession(user.id, '/');
}

export async function login({ email, password }: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return createUserSession(user.id, '/');
}
