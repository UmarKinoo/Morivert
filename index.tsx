import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './AppRouter';
import { ToastProvider } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Reuse existing root when HMR re-executes this module (avoids "createRoot() on a container that has already been passed to createRoot()")
const root =
  (rootElement as HTMLElement & { _reactRoot?: ReactDOM.Root })._reactRoot ??
  (() => {
    const r = ReactDOM.createRoot(rootElement);
    (rootElement as HTMLElement & { _reactRoot?: ReactDOM.Root })._reactRoot = r;
    return r;
  })();

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
