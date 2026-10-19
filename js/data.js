let vocabPromise;
let kanjiPromise;

export function loadVocab() {
  if (!vocabPromise) {
    vocabPromise = fetch('./data/vocab.json')
      .then((response) => {
        if (!response.ok) throw new Error(`Vocabulary data request failed (${response.status})`);
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('Vocabulary data has an invalid format');
        return data;
      })
      .catch((error) => {
        throw new Error(`Could not load vocabulary data: ${error.message}`);
      });
  }
  return vocabPromise;
}

export function loadKanji() {
  if (!kanjiPromise) {
    kanjiPromise = fetch('./data/kanji.json')
      .then((response) => {
        if (!response.ok) throw new Error(`Kanji data request failed (${response.status})`);
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('Kanji data has an invalid format');
        return data;
      })
      .catch((error) => {
        throw new Error(`Could not load kanji data: ${error.message}`);
      });
  }
  return kanjiPromise;
}
