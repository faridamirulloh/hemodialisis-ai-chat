import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('auth', 'routes/auth.tsx'),
  route('chat', 'routes/chat.tsx'),
  route('records', 'routes/records.tsx'),
  route('api/user', 'routes/api/user.ts'),
  route('api/chat', 'routes/api/chat.ts'),
  route('api/chat-history', 'routes/api/chatHistory.ts'),
  route('api/records', 'routes/api/records.ts'),
  route('api/analyze', 'routes/api/analyze.ts'),
] satisfies RouteConfig;
