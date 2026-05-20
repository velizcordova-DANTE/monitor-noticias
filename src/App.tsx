import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NewsPage } from './pages/NewsPage';
import { DailySummaryPage } from './pages/DailySummaryPage';
import { ExpressSummaryPage } from './pages/ExpressSummaryPage';
import { ResumenMananaPage } from './pages/ResumenMananaPage';
import { ResumenTardePage } from './pages/ResumenTardePage';
import { AnalisisMAEPage } from './pages/AnalisisMAEPage';
import { OfficialsPage } from './pages/OfficialsPage';
import { seedInitialData } from './lib/firestore';

export default function App() {
  useEffect(() => { seedInitialData(); }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/noticias" element={<NewsPage />} />
            <Route path="/resumenes" element={<DailySummaryPage />} />
            <Route path="/resumen-express" element={<ExpressSummaryPage />} />
            <Route path="/resumen-manana" element={<ResumenMananaPage />} />
            <Route path="/resumen-tarde" element={<ResumenTardePage />} />
            <Route path="/analisis-mae" element={<AnalisisMAEPage />} />
            <Route path="/funcionarios" element={<OfficialsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
