import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { LuAlignLeft, LuUser, LuSettings, LuLogOut } from 'react-icons/lu';
import { useUser } from '../../contexts/UserContext';
import './Header.css';

const Header = ({ onMenuClick }) => {
  const { profile } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
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
        <div className="header-icon-wrapper" onClick={onMenuClick}>
          <LuAlignLeft />
        </div>
        <h2>Welcome back, {profile?.name || 'User'}!</h2>
      </div>
      <div className="header-right" ref={dropdownRef}>
        <div 
          className="user-avatar-placeholder" 
          onClick={toggleDropdown}
        ></div>
        {isDropdownOpen && (
          <div className="profile-dropdown">
            <div className="dropdown-header">My Account</div>
            <ul>
              <li>
                <Link to="/profile" onClick={() => setIsDropdownOpen(false)}>
                  <LuUser /> <span>Profile</span>
                </Link>
              </li>
              <li>
                <Link to="/settings" onClick={() => setIsDropdownOpen(false)}>
                  <LuSettings /> <span>Settings</span>
                </Link>
              </li>
            </ul>
            <div className="dropdown-divider"></div>
            <ul>
              <li>
                <Link to="/login" onClick={() => setIsDropdownOpen(false)}>
                  <LuLogOut /> <span>Log out</span>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;