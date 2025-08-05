import { Link } from 'react-router-dom';

export default function Navigation() {
  return (
    <nav style={{ padding: '1rem', background: '#eee' }}>
      <Link to="/" style={{ marginRight: '1rem' }}>Главная</Link>
      <Link to="/staking" style={{ marginRight: '1rem' }}>Стейкинг</Link>
      <Link to="/courses">Курсы</Link>
    </nav>
  );
}