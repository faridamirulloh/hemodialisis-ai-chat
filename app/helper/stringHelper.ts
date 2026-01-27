import type { Key } from 'react';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isValidEmail = (email: string) => emailRegex.test(email);

const stringToSlug = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '-');

export const generateKeyEl = (key: Key, id?: Key) =>
  `${stringToSlug(String(key))}${id ? `--${stringToSlug(String(id))}` : ''}`;
