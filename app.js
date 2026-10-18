import { quizQuestions, initialKanaQuizQuestions } from './js/data/quiz-data.js';
import { kanaCharts, kanaCombinations } from './js/data/kana-data.js';
import { sentenceExamples, romajiWords, kanaRomaji } from './js/data/sentence-data.js';

const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.page-view');
const breadcrumbTitle = document.querySelector('#breadcrumb-title');
const toast = document.querySelector('#toast');
const sidebar = document.querySelector('.sidebar');
const menuButton = document.querySelector('.menu-button');
const sourceVerbSections = [...document.querySelectorAll('.verb-section')].filter((section) => !section.closest('#verbs-view'));
sourceVerbSections.forEach((section) => { section.hidden = true; });
const pageTitles = { home: 'Overview', path: 'Learning path', practice: 'Practice', dictionary: 'Dictionary', checker: 'Sentence checker', kana: 'Kana chart', kanji: 'Kanji bank', grammar: 'Grammar guide', n5: 'N5 essentials', numbers: 'Numbers chart', time: 'Telling time', calendar: 'Calendar words', questions: 'Question words', frequency: 'Frequency words', demonstratives: 'This / That', contrast: 'But / However', or: 'Or / Alternatives', adjectives: 'Adjective lessons', verbs: 'Verb lessons' };

function showView(viewName) {
  views.forEach((view) => view.classList.toggle('active-view', view.id === `${viewName}-view`));
  sourceVerbSections.forEach((section) => { section.hidden = viewName !== 'verbs'; });
  navItems.forEach((item) => item.classList.toggle('active', item.dataset.view === viewName));
  breadcrumbTitle.textContent = pageTitles[viewName] || 'Overview';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navItems.forEach((item) => item.addEventListener('click', () => { showView(item.dataset.view); sidebar.classList.remove('mobile-open'); }));
document.querySelectorAll('[data-view]').forEach((item) => item.addEventListener('click', () => showView(item.dataset.view)));
menuButton.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));

function openModal(id) {
  const modal = document.querySelector(`#${id}`);
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}
function closeModals() {
  document.querySelectorAll('.modal-backdrop').forEach((modal) => {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  });
}

document.querySelectorAll('[data-action="start-lesson"]').forEach((button) => button.addEventListener('click', () => openModal('lesson-modal')));
document.querySelectorAll('[data-action="open-quiz"]').forEach((button) => button.addEventListener('click', () => { activeQuizQuestions = shuffleItems(quizQuestions); currentQuestion = 0; document.querySelector('#quiz-section').textContent = 'GENERAL'; clearKanaWorksheet(); loadQuestion(0); closeModals(); openModal('quiz-modal'); }));
document.querySelectorAll('[data-action="close-modal"]').forEach((button) => button.addEventListener('click', closeModals));
document.querySelectorAll('.modal-backdrop').forEach((modal) => modal.addEventListener('click', (event) => { if (event.target === modal) closeModals(); }));

let kanaQuizQuestions = initialKanaQuizQuestions;
let activeQuizQuestions = quizQuestions;
let currentQuestion = 0;

function shuffleItems(items) {
  const shuffledItems = [...items];
  for (let itemIndex = shuffledItems.length - 1; itemIndex > 0; itemIndex -= 1) {
    const swapIndex = Math.floor(Math.random() * (itemIndex + 1));
    [shuffledItems[itemIndex], shuffledItems[swapIndex]] = [shuffledItems[swapIndex], shuffledItems[itemIndex]];
  }
  return shuffledItems;
}

function loadQuestion(index) {
  const question = activeQuizQuestions[index];
  const shuffledAnswers = shuffleItems(question.answers);
  document.querySelector('#quiz-number').textContent = String(index + 1).padStart(2, '0');
  document.querySelector('#quiz-total').textContent = String(activeQuizQuestions.length).padStart(2, '0');
  document.querySelector('#quiz-progress-bar').style.width = `${((index + 1) / activeQuizQuestions.length) * 100}%`;
  document.querySelector('#quiz-question').textContent = question.prompt;
  document.querySelector('#quiz-answers').innerHTML = shuffledAnswers.map(([label, answer]) => `<button data-answer="${answer}">${label}</button>`).join('');
  document.querySelector('#quiz-result').innerHTML = '';
}

function loadKanaWorksheet() {
  const worksheet = document.querySelector('#kana-worksheet');
  const answers = activeQuizQuestions.map((question, index) => {
    const character = question.prompt.match(/is (.+)\?/)?.[1] || '';
    return `<label class="kana-test-tile"><strong>${character}</strong><input type="text" maxlength="5" data-kana-index="${index}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Answer for ${character}"><small class="kana-feedback" aria-live="polite"></small></label>`;
  }).join('');
  worksheet.innerHTML = answers;
  document.querySelector('#quiz-question').textContent = 'Write the reading for each kana';
  document.querySelector('.quiz-modal .modal-lead').textContent = 'Type the romaji under every character, then check your answers.';
  document.querySelector('#quiz-progress-bar').style.width = '0%';
  document.querySelector('#quiz-result').innerHTML = '<button class="primary-button finish-kana-button" data-quiz-action="finish-kana">Finish quiz <span>→</span></button>';
  document.querySelector('#quiz-answers').hidden = true;
  document.querySelector('.quiz-modal').classList.add('kana-worksheet-mode');
}

function clearKanaWorksheet() {
  document.querySelector('#kana-worksheet').innerHTML = '';
  document.querySelector('#quiz-answers').hidden = false;
  document.querySelector('.quiz-modal .modal-lead').textContent = 'Choose the answer that matches the kanji.';
  document.querySelector('.quiz-modal').classList.remove('kana-worksheet-mode');
}

document.querySelector('#quiz-answers').addEventListener('click', (event) => {
  const answer = event.target.closest('[data-answer]');
  if (!answer) return;
  const answers = document.querySelectorAll('[data-answer]');
  const result = document.querySelector('#quiz-result');
  const question = activeQuizQuestions[currentQuestion];
  answers.forEach((button) => { button.disabled = true; if (button.dataset.answer === 'correct') button.classList.add('correct-answer'); });
  if (answer.dataset.answer === 'correct') {
    answer.classList.add('correct-answer');
    result.innerHTML = `Correct. ${question.feedback} <button class="quiz-action" data-quiz-action="next">${currentQuestion === activeQuizQuestions.length - 1 ? 'Finish session' : 'Next question'} <span>→</span></button>`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  } else {
    answer.classList.add('wrong-answer');
    result.innerHTML = `Not quite. ${question.feedback} <button class="quiz-action" data-quiz-action="retry">Try again</button>`;
  }
});

document.querySelector('#quiz-result').addEventListener('click', (event) => {
  const action = event.target.closest('[data-quiz-action]')?.dataset.quizAction;
  if (action === 'finish-kana') {
    const fields = [...document.querySelectorAll('[data-kana-index]')];
    let score = 0;
    fields.forEach((field) => {
      const expected = activeQuizQuestions[Number(field.dataset.kanaIndex)].feedback.match(/read (.+)\.$/)?.[1] || '';
      const isCorrect = field.value.trim().toLowerCase() === expected.toLowerCase();
      field.classList.toggle('correct-answer', isCorrect);
      field.classList.toggle('wrong-answer', !isCorrect);
      field.nextElementSibling.textContent = isCorrect ? 'Correct' : `Try ${expected}`;
      field.disabled = true;
      if (isCorrect) score += 1;
    });
    const result = document.querySelector('#quiz-result');
    result.innerHTML = `<strong>${score} / ${fields.length} correct.</strong> <button class="quiz-action" data-quiz-action="retry-kana">Try again</button>`;
    return;
  }
  if (action === 'retry-kana') {
    document.querySelectorAll('[data-kana-index]').forEach((field) => { field.disabled = false; field.value = ''; field.classList.remove('correct-answer', 'wrong-answer'); });
    document.querySelector('#quiz-result').innerHTML = '<button class="primary-button finish-kana-button" data-quiz-action="finish-kana">Finish quiz <span>→</span></button>';
    return;
  }
  if (action === 'retry') {
    document.querySelectorAll('[data-answer]').forEach((button) => { button.disabled = false; button.classList.remove('correct-answer', 'wrong-answer'); });
    document.querySelector('#quiz-result').innerHTML = '';
  }
  if (action === 'next') {
    if (currentQuestion === activeQuizQuestions.length - 1) { closeModals(); return; }
    currentQuestion += 1;
    loadQuestion(currentQuestion);
  }
});

document.querySelector('#kana-worksheet').addEventListener('input', (event) => {
  if (event.target.matches('[data-kana-index]')) {
    event.target.classList.remove('correct-answer', 'wrong-answer');
    event.target.nextElementSibling.textContent = '';
  }
});

document.querySelector('#kana-worksheet').addEventListener('focusout', (event) => {
  if (!event.target.matches('[data-kana-index]') || !event.target.value.trim()) return;
  const field = event.target;
  const expected = activeQuizQuestions[Number(field.dataset.kanaIndex)].feedback.match(/read (.+)\.$/)?.[1] || '';
  const isCorrect = field.value.trim().toLowerCase() === expected.toLowerCase();
  field.classList.toggle('correct-answer', isCorrect);
  field.classList.toggle('wrong-answer', !isCorrect);
  field.nextElementSibling.textContent = isCorrect ? 'Correct' : `Try ${expected}`;
});

function createCompleteKanaQuiz(script) {
  const entries = [...kanaCharts[script], ...kanaCombinations[script]];
  return entries.map(([character, sound], index) => {
    const distractors = [1, 2, 3].map((offset) => entries[(index + offset) % entries.length][1]);
    const answers = [[sound, 'correct'], ...distractors.map((choice) => [choice, 'wrong'])];
    return { prompt: `Which sound is ${character}?`, answers, feedback: `${character} is read ${sound}.` };
  });
}
kanaQuizQuestions = {
  hiragana: createCompleteKanaQuiz('hiragana'),
  katakana: createCompleteKanaQuiz('katakana')
};
['hiragana', 'katakana'].forEach((script) => {
  const questions = kanaQuizQuestions[script];
  kanaQuizQuestions[script] = {
    basic: questions.slice(0, 46),
    dakuten: questions.slice(46, 71),
    combinations: questions.slice(71)
  };
});
let activeKanaScript = 'hiragana';
function renderKana(script) {
  activeKanaScript = script;
  const fullChart = [...kanaCharts[script], ...kanaCombinations[script]];
  document.querySelector('#kana-board').innerHTML = fullChart.map(([character, sound]) => `<div class="kana-cell"><strong>${character}</strong><span>${sound}</span></div>`).join('');
  document.querySelectorAll('[data-script-tab]').forEach((tab) => tab.classList.toggle('active', tab.dataset.scriptTab === script));
  document.querySelectorAll('.kana-quiz-choice').forEach((button) => button.classList.toggle('active', button.dataset.script === script && button.dataset.category === 'basic'));
}
renderKana('hiragana');

document.querySelectorAll('[data-script-tab]').forEach((tab) => tab.addEventListener('click', () => renderKana(tab.dataset.scriptTab)));
document.querySelectorAll('[data-action="open-kana-quiz"]').forEach((button) => button.addEventListener('click', () => {
  const script = button.dataset.script || activeKanaScript;
  const category = button.dataset.category || 'basic';
  activeQuizQuestions = shuffleItems(kanaQuizQuestions[script][category]);
  currentQuestion = 0;
  document.querySelector('#quiz-section').textContent = `${script.toUpperCase()} · ${category.toUpperCase()}`;
  loadKanaWorksheet();
  closeModals();
  openModal('quiz-modal');
}));

const wordCards = document.querySelectorAll('.word-card');
document.querySelector('#dictionary-input').addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase();
  wordCards.forEach((card) => { card.hidden = query && !card.textContent.toLowerCase().includes(query); });
});

const sentenceInput = document.querySelector('#sentence-input');
const checkerResult = document.querySelector('#checker-result');
let sentenceExampleIndex = 0;

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]);
}

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

function renderSentenceCheck() {
  const sentence = sentenceInput.value;
  const result = analyzeSentence(sentence);
  const isCorrect = sentence.trim() && result.errors.length === 0;
  checkerResult.innerHTML = `<div class="checker-status"><span class="checker-status-badge">${isCorrect ? '✓' : '!'}</span><div><strong>${isCorrect ? 'Looks good!' : sentence.trim() ? 'A few things to check' : 'Ready when you are'}</strong><span>${isCorrect ? 'Your sentence follows a clear beginner pattern.' : 'Read the highlighted part and try the tips below.'}</span></div></div>${sentence.trim() ? `<div class="checker-output">${highlightedSentence(sentence, result.errors)}<span class="romaji-line">${escapeHtml(toRomaji(sentence))}</span></div>` : '<p class="checker-empty">Your corrected sentence and romaji reading will appear here with highlighted feedback.</p>'}<h3>Tips to improve</h3><ul class="checker-list">${result.tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join('')}</ul><div class="structure-card"><strong>${escapeHtml(result.structure)}</strong><span>Suggested beginner structure</span></div>`;
}

document.querySelector('#check-sentence').addEventListener('click', renderSentenceCheck);
sentenceInput.addEventListener('input', renderSentenceCheck);
document.querySelector('#sentence-example').addEventListener('click', () => {
  sentenceExampleIndex = (sentenceExampleIndex + 1) % sentenceExamples.length;
  sentenceInput.value = sentenceExamples[sentenceExampleIndex];
  renderSentenceCheck();
});
renderSentenceCheck();

document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModals(); });
