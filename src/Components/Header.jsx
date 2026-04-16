import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
  return (
    <>
      <nav className="header-nav">
        <span className="logo">
          <img className="logo-img" src="/mainlogo.png" alt="logo" />
          <h1>Resume Analyzer</h1>
        </span>
        <div className="nav-links">
          <Link to="/about">About</Link>
          <Link to="/analyze">Analyze Resume</Link>
          <Link to="/projects">Projects</Link>
        </div>
      </nav>
    </>
  );
};

export default Header;
