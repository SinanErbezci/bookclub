import { useEffect, useState } from "react";

function Books() {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8000/api/books/")
        .then((res) => res.json())
        .then((data) => {
            setBooks(data.results);
        });
    }, []);

    return (
    <div>
      {books.map((book) => (
        <div key={book.id}>
          <h3>{book.title}</h3>
          <p>{book.author_name || book.author}</p>
          <p>⭐ {book.rating}</p>
        </div>
      ))}
    </div>
    )
}

export default Books;