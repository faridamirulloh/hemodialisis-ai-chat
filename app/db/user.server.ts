import bcrypt from 'bcrypt';
import type { User } from '~/generated/prisma/client';
import { isValidEmail } from '~/helper/stringHelper';
import prisma from '~/lib/prisma.server';

export async function getUsers(): Promise<Pick<User, 'id' | 'email' | 'name'>[]> {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
}

export async function getUserById(id: string): Promise<Pick<User, 'id' | 'email' | 'name'> | null> {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
}

export async function createUser(
  email: string,
  name: string,
  password: string,
): Promise<Pick<User, 'id' | 'email' | 'name'>> {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: { email: email.toLowerCase(), name, password: hashedPassword },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
}

export async function verifyLogin(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return { id: user.id, email: user.email, name: user.name };
}
