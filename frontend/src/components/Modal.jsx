import { useEffect, useState } from "react";

export default function Modal({ isOpen, onClose, children }) {
  const [visible, setVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);

      requestAnimationFrame(() => {
        setVisible(true);
      });
    } else {
      setVisible(false);

      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 200); // match CSS duration

      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={`modal-overlay ${visible ? "open" : ""}`}
      onClick={onClose}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>
  );
}