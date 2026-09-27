import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  ScrollRestoration,
} from 'react-router-dom';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LandingPage } from './pages/LandingPage';
import { HirePage } from './pages/HirePage';
import './index.css';

function LandingRoute() {
  return (
    <>
      <ScrollRestoration
        getKey={(location) =>
          location.pathname === '/' && !location.hash ? location.pathname : location.key
        }
      />
      <LandingPage />
    </>
  );
}

const router = createBrowserRouter([
  { path: '/', element: <LandingRoute /> },
  { path: '/hire', element: <HirePage /> },
  { path: '/app', element: <App /> },
  { path: '/app/*', element: <App /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
