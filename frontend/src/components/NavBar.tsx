import { useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import SearchBar from "./SearchBar/SearchBar";
import styles from "./NavBar.module.css";

function NavBar() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const isAuthenticated = !!user;

  async function handleLogout(): Promise<void> {
    try {
      await logout();
      addToast("Logged out", "success");
      navigate("/login");
    } catch {
      addToast("Logout failed", "error");
    }
  }

  useEffect(() => {
    function handleResize(): void {
      if (window.innerWidth >= 992) {
        const offcanvasEl =
          document.getElementById("mobileMenu");

        if (!offcanvasEl) return;

        const offcanvas =
          window.bootstrap?.Offcanvas.getInstance(
            offcanvasEl,
          );

        offcanvas?.hide();
      }
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener(
        "resize",
        handleResize,
      );
    };
  }, []);

  const getNavClass = ({
    isActive,
  }: {
    isActive: boolean;
  }): string =>
    `${styles.link} ${isActive ? styles.active : ""}`;

  const renderNavLinks = () => {
    if (isAuthenticated) {
      return (
        <>
          <NavLink
            to="/profile"
            className={getNavClass}
          >
            Profile
          </NavLink>

          <NavLink
            to="/"
            end
            className={getNavClass}
          >
            Browse
          </NavLink>

          <button
            className={styles.link}
            onClick={handleLogout}
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
          </button>
        </>
      );
    }

    return (
      <>
        <NavLink
          to="/signup"
          className={getNavClass}
        >
          Sign Up
        </NavLink>

        <Link
          className={`${styles.link} ${styles.login}`}
          to="/login"
        >
          Log In
        </Link>
      </>
    );
  };

  return (
    <header>
      <nav
        className={`${styles.navbar} navbar navbar-expand-lg`}
      >
        <div
          className={`${styles.container} container`}
        >
          <Link
            to="/"
            className={styles.brand}
          >
            Book<span>Club</span>
          </Link>

          <div className="d-none d-lg-flex flex-fill justify-content-center px-4">
            <SearchBar />
          </div>

          <div
            className={`${styles.options} d-none d-lg-flex ms-auto`}
          >
            {renderNavLinks()}
          </div>

          <button
            className="navbar-toggler d-lg-none"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#mobileMenu"
          >
            <span
              className={`navbar-toggler-icon ${styles.togglerIcon}`}
            ></span>
          </button>

          <div
            className="offcanvas offcanvas-end d-lg-none"
            id="mobileMenu"
          >
            <div className="offcanvas-header">
              <div className={styles.brand}>
                BookClub
              </div>

              <button
                className="btn-close"
                data-bs-dismiss="offcanvas"
              ></button>
            </div>

            <div className="offcanvas-body">
              <div className="search-bar mb-3">
                <SearchBar />
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