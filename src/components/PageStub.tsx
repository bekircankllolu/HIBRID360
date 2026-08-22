import styles from "./PageStub.module.css";

/**
 * Faz 0 routing iskeleti — gerçek sayfa içeriği ilgili fazda eklenecek.
 * Görünür sahte/placeholder metin yazılmaz; yalnızca başlık render edilir.
 */
export function PageStub({ title }: { title: string }) {
  return (
    <div className={styles.stub}>
      <h1>{title}</h1>
    </div>
  );
}
