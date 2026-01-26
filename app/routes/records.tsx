import React from 'react';
import type { Route } from './+types/records';
import RecordsPage from '~/contents/records/RecordsPage';

export function meta(args: Route.MetaArgs) {
  return [{ title: 'Catatan Kesehatan - Hemodialysis' }, { name: 'description', content: 'Catatan kesehatan Anda' }];
}

export default function Records() {
  return <RecordsPage />;
}
