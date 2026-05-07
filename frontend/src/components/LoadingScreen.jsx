import styles from "./LoadingScreen.module.css";

function LoadingScreen({
  text = "Loading...",
  fullPage = false,
  small = false,
}) {
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