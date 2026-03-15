import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('/auth', 'routes/auth.tsx'),
  route('/chat', 'routes/chat.tsx'),
  route('/records', 'routes/records.tsx'),
  route('/api/user', 'routes/api/user.ts'),
  route('/api/chat', 'routes/api/chat.ts'),
  route('/api/chat-test', 'routes/api/chatTest.ts'),
  route('/api/chat-history', 'routes/api/chatHistory.ts'),
  route('/api/records', 'routes/api/records.ts'),
  route('/api/analyze', 'routes/api/analyze.ts'),
  route('/api/metrics', 'routes/api/metrics.ts'),
  route('/api/forgot-password', 'routes/api/forgot-password.ts'),
  route('/api/reset-password', 'routes/api/reset-password.ts'),
  route('/api/logout', 'routes/api/logout.ts'),
] satisfies RouteConfig;
