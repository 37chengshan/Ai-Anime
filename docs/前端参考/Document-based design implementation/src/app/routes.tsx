import React from 'react';
import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { WorkDetail } from './pages/WorkDetail';
import { Profile } from './pages/Profile';
import { Pricing } from './pages/Pricing';
import { Upload } from './pages/Upload';
import { Discover } from './pages/Discover';

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "work/:id", Component: WorkDetail },
      { path: "profile/:id?", Component: Profile },
      { path: "pricing", Component: Pricing },
      { path: "upload", Component: Upload },
      { path: "discover", Component: Discover },
      { path: "*", Component: () => <div className="p-20 text-center text-2xl font-bold text-gray-500">404 - Page Not Found</div> },
    ],
  },
]);
