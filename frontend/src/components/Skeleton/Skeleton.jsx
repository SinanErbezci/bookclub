import styles from "./Skeleton.module.css";

function Skeleton({ className = "" }) {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      aria-hidden="true"
    />
  );
}

export default Skeleton;