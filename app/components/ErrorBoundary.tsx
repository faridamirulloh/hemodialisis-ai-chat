import React from 'react';
import { Alert, Button } from 'antd';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

type ErrorBoundaryProps = {
  customMessage?: string;
};

function ErrorBoundaryComponent({ customMessage }: ErrorBoundaryProps) {
  const error = useRouteError();
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details = error.status === 404 ? 'The requested page could not be found.' : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <Alert
      message={customMessage || message}
      description={
        <>
          <p>{details}</p>
          {stack && (
            <pre className="w-full p-4 overflow-x-auto">
              <code>{stack}</code>
            </pre>
          )}
          <Button type="primary">
            <Link to="/">Back to Home</Link>
          </Button>
        </>
      }
      type="error"
      showIcon
    />
  );
}

export default ErrorBoundaryComponent;
