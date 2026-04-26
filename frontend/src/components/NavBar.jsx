import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../api/auth";
function NavBar() {
  const isAuthenticated = true;
  const { user, setUser } = useAuth();

  console.log(user?.username)
  async function handleLogout() {
    try {
      await logoutUser();
      setUser(null); // 🔥 critical
    } catch (err) {
      console.error(err);
    }
  }
  return (
    <header>
      <nav className="navbar navbar-expand-xl">
        <div className="container nav-contain d-flex align-items-center">

          {/* LOGO */}
          <Link to="/" className="brand-name">
            Book<span>Club</span>
          </Link>

          {/* SEARCH (DESKTOP ONLY) */}
          <div className="search-wrapper d-none d-xl-flex">
            <div className="search-bar">
              <div className="search-bar-input">
                <input
                  type="search"
                  placeholder="Search books..."
                />
                <button className="search-btn">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>
            </div>
          </div>
          {/* NAV OPTIONS (DESKTOP) */}
          <div className="nav-options d-none d-xl-flex ms-auto">

            {isAuthenticated ? (
              <>
                <Link className="nav-link" to="/profile">
                  Profile <i className="fa-solid fa-user"></i>
                </Link>

                <Link className="nav-link" to="/">
                  Browse
                </Link>

                <button className="nav-link" onClick={handleLogout}>
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                </button>
              </>
            ) : (
              <>
                <Link className="nav-link" to="/signup">
                  Sign Up
                </Link>

                <Link className="nav-link nav-login" to="/login">
                  Log In
                </Link>
              </>
            )}

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
              <div className="brand-name">
                BookClub
              </div>
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

                {isAuthenticated ? (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/profile">
                        Profile <i className="fa-solid fa-user"></i>
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link" to="/">
                        Browse
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link" to="/logout">
                        Logout <i className="fa-solid fa-arrow-right-from-bracket"></i>
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/signup">
                        Sign Up
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link nav-login" to="/login">
                        Log In
                      </Link>
                    </li>
                  </>
                )}

              </ul>

            </div>
          </div>

        </div>
      </nav>
    </header>
  );
}

export default NavBar;