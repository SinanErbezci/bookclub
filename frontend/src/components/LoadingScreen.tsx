import styles from "./LoadingScreen.module.css";

interface LoadingScreenProps {
  text?: string;
  fullPage?: boolean;
  small?: boolean;
}

function LoadingScreen({
  text = "Loading...",
  fullPage = false,
  small = false,
}: LoadingScreenProps) {
  return (
    <div
      className={`
        ${styles.wrapper}
        ${fullPage ? styles.fullPage : ""}
        ${small ? styles.small : ""}
      `}
    >
      <div className={styles.loader} />

      <p className={styles.text}>
        {text}
      </p>
    </div>
  );
}

export default LoadingScreen;