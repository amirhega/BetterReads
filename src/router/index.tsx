import { createBrowserRouter } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { ProtectedRoute } from '@/router/ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { BookPage } from '@/pages/BookPage';
import { LibraryPage } from '@/pages/LibraryPage';
import { DiaryPage } from '@/pages/DiaryPage';
import { RankingsPage } from '@/pages/RankingsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { LoginPage } from '@/pages/LoginPage';
import { SignUpPage } from '@/pages/SignUpPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    element: <PageLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/book/:olWorkKey', element: <BookPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignUpPage /> },
      { path: '/user/:username', element: <ProfilePage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/library', element: <LibraryPage /> },
          { path: '/diary', element: <DiaryPage /> },
          { path: '/rankings', element: <RankingsPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
