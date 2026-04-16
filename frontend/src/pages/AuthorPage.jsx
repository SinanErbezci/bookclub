import { useParams } from "react-router-dom";

function AuthorPage() {
  const { id } = useParams();

  return <div>Author ID: {id}</div>;
}

export default AuthorPage;