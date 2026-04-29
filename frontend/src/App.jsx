import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Browse from "./pages/Browse";
import BookPage from "./pages/BookPage";
import AuthorPage from "./pages/AuthorPage";
import GenrePage from "./pages/GenrePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignUpPage";
import NavBar from "./components/NavBar";
import { AuthProvider } from "./context/AuthContext";
import { useEffect } from "react";

function App() {
  return (
    <>
      <NavBar />

      <Routes>
        <Route path="/" element={<Browse />} />
        <Route path="/book/:id" element={<BookPage />} />
        <Route path="/authors/:id" element={<AuthorPage />} />
        <Route path="/genres/:id" element={<GenrePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </>
  );
}

export default App; 

// | Concept | Meaning                    |
// | ------- | -------------------------- |
// | Router  | enables navigation system  |
// | Routes  | decides which page to show |
// | Route   | defines URL → component    |
// | :id     | dynamic variable from URL  |
