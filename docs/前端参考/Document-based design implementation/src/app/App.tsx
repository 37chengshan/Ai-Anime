import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import '../styles/theme.css'; // Just in case it's needed globally

export default function App() {
  return <RouterProvider router={router} />;
}
