import Modal from "../../components/Modal";
import StarRating from "../../components/StarRating/StarRating";
import styles from "./ReviewModal.module.css"

export default function ReviewModal({ review, isOpen, onClose }) {
  if (!isOpen || !review) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modalContent}>
      <div className={styles.container}>
        <div className={styles.header}>
          <img className={styles.avatar} src="/assets/default-avatar.svg" alt="profile" />
          <h3>{review.user?.username || "You"}'s Review</h3>
        </div>

        <div className={styles.body}>
          <div className={styles.rating}>
            <StarRating
              value={review.rating}
              readOnly
            />
          </div>


          <p>{review.content}</p>
        </div>
      </div>
    </Modal>
  );
}