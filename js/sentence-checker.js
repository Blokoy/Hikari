import { sentenceExamples, romajiWords, kanaRomaji } from './data/sentence-data.js';
import { escapeHtml } from './utils.js';

function analyzeSentence(sentence) {
  const errors = [];
  const tips = [];
  const trimmed = sentence.trim();
  const addError = (start, end, message) => errors.push({ start, end, message });
  const punctuationStart = trimmed.length ? sentence.lastIndexOf(trimmed) + trimmed.length - 1 : 0;

  if (!trimmed) return { errors: [], tips: ['Start with a simple pattern such as わたしは りんごを たべます。'], structure: 'Topic は + detail + verb ます。' };
  if (!/[。！？.!?]$/.test(trimmed)) {
    addError(punctuationStart + 1, punctuationStart + 1, 'Finish the sentence with 。 or a question mark.');
    tips.push('Add Japanese punctuation: 。 for a statement or ？ for a question.');
  }
  if (/(はは|がが|をを|にに|でで)/.test(trimmed)) {
    const duplicate = trimmed.match(/(は|が|を|に|で)\1/);
    const start = sentence.indexOf(duplicate[0]);
    addError(start, start + duplicate[0].length, `Use ${duplicate[1]} only once here.`);
    tips.push(`Check the repeated particle 「${duplicate[1]}」 and remove the extra one.`);
  }
  const missingObjectParticle = trimmed.match(/([一-龯ぁ-んァ-ン]+)(たべます|飲みます|のみます|見ます|みます|読みます|よみます|買います|かいます)([。！？.!?])?$/);
  if (missingObjectParticle && !trimmed.includes('を')) {
    const start = sentence.lastIndexOf(missingObjectParticle[1]);
    addError(start, start + missingObjectParticle[1].length, 'This object needs を before the verb.');
    tips.push(`Use 「${missingObjectParticle[1]}を${missingObjectParticle[2]}」 for an object + action.`);
  }
  if (/^[^。！？.!?]*(は|が)\s*$/.test(trimmed)) {
    const start = sentence.lastIndexOf(trimmed);
    addError(start, start + trimmed.length, 'Add information after the topic particle.');
    tips.push('After は or が, add the detail you want to describe.');
  }
  if (!errors.length) {
    tips.push('Nice structure. Try swapping the topic, object, or verb to make another sentence.');
  }
  let structure = 'Topic は + detail + verb ます。';
  if (trimmed.includes('を')) structure = 'Topic は + object を + verb ます。';
  if (trimmed.includes('に')) structure = 'Topic は + destination/time に + verb ます。';
  if (trimmed.includes('です')) structure = 'Topic は + description + です。';
  return { errors, tips, structure };
}

function highlightedSentence(sentence, errors) {
  let output = '';
  let cursor = 0;
  errors.sort((first, second) => first.start - second.start).forEach((error) => {
    if (error.start < cursor) return;
    output += escapeHtml(sentence.slice(cursor, error.start));
    output += `<mark title="${escapeHtml(error.message)}">${escapeHtml(sentence.slice(error.start, error.end) || '＿')}</mark>`;
    cursor = error.end;
  });
  return output + escapeHtml(sentence.slice(cursor));
}

function toRomaji(sentence) {
  return sentence.split(/(\s+)/).map((part) => {
    if (/^\s+$/.test(part)) return part;
    let converted = part;
    Object.entries(romajiWords).sort(([first], [second]) => second.length - first.length).forEach(([word, reading]) => { converted = converted.replaceAll(word, reading); });
    let output = '';
    for (let index = 0; index < converted.length; index += 1) {
      const pair = converted.slice(index, index + 2);
      if (kanaRomaji[pair] !== undefined) {
        output += kanaRomaji[pair];
        index += 1;
      } else {
        output += kanaRomaji[converted[index]] || converted[index];
      }
    }
    return output.replaceAll('。', '.').replaceAll('！', '!').replaceAll('？', '?');
  }).join('');
}

function renderSentenceCheck(sentenceInput, checkerResult) {
  const sentence = sentenceInput.value;
  const result = analyzeSentence(sentence);
  const isCorrect = sentence.trim() && result.errors.length === 0;
  checkerResult.innerHTML = `<div class="checker-status"><span class="checker-status-badge">${isCorrect ? '✓' : '!'}</span><div><strong>${isCorrect ? 'Looks good!' : sentence.trim() ? 'A few things to check' : 'Ready when you are'}</strong><span>${isCorrect ? 'Your sentence follows a clear beginner pattern.' : 'Read the highlighted part and try the tips below.'}</span></div></div>${sentence.trim() ? `<div class="checker-output">${highlightedSentence(sentence, result.errors)}<span class="romaji-line">${escapeHtml(toRomaji(sentence))}</span></div>` : '<p class="checker-empty">Your corrected sentence and romaji reading will appear here with highlighted feedback.</p>'}<h3>Tips to improve</h3><ul class="checker-list">${result.tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join('')}</ul><div class="structure-card"><strong>${escapeHtml(result.structure)}</strong><span>Suggested beginner structure</span></div>`;
}

export function initializeSentenceChecker() {
  const sentenceInput = document.querySelector('#sentence-input');
  const checkerResult = document.querySelector('#checker-result');
  let sentenceExampleIndex = 0;
  const updateResult = () => renderSentenceCheck(sentenceInput, checkerResult);

  document.querySelector('#check-sentence').addEventListener('click', updateResult);
  sentenceInput.addEventListener('input', updateResult);
  document.querySelector('#sentence-example').addEventListener('click', () => {
    sentenceExampleIndex = (sentenceExampleIndex + 1) % sentenceExamples.length;
    sentenceInput.value = sentenceExamples[sentenceExampleIndex];
    updateResult();
  });
  updateResult();
}
