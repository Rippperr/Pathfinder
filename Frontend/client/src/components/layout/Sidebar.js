import React from 'react';
import { NavLink } from 'react-router-dom';
// import { LuLayoutDashboard, LuUser, LuLineChart, LuLogOut } from 'react-icons/lu'; // ICONS COMMENTED OUT
import './Sidebar.css';

const Sidebar = ({ isOpen, onLinkClick }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <span className="sidebar-logo">❑</span>
        <h2>Pathfinder</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/" onClick={onLinkClick}>
              {/* <LuLayoutDashboard /> */}
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile" onClick={onLinkClick}>
              {/* <LuUser /> */}
              <span>My Profile</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/paths" onClick={onLinkClick}>
              {/* <LuLineChart /> */}
              <span>Career Paths</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <NavLink to="/login">
            {/* <LuLogOut /> */}
            <span>Logout</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;