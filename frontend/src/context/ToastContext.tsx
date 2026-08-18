import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import styles from "./ToastContext.module.css";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  visible: boolean;
}

interface ToastContextValue {
  addToast: (
    message: string,
    type?: ToastType,
  ) => void;
}

interface ToastProviderProps {
  children: ReactNode;
}

const ToastContext = createContext<
  ToastContextValue | undefined
>(undefined);

export function ToastProvider({
  children,
}: ToastProviderProps) {
  const EXIT_DURATION = 300;
  const VISIBLE_DURATION = 2500;

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (
    message: string,
    type: ToastType = "success",
  ): void => {
    const id = crypto.randomUUID();

    setToasts((prev) => [
      ...prev,
      { id, message, type, visible: true },
    ]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((toast) =>
          toast.id === id
            ? { ...toast, visible: false }
            : toast,
        ),
      );
    }, VISIBLE_DURATION);

    setTimeout(() => {
      setToasts((prev) =>
        prev.filter((toast) => toast.id !== id),
      );
    }, VISIBLE_DURATION + EXIT_DURATION);
  };

  const removeToast = (id: string): void => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id
          ? { ...toast, visible: false }
          : toast,
      ),
    );

    setTimeout(() => {
      setToasts((prev) =>
        prev.filter((toast) => toast.id !== id),
      );
    }, EXIT_DURATION);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      <div className={styles.container}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              ${styles.toast}
              ${styles[toast.type]}
              ${toast.visible ? styles.enter : styles.exit}
            `}
          >
            <span>{toast.message}</span>

            <button
              type="button"
              className={styles.close}
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast must be used within a ToastProvider",
    );
  }

  return context;
}