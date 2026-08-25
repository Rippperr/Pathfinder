import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../supabaseClient';
import './Header.css';

const Header = ({ onMenuClick }) => {
  const { profile } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsDropdownOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <header className="main-header">
      <div className="header-left">
        <button className="hamburger-menu-button" onClick={onMenuClick}>
          <span>☰</span>
        </button>
        <h2 className="header-greeting">Welcome back, {profile?.name || 'User'}!</h2>
      </div>
      <div className="header-right" ref={dropdownRef}>
        <div className="user-avatar-container" onClick={toggleDropdown}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="User Avatar" className="user-avatar-image" />
          ) : (
            <div className="user-avatar-placeholder">👤</div>
          )}
        </div>
        {isDropdownOpen && (
          <div className="profile-dropdown">
            <div className="dropdown-header">My Account</div>
            <ul>
              <li>
                <Link to="/profile" onClick={() => setIsDropdownOpen(false)}>
                  <span className="dropdown-icon">👤</span> <span>Profile</span>
                </Link>
              </li>
              <li>
                <Link to="/settings" onClick={() => setIsDropdownOpen(false)}>
                  <span className="dropdown-icon">⚙️</span> <span>Settings</span>
                </Link>
              </li>
            </ul>
            <div className="dropdown-divider"></div>
            <ul>
              <li>
                <button onClick={handleLogout} className="logout-button">
                  <span className="dropdown-icon">➡️</span> <span>Log out</span>
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;