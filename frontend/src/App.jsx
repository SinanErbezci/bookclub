import { Routes, Route } from "react-router-dom";
import Browse from "./pages/Browse";
import BookPage from "./pages/BookPage";
import AuthorPage from "./pages/AuthorPage";
import GenrePage from "./pages/GenrePage";
import NavBar from "./components/NavBar";

function App() {
  return (
    <>
      <NavBar />

      <Routes>
        <Route path="/" element={<Browse />} />
        <Route path="/books/:id" element={<BookPage />} />
        <Route path="/authors/:id" element={<AuthorPage />} />
        <Route path="/genres/:id" element={<GenrePage />} />
      </Routes>
    </>
  );
}

export default App; 