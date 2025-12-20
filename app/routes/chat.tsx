import React from 'react';
import type { Route } from './+types/chat';
import ChatPage from '~/contents/chat/ChatPage';

export function meta(args: Route.MetaArgs) {
  return [
    { title: 'Hemodialysis Chat' },
    { name: 'description', content: 'Selamat Datang di AI Chat Untuk Hemodialysis!' },
  ];
}

export default function Chat() {
  return <ChatPage />;
}
