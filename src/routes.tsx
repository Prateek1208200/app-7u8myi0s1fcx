import type { ReactNode } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import CreatePost from './pages/CreatePost';
import PostView from './pages/PostView';
import Pricing from './pages/Pricing';
import PaymentSuccess from './pages/PaymentSuccess';
import Analytics from './pages/Analytics';
import Search from './pages/Search';
import Newsletter from './pages/Newsletter';

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
    name: 'Search',
    path: '/search',
    element: <Search />,
    visible: true,
  },
  {
    name: 'Pricing',
    path: '/pricing',
    element: <Pricing />,
    visible: true,
  },
  {
    name: 'Newsletter',
    path: '/newsletter',
    element: <Newsletter />,
    visible: true,
  },
  {
    name: 'Create Post',
    path: '/create',
    element: <CreatePost />,
    visible: false,
  },
  {
    name: 'Post View',
    path: '/post/:slug',
    element: <PostView />,
    visible: false,
  },
  {
    name: 'Analytics',
    path: '/analytics',
    element: <Analytics />,
    visible: false,
  },
  {
    name: 'Payment Success',
    path: '/payment-success',
    element: <PaymentSuccess />,
    visible: false,
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