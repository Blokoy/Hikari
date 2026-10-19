import { loadKanji } from './data.js';

function valuesText(values, separator = ', ') {
  return (values || []).join(separator);
}

function createKanjiCard(entry) {
  const card = document.createElement('div');
  const character = document.createElement('strong');
  character.textContent = entry.character;
  card.appendChild(character);

  const meanings = document.createElement('span');
  meanings.textContent = valuesText(entry.meanings);
  card.appendChild(meanings);

  const details = document.createElement('p');
  const readings = document.createElement('span');
  readings.textContent = `On: ${valuesText(entry.onyomi)} · Kun: ${valuesText(entry.kunyomi)}`;
  const stats = document.createElement('span');
  const statParts = [`${entry.strokes} strokes`];
  if (entry.grade !== undefined && entry.grade !== null && entry.grade !== '') statParts.push(`Grade ${entry.grade}`);
  stats.textContent = statParts.join(' · ');
  const words = document.createElement('span');
  words.textContent = `Words: ${valuesText((entry.words || []).slice(0, 4))}`;
  details.append(readings, stats, words);
  card.appendChild(details);
  return card;
}

export function initializeKanji() {
  const input = document.querySelector('#kanji-input');
  const grid = document.querySelector('#kanji-grid');
  const count = document.createElement('p');
  const empty = document.createElement('p');
  const error = document.createElement('p');
  empty.textContent = 'No kanji match your search.';
  empty.hidden = true;
  error.hidden = true;
  grid.before(count);
  grid.after(empty, error);

  loadKanji().then((kanji) => {
    const update = () => {
      const query = input.value.trim().toLowerCase();
      const filtered = kanji.filter((entry) => [
        entry.character,
        ...(entry.onyomi || []),
        ...(entry.kunyomi || []),
        ...(entry.meanings || []),
        ...(entry.words || [])
      ].join(' ').toLowerCase().includes(query));
      grid.replaceChildren(...filtered.map(createKanjiCard));
      count.textContent = `Showing ${filtered.length} of ${kanji.length}`;
      empty.hidden = filtered.length !== 0;
    };
    input.addEventListener('input', update);
    update();
  }).catch((loadError) => {
    error.textContent = loadError.message;
    error.hidden = false;
  });
}
