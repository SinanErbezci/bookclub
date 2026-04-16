import { useParams } from "react-router-dom";

function GenrePage() {
  const { id } = useParams();

  return <div>Genre ID: {id}</div>;
}

export default GenrePage;