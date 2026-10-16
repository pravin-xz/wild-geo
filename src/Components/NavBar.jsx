import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";

const NavBar = ({ searchText, onSearchChange }) => {
  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <nav className="navbar sticky-top navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarTogglerDemo01"
          aria-controls="navbarTogglerDemo01"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
          <h3 className="navbar-brand mb-0" style={{fontWeight:"bold"}}>Wild Geographic</h3>

          <div className="navbar-nav me-auto mb-2 mb-lg-0">
            <Link to="/" className="btn btn-primary me-2 nav-item">
              Home
            </Link>
            <Link to="/about" className="btn btn-primary me-2 nav-item">
              About
            </Link>
            <Link to="/contact" className="btn btn-primary me-2 nav-item">
              Contact
            </Link>
            <Link to="/create" className="btn btn-success me-2 nav-item">
              Create
            </Link>
          </div>

          <form className="d-flex" role="search" onSubmit={handleSearch}>
            <input
              className="form-control me-2"
              type="search"
              placeholder="Search here..."
              aria-label="Search"
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </form>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
