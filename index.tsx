
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

const patchFetchForReadableStreamUploads = () => {
  if (typeof window === 'undefined' || typeof window.fetch !== 'function') {
    return;
  }

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const body = init?.body;
    if (typeof ReadableStream !== 'undefined' && body instanceof ReadableStream) {
      const bufferedBody = await new Response(body).arrayBuffer();
      const { duplex, ...rest } = (init || {}) as RequestInit & { duplex?: string };
      return originalFetch(input, { ...rest, body: bufferedBody });
    }

    return originalFetch(input, init);
  };
};

patchFetchForReadableStreamUploads();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
