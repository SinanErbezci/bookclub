import Skeleton from "../../components/Skeleton/Skeleton";
import styles from "./BookPage.module.css";

function BookPageSkeleton() {
    return (
        <div className="container mt-5">
            <div className={styles.layout}>

                {/* LEFT */}
                <div className={styles.coverWrapper}>
                    <Skeleton className={styles.skeletonCover} />
                    <Skeleton className={styles.skeletonRating} />
                </div>

                {/* RIGHT */}
                <div className={styles.info}>
                    <h2>
                    <Skeleton className={styles.skeletonTitle} />
                    </h2>

                    <h5>
                    <Skeleton className={styles.skeletonAuthor} />
                    </h5>

                    <div className={styles.meta}>
                        <Skeleton className={styles.skeletonMeta} />
                    </div>

                    <div className={styles.series}>
                        <Skeleton className={styles.skeletonSeries} />
                    </div>

                    <div className={styles.genres}>
                        <Skeleton className={styles.skeletonGenre} />
                        <Skeleton className={styles.skeletonGenre} />
                        <Skeleton className={styles.skeletonGenre} />
                    </div>

                    <div className={styles.description}>
                        <Skeleton className={styles.skeletonDescriptionLine} />
                        <Skeleton className={styles.skeletonDescriptionLine} />
                        <Skeleton className={styles.skeletonDescriptionLine} />
                        <Skeleton className={styles.skeletonDescriptionLine} />
                        <Skeleton className={styles.skeletonDescriptionLine} />
                    </div>
                </div>

            </div>
        </div>
    );
}

export default BookPageSkeleton;