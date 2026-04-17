import { Link } from "react-router-dom";

function NavBar() {
  const isAuthenticated = true;

  return (
    <header>
      <nav className="navbar navbar-expand-xl flex-nowrap">
        <div className="container-fluid">

          {/* Logo */}
          <Link to="/">
            <img className="brand-img me-2 ms-3" src="/images/logo.svg" alt="logo" />
          </Link>

          {/* Search */}
          <div className="container search-bar">
            <div className="input-group search-bar-input">
              <input
                className="form-control"
                type="search"
                placeholder="Search"
              />
              <button className="btn search-btn" type="button">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>
          </div>

          {/* Offcanvas */}
          <div className="offcanvas offcanvas-end" id="top-navbar">
            <div className="d-flex justify-content-between p-3">
              <img className="brand-img" src="/images/logo.svg" alt="logo" />
              <button className="btn-close" data-bs-dismiss="offcanvas"></button>
            </div>

            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">

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
                    <Link className="nav-link" to="/search">
                      Search <i className="fa-solid fa-magnifying-glass"></i>
                    </Link>
                  </li>

                  <li className="nav-item">
                    <Link className="nav-link" to="/logout">
                      <i className="fa-solid fa-arrow-right-from-bracket"></i>
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

          {/* Toggle */}
          <button
            className="navbar-toggler ms-3"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#top-navbar"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

        </div>
      </nav>
    </header>
  );
}

export default NavBar;