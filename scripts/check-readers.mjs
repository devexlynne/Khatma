import fetch from 'node-fetch';

const readers = [
  'ar.alafasy',
  'ar.abdulbasitmurattal',
  'ar.abdulbasit',
  'ar.husary',
  'ar.minshawy',
  'ar.hani',
  'ar.shaatree',
  'ar.maher',
  'ar.sudais',
  'ar.khalil',
  'ar.tariq',
];

(async () => {
  for (const reader of readers) {
    const url = `https://api.alquran.cloud/v1/juz/2/${reader}`;
    try {
      const res = await fetch(url);
      const json = await res.json();
      const has = Array.isArray(json?.data?.ayahs) && json.data.ayahs.length > 0;
      console.log(reader, res.status, has, json?.code || '', json?.status || '');
    } catch (err) {
      console.log(reader, 'ERR', err.message);
    }
  }
})();
