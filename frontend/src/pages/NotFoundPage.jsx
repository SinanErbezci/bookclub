import { Link } from "react-router-dom";
import styles from "./NotFoundPage.module.css";

function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.icon}>
          📚
        </div>

        <h1 className={styles.title}>
          404
        </h1>

        <p className={styles.text}>
          This page could not be found.
        </p>

        <p className={styles.subtext}>
          It may have been removed, renamed,
          or never existed in the first place.
        </p>

        <div className={styles.actions}>
          <Link
            to="/"
            className="btn btn-primary"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;