import { NavLink } from 'react-router-dom';
import { Home, Search, LibrarySquare } from 'lucide-react';
import './TabBar.css';

export default function TabBar() {
  return (
    <div className="tab-bar">
      <NavLink to="/" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`} end>
        <Home size={24} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/search" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
        <Search size={24} />
        <span>Search</span>
      </NavLink>
      <NavLink to="/library" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
        <LibrarySquare size={24} />
        <span>Library</span>
      </NavLink>
    </div>
  );
}
