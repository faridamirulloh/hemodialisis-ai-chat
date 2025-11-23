import React from 'react';
import type { Route } from './+types/auth';
import AuthPage from '~/contents/auth/AuthPage';
import { authAction } from '~/loadersActions/auth';

export function meta(args: Route.MetaArgs) {
  return [{ title: 'Login' }, { name: 'description', content: 'Selamat Datang di AI Chat Untuk Hemodialysis!' }];
}

export async function action(args: { request: Request }) {
  return await authAction(args);
}

export default function Auth() {
  return <AuthPage />;
}
