import Skeleton from "../../components/Skeleton/Skeleton";
import CarouselSkeleton from "../../components/CarouselSection/CarouselSkeleton";
import CarouselSection from "../../components/CarouselSection/CarouselSection";

import styles from "./AuthorPage.module.css";

function AuthorPageSkeleton() {
    return (
        <div className="container mt-5">
            {/* HEADER */}
            <div className={styles.header}>
                <div className={styles.avatar}>
                    <Skeleton className={styles.skeletonAvatar} />
                </div>

                <div className={styles.info}>
                    <h1 className={styles.name}>
                        <Skeleton className={styles.skeletonName} />
                    </h1>

                    <p className={styles.meta}>
                        <Skeleton className={styles.skeletonMeta} />
                    </p>

                    <p className={styles.desc}>
                        <Skeleton className={styles.skeletonDesc} />
                    </p>
                </div>
            </div>

            {/* BOOKS */}
            <div className={styles.booksSection}>
                <CarouselSection loading={true}></CarouselSection>
            </div>
        </div>
    );
}

export default AuthorPageSkeleton;