import styles from "./SkeletonCard.module.css"

function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.image} />

      <div className={styles.body}>
        <div className={`${styles.text} ${styles.title}`} />
        <div className={`${styles.text} ${styles.author}`} />
      </div>
    </div>
  );
}

export default SkeletonCard;