import React from 'react';
import type { Route } from './+types/home';
import HomePage from '~/contents/home/HomePage';
import { homeAction, homeLoader } from '~/loadersActions/home';

export function meta(args: Route.MetaArgs) {
  return [
    { title: 'Hemodialysis AI' },
    { name: 'description', content: 'Selamat Datang di AI Chat Untuk Hemodialysis!' },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  return await homeLoader(args);
}

export async function action(args: { request: Request }) {
  return await homeAction(args);
}

export default function Home() {
  return <HomePage />;
}
