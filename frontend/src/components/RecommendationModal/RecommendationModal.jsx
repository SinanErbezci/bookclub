import styles from "./RecommendationModal.module.css";
import Modal from "../Modal";
import { Link } from "react-router-dom";

export default function RecommendationModal({
  isOpen,
  onClose,
  explanation,
  isLoading,
  hasError,
  user,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modalContent}>
      <div className={styles.container}>
        <h2 className={styles.title}>
          🤖 AI Recommendation
        </h2>

        {!user ? (
          <div className={styles.loginRequired}>
            <h4>🔒 Sign in required</h4>
            <p>
              AI explanations are available for signed-in users.
            </p>
            <Link
              to="/login"
              className="btn btn-primary"
              onClick={onClose}
            >
              Log In
            </Link>
          </div>
        ) : isLoading ? (
          <div className={styles.loading}>
            <div
              className="spinner-border"
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>

            <p>Generating explanation...</p>
          </div>
        ) : hasError ? (
          <div className={styles.error}>
            <p>
              Failed to generate an explanation.
              Please try again.
            </p>
          </div>
        ) : (
          <div className={styles.body}>
            <p>{explanation?.explanation}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}