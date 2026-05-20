import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, fetchNews } from '../lib/firestore';
import { sortNewsHealthFirst, type News } from '../types';

export function Dashboard() {
  const [stats, setStats] = useState({ totalNews: 0, todayNews: 0, totalSummaries: 0, activeOfficials: 0 });
  const [latestNews, setLatestNews] = useState<News[]>([]);

  useEffect(() => {
    getDashboardStats().then(setStats);
    fetchNews().then((news) => setLatestNews(sortNewsHealthFirst(news).slice(0, 5)));
  }, []);

  const cards = [
    { label: 'Total Noticias', value: stats.totalNews, color: '#1a73e8' },
    { label: 'Noticias de Hoy', value: stats.todayNews, color: '#34a853' },
    { label: 'Resúmenes Creados', value: stats.totalSummaries, color: '#fbbc04' },
    { label: 'Funcionarios Activos', value: stats.activeOfficials, color: '#ea4335' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Panel de Control</h1>
        <p>Monitoreo de noticias - {new Date().toLocaleDateString('es-BO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="stats-grid">
        {cards.map((card) => (
          <div key={card.label} className="stat-card" style={{ borderTopColor: card.color }}>
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Últimas Noticias</h2>
          <Link to="/noticias" className="btn btn-sm">Ver todas</Link>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Fuente</th>
                <th>Categoría</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {latestNews.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted">
                    No hay noticias registradas
                  </td>
                </tr>
              )}
              {latestNews.map((n) => (
                <tr key={n.id}>
                  <td>
                    <a href={n.url} target="_blank" rel="noopener noreferrer" className="news-link">
                      {n.title}
                    </a>
                  </td>
                  <td>{n.source}</td>
                  <td><span className="badge">{n.category}</span></td>
                  <td>{new Date(n.date).toLocaleDateString('es-BO')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
