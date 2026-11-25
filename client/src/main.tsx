import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './Components/ProtectedRoute';
import AdminRoute from './Components/AdminRoute';
import './index.css';
import NotFound from './Components/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, lazy: async () => ({ Component: (await import('./pages/Home')).default }) },
      { path: 'courses', lazy: async () => ({ Component: (await import('./pages/Courses')).default }) },
      { path: 'courses/:id', lazy: async () => ({ Component: (await import('./pages/CourseDetails')).default }) },
      { path: 'login', lazy: async () => ({ Component: (await import('./pages/Login')).default }) },
      { path: 'register', lazy: async () => ({ Component: (await import('./pages/Register')).default }) },
      {
        path: 'my-courses',
        lazy: async () => {
          const { default: MyCourses } = await import('./pages/MyCourses');
          return { Component: () => <ProtectedRoute><MyCourses /></ProtectedRoute> };
        },
      },
      {
        path: 'admin',
        lazy: async () => {
          const { default: AdminDashboard } = await import('./pages/admin/AdminDashboard');
          return { Component: () => <AdminRoute><AdminDashboard /></AdminRoute> };
        },
      },
      {
        path: 'admin/courses/new',
        lazy: async () => {
          const { default: CourseForm } = await import('./pages/admin/CourseForm');
          return { Component: () => <AdminRoute><CourseForm /></AdminRoute> };
        },
      },
      {
        path: 'admin/courses/:id/edit',
        lazy: async () => {
          const { default: CourseForm } = await import('./pages/admin/CourseForm');
          return { Component: () => <AdminRoute><CourseForm /></AdminRoute> };
        },
      },
    ],
  },
  {
    path : "*",
    element : <NotFound />
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);