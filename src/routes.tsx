import type { ReactNode } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <Home />,
    visible: true,
  },
  {
    name: 'Explore',
    path: '/explore',
    element: <Home />,
    visible: true,
  },
  {
    name: 'Categories',
    path: '/categories',
    element: <Home />,
    visible: true,
  },
  {
    name: 'Login',
    path: '/login',
    element: <Login />,
    visible: false,
  },
  {
    name: 'Not Found',
    path: '*',
    element: <NotFound />,
    visible: false,
  },
];

export default routes;