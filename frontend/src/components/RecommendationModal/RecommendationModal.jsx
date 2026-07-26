import styles from "./RecommendationModal.module.css";
import Modal from "../Modal";

export default function RecommendationModal({
  isOpen,
  onClose,
  explanation,
  isLoading,
  hasError,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h2 className={styles.title}>
          🤖 AI Recommendation
        </h2>

        {isLoading ? (
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