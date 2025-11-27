import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { supabase } from '@/db/supabase';
import routes from './routes';

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider client={supabase}>
          <ScrollToTop />
          <Toaster />
          <RequireAuth whiteList={['/', '/login', '/explore', '/search', '/pricing', '/newsletter', '/post/*', '/profile/*', '/payment-success', '*']}>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <Routes>
                  {routes.map((route, index) => (
                    <Route key={index} path={route.path} element={route.element} />
                  ))}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </RequireAuth>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
