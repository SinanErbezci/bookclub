import { useParams } from "react-router-dom";

function BookPage() {
  const { id } = useParams();

  return <div>Book ID: {id}</div>;
}

export default BookPage;