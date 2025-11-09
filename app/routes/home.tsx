import React from 'react';
import type { Route } from './+types/home';
import HomePage from '~/contents/home/HomePage';

// eslint-disable-next-line no-unused-vars
export function meta(args: Route.MetaArgs) {
  return [
    { title: 'Hemodialysis AI' },
    { name: 'description', content: 'Selamat Datang di AI Chat Untuk Hemodialysis!' },
  ];
}

export default function Home() {
  return <HomePage />;
}
