import Skeleton from "./Skeleton/Skeleton";
import styles from "./SkeletonCard.module.css";

function SkeletonCard() {
  return (
    <div className={styles.card}>
      <Skeleton className={styles.image} />

      <div className={styles.body}>
        <Skeleton className={`${styles.text} ${styles.title}`} />
        <Skeleton className={`${styles.text} ${styles.author}`} />
      </div>
    </div>
  );
}

export default SkeletonCard;