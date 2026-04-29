import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const EXIT_DURATION = 300;
  const VISIBLE_DURATION = 2500;
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now();

    // add toast
    setToasts((prev) => [
      ...prev,
      { id, message, type, visible: true },
    ]);

    // start exit animation 
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, visible: false } : t
        )
      );
    }, VISIBLE_DURATION);

    // remove from DOM after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, VISIBLE_DURATION + EXIT_DURATION);
  };

  const removeToast = (id) => {
    setToasts((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, visible: false } : t
      )
    );

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      <div className="app-toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`app-toast ${toast.type} ${
              toast.visible ? "enter" : "exit"
            }`}
          >
            <span>{toast.message}</span>

            <button
              className="app-toast-close"
              onClick={() => removeToast(toast.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}