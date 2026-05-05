import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function NavBar() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const isAuthenticated = !!user;

  async function handleLogout() {
    try {
      await logout();
      addToast("Logged out", "success");
      navigate("/login");
    } catch {
      addToast("Logout failed", "error");
    }
  }

  const getNavClass = ({ isActive }) =>
    "nav-link " + (isActive ? "active" : "");

  const renderNavLinks = () => {
    if (isAuthenticated) {
      return (
        <>
          <NavLink to="/profile" className={getNavClass}>
            Profile <i className="fa-solid fa-user"></i>
          </NavLink>

          <NavLink to="/" end className={getNavClass}>
            Browse
          </NavLink>

          <button className="nav-link" onClick={handleLogout}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
          </button>
        </>
      );
    }

    return (
      <>
        <NavLink to="/signup" className={getNavClass}>
          Sign Up
        </NavLink>

        <Link className="nav-link nav-login" to="/login">
          Log In
        </Link>
      </>
    );
  };

  return (
    <header>
      <nav className="navbar navbar-expand-xl">
        <div className="container nav-contain d-flex align-items-center">

          {/* LOGO */}
          <Link to="/" className="brand-name">
            Book<span>Club</span>
          </Link>

          {/* SEARCH (DESKTOP) */}
          <div className="search-wrapper d-none d-xl-flex">
            <div className="search-bar">
              <div className="search-bar-input">
                <input type="search" placeholder="Search books..." />
                <button className="search-btn">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>
            </div>
          </div>

          {/* DESKTOP NAV */}
          <div className="nav-options d-none d-xl-flex ms-auto">
            {renderNavLinks()}
          </div>

          {/* MOBILE TOGGLE */}
          <button
            className="navbar-toggler d-xl-none"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#mobileMenu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* MOBILE MENU */}
          <div
            className="offcanvas offcanvas-end d-xl-none"
            id="mobileMenu"
          >
            <div className="offcanvas-header">
              <div className="brand-name">BookClub</div>
              <button
                className="btn-close"
                data-bs-dismiss="offcanvas"
              ></button>
            </div>

            <div className="offcanvas-body">

              {/* MOBILE SEARCH */}
              <div className="search-bar mb-3">
                <div className="search-bar-input">
                  <input type="search" placeholder="Search..." />
                  <button className="search-btn">
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </button>
                </div>
              </div>

              <ul className="navbar-nav">
                <li className="nav-item d-flex flex-column">
                  {renderNavLinks()}
                </li>
              </ul>

            </div>
          </div>

        </div>
      </nav>
    </header>
  );
}

export default NavBar;