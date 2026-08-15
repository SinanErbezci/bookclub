import Skeleton from "../Skeleton/Skeleton";
import styles from "./CarouselSkeleton.module.css";

function CarouselSkeleton({ count = 5 }) {
  return (
    <div className={styles.container}>
      <div className={styles.row}>
        {Array.from({ length: count }).map((_, index) => (
          <div className={styles.card} key={index}>
            <Skeleton className={styles.image} />

            <div className={styles.body}>
              <Skeleton className={styles.title} />
              <Skeleton className={styles.author} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CarouselSkeleton;