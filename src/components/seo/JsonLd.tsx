/**
 * JSON-LD <script> render eder. `data` her zaman bu kod tabanı içindeki
 * schema.ts üreticilerinden gelir (kullanıcı girdisi değil), bu yüzden
 * dangerouslySetInnerHTML güvenlidir.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
