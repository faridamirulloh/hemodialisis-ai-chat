import type { Key } from 'react';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isValidEmail = (email: string) => emailRegex.test(email);

export const generateKeyEl = (key: Key, id?: Key) => `${key}${id ? `--${id}` : ''}`;
