import type { LoaderFunctionArgs } from 'react-router';
import { register } from '~/services/metrics.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const metrics = await register.metrics();

  return new Response(metrics, {
    headers: {
      'Content-Type': register.contentType,
    },
  });
}
