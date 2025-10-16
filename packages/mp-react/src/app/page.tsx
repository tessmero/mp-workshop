import Image from "next/image";
import styles from "./page.module.css";
import { MusicPlayer } from "./music-player";

export default function Home() {
  return (

    <div className={styles.page}>
      <main className={styles.main}>
        <MusicPlayer></MusicPlayer>
      </main>
    </div>
  );
}
