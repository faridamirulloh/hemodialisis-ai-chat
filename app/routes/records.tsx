import React from 'react';
import type { Route } from './+types/records';
import RecordsPage from '~/contents/records/RecordsPage';

export function meta(args: Route.MetaArgs) {
  return [
    { title: 'Riwayat Catatan - Hemodialysis' },
    { name: 'description', content: 'Riwayat catatan kesehatan hemodialisis Anda' },
  ];
}

export default function Records() {
  return <RecordsPage />;
}
