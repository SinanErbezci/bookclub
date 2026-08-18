import { Route, Routes } from "react-router-dom";

import Browse from "./pages/Browse/Browse";
import BookPage from "./pages/BookPage/BookPage";
import SeriesPage from "./pages/SeriesPage/SeriesPage";
import AuthorPage from "./pages/AuthorPage/AuthorPage";
import GenrePage from "./pages/GenrePage/GenrePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignUpPage";
import NavBar from "./components/NavBar";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import SearchPage from "./pages/SearchPage/SearchPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import NotFoundPage from "./pages/NotFoundPage";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="app">
      <NavBar />

      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={<Browse />}
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/:id"
            element={<ProfilePage />}
          />

          <Route
            path="/books/:id"
            element={<BookPage />}
          />

          <Route
            path="/authors/:id"
            element={<AuthorPage />}
          />

          <Route
            path="/genres/:id"
            element={<GenrePage />}
          />

          <Route
            path="/search"
            element={<SearchPage />}
          />

          <Route
            path="/series/:id"
            element={<SeriesPage />}
          />

          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <SignupPage />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="*"
            element={<NotFoundPage />}
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;