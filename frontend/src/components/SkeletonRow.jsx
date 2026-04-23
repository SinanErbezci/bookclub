import SkeletonCard from "./SkeletonCard";

function SkeletonRow({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  );
}

export default SkeletonRow;