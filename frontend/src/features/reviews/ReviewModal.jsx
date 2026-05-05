import Modal from "../../components/Modal";
import styles from "./ReviewModal.module.css"

export default function ReviewModal({ review, isOpen, onClose }) {
  if (!isOpen || !review) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.header}>
        <img className={styles.avatar} src="/assets/default-avatar.svg" alt="profile" />
        <h3>{review.user?.username || "You"}'s Review</h3>
      </div>

      <div className={styles.body}>
        <div className="star-outer" style={{ alignSelf: "center"}}>
          <div
            className="star-inner"
            style={{ width: `${(review.rating / 5) * 100}%` }}
          />
        </div>

        <p>{review.content}</p>
      </div>
    </Modal>
  );
}