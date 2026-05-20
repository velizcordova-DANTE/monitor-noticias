import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Panel', icon: '📊' },
  { to: '/noticias', label: 'Noticias', icon: '📰' },
  { to: '/resumenes', label: 'Resúmenes', icon: '📋' },
  { to: '/resumen-manana', label: 'Res. Mañana', icon: '🌅' },
  { to: '/resumen-tarde', label: 'Res. Tarde', icon: '🌆' },
  { to: '/analisis-mae', label: 'Análisis MAE', icon: '📈' },
  { to: '/funcionarios', label: 'Funcionarios', icon: '👥' },
];

export function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src="/images/logo-asuss.png" alt="ASUSS" className="sidebar-logo-img" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-inst">
          <small>Autoridad de Supervisión de la Seguridad Social de Corto Plazo</small>
        </div>
        <button className="btn-logout" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
