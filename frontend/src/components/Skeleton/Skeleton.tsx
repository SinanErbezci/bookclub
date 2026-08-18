import styles from "./Skeleton.module.css";

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      aria-hidden="true"
    />
  );
}

export default Skeleton;