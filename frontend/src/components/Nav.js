import React from 'react';
import { Link } from 'react-router-dom';

function Nav() {
  return (
    <div className="sidebar">
      <div className="logo">
        <h2>LOGO</h2>
      </div>
      <ul className="nav flex-column">
        <li className="nav-item">
          <Link to="/" className="nav-link">Current Issues</Link>
        </li>
        <li className="nav-item">
          <Link to="/govt-issues" className="nav-link">Govt. Issues</Link>
        </li>
        <li className="nav-item">
          <Link to="/tweets" className="nav-link">Solved Issues</Link>
        </li>
        <li className="nav-item">
          <Link to="/reports" className="nav-link">Reports</Link>
        </li>
        <li className="nav-item">
          <Link to="/community-service" className="nav-link">Community Service</Link>
        </li>
        <li className="nav-item">
          <Link to="/contact-us" className="nav-link">Contact Us</Link>
        </li>
      </ul>
      <div className="bottom-options">
        <button className="btn btn-dark w-100">Dark Mode</button>
        <button className="btn btn-secondary w-100">Profile</button>
        <button className="btn btn-danger w-100">Log Out</button>
      </div>
    </div>
  );
}

export default Nav;
