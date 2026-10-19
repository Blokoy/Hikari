import { loadVocab } from './data.js';

const POS_LABELS = {
  n: 'noun',
  v1: 'ichidan verb',
  vt: 'transitive',
  vi: 'intransitive',
  'adj-i': 'i-adjective',
  'adj-na': 'na-adjective',
  adv: 'adverb'
};

function posLabel(code) {
  if (POS_LABELS[code]) return POS_LABELS[code];
  if (code.startsWith('v5')) return 'godan verb';
  return code;
}

function fieldText(value) {
  if (!Array.isArray(value)) return value || '';
  return value.map((item) => typeof item === 'string' ? item : item.text || '').filter(Boolean).join(' ');
}

function createCard(entry) {
  const card = document.createElement('article');
  card.className = 'word-card';

  const identity = document.createElement('div');
  const word = document.createElement('strong');
  word.textContent = entry.word;
  const reading = document.createElement('span');
  reading.textContent = `${entry.reading} · ${entry.romaji}`;
  identity.append(word, reading);

  const meaning = document.createElement('div');
  const meanings = document.createElement('h3');
  meanings.textContent = entry.meanings.join('; ');
  const partsOfSpeech = document.createElement('p');
  partsOfSpeech.textContent = (entry.pos || []).map(posLabel).join(' · ');
  meaning.append(meanings, partsOfSpeech);
  card.append(identity, meaning);

  const tag = document.createElement('span');
  tag.className = 'word-tag';
  tag.textContent = entry.level || 'N5';
  card.append(tag);

  if (entry.examples && entry.examples.length) {
    const details = document.createElement('details');
    details.style.gridColumn = '1 / -1';
    const summary = document.createElement('summary');
    summary.textContent = 'Example sentence';
    const example = document.createElement('p');
    example.textContent = `${entry.examples[0].ja} ${entry.examples[0].en}`;
    details.append(summary, example);
    card.append(details);
  }
  return card;
}

function renderResults(entries, list, count, emptyMessage) {
  list.replaceChildren();
  entries.forEach((entry) => list.appendChild(createCard(entry)));
  count.textContent = `Showing ${entries.length} of ${emptyMessage.total}`;
  emptyMessage.element.hidden = entries.length !== 0;
}

export function initializeDictionary() {
  const dictionaryInput = document.querySelector('#dictionary-input');
  const list = document.querySelector('#word-list');
  const status = document.createElement('p');
  const count = document.createElement('p');
  const empty = document.createElement('p');
  status.hidden = true;
  empty.hidden = true;
  empty.textContent = 'No words match your search.';
  list.before(status, count);
  list.after(empty);

  loadVocab().then((vocab) => {
    const update = () => {
      const query = dictionaryInput.value.trim().toLowerCase();
      const filtered = vocab.filter((entry) => {
        const searchable = [
          entry.word,
          entry.reading,
          entry.romaji,
          ...(entry.meanings || []),
          ...fieldText(entry.other_forms).split(' ')
        ].join(' ').toLowerCase();
        return !query || searchable.includes(query);
      });
      renderResults(filtered, list, count, { element: empty, total: vocab.length });
    };
    dictionaryInput.addEventListener('input', update);
    update();
  }).catch((error) => {
    status.textContent = error.message;
    status.hidden = false;
  });
}
