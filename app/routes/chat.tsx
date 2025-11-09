import React from 'react';
import type { Route } from './+types/chat';
import ChatRoom from '~/contents/chatRoom/ChatRoom';

// eslint-disable-next-line no-unused-vars
export function meta(args: Route.MetaArgs) {
  return [
    { title: 'Hemodialysis Chat' },
    { name: 'description', content: 'Selamat Datang di AI Chat Untuk Hemodialysis!' },
  ];
}

export default function Chat() {
  return <ChatRoom />;
}
