import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import styles from "./Modal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  className = "",
}: ModalProps) {
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
      }, 200);

      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={`${styles.overlay} ${visible ? styles.open : ""}`}
      onClick={onClose}
    >
      <div
        className={`${styles.content} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={styles.close}
          onClick={onClose}
        >
          ×
        </button>

        {children}
      </div>
    </div>
  );
}