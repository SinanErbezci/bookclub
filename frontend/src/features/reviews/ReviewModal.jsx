import Modal from "../../components/Modal";


export default function ReviewModal({ review, isOpen, onClose }) {
  if (!isOpen || !review) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="review-modal-header">
        <img src="/assets/default-avatar.svg" alt="profile" />
        <h3>{review.user?.username || "You"}'s Review</h3>
      </div>

      <div className="review-modal-body">
        <div className="star-outer">
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