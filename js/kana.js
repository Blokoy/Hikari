import { kanaCharts, kanaCombinations } from './data/kana-data.js';
import { closeModals } from './modals.js';
import { getActiveQuizQuestion, startQuiz } from './quiz.js';

let activeKanaScript = 'hiragana';

function createCompleteKanaQuiz(script) {
  const entries = [...kanaCharts[script], ...kanaCombinations[script]];
  return entries.map(([character, sound], index) => {
    const distractors = [1, 2, 3].map((offset) => entries[(index + offset) % entries.length][1]);
    const answers = [[sound, 'correct'], ...distractors.map((choice) => [choice, 'wrong'])];
    return { prompt: `Which sound is ${character}?`, answers, feedback: `${character} is read ${sound}.` };
  });
}

function createKanaQuizQuestions() {
  return Object.fromEntries(['hiragana', 'katakana'].map((script) => {
    const questions = createCompleteKanaQuiz(script);
    return [script, {
      basic: questions.slice(0, 46),
      dakuten: questions.slice(46, 71),
      combinations: questions.slice(71)
    }];
  }));
}

function renderKana(script) {
  activeKanaScript = script;
  const fullChart = [...kanaCharts[script], ...kanaCombinations[script]];
  document.querySelector('#kana-board').innerHTML = fullChart.map(([character, sound]) => `<div class="kana-cell"><strong>${character}</strong><span>${sound}</span></div>`).join('');
  document.querySelectorAll('[data-script-tab]').forEach((tab) => tab.classList.toggle('active', tab.dataset.scriptTab === script));
  document.querySelectorAll('.kana-quiz-choice').forEach((button) => button.classList.toggle('active', button.dataset.script === script && button.dataset.category === 'basic'));
}

function renderKanaWorksheet(questions) {
  document.querySelector('#kana-worksheet').innerHTML = questions.map((question, index) => {
    const character = question.prompt.match(/is (.+)\?/)?.[1] || '';
    return `<label class="kana-test-tile"><strong>${character}</strong><input type="text" maxlength="5" data-kana-index="${index}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Answer for ${character}"><small class="kana-feedback" aria-live="polite"></small></label>`;
  }).join('');
  document.querySelector('#quiz-question').textContent = 'Write the reading for each kana';
  document.querySelector('.quiz-modal .modal-lead').textContent = 'Type the romaji under every character, then check your answers.';
  document.querySelector('#quiz-progress-bar').style.width = '0%';
  document.querySelector('#quiz-result').innerHTML = '<button class="primary-button finish-kana-button" data-quiz-action="finish-kana">Finish quiz <span>→</span></button>';
  document.querySelector('#quiz-answers').hidden = true;
  document.querySelector('.quiz-modal').classList.add('kana-worksheet-mode');
}

function initializeWorksheetHandlers() {
  document.querySelector('#quiz-result').addEventListener('click', (event) => {
    const action = event.target.closest('[data-quiz-action]')?.dataset.quizAction;
    if (action === 'finish-kana') {
      const fields = [...document.querySelectorAll('[data-kana-index]')];
      let score = 0;
      fields.forEach((field) => {
        const expected = getActiveQuizQuestion(Number(field.dataset.kanaIndex)).feedback.match(/read (.+)\.$/)?.[1] || '';
        const isCorrect = field.value.trim().toLowerCase() === expected.toLowerCase();
        field.classList.toggle('correct-answer', isCorrect);
        field.classList.toggle('wrong-answer', !isCorrect);
        field.nextElementSibling.textContent = isCorrect ? 'Correct' : `Try ${expected}`;
        field.disabled = true;
        if (isCorrect) score += 1;
      });
      document.querySelector('#quiz-result').innerHTML = `<strong>${score} / ${fields.length} correct.</strong> <button class="quiz-action" data-quiz-action="retry-kana">Try again</button>`;
    }
    if (action === 'retry-kana') {
      document.querySelectorAll('[data-kana-index]').forEach((field) => { field.disabled = false; field.value = ''; field.classList.remove('correct-answer', 'wrong-answer'); });
      document.querySelector('#quiz-result').innerHTML = '<button class="primary-button finish-kana-button" data-quiz-action="finish-kana">Finish quiz <span>→</span></button>';
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
    const expected = getActiveQuizQuestion(Number(field.dataset.kanaIndex)).feedback.match(/read (.+)\.$/)?.[1] || '';
    const isCorrect = field.value.trim().toLowerCase() === expected.toLowerCase();
    field.classList.toggle('correct-answer', isCorrect);
    field.classList.toggle('wrong-answer', !isCorrect);
    field.nextElementSibling.textContent = isCorrect ? 'Correct' : `Try ${expected}`;
  });
}

export function initializeKana() {
  const kanaQuizQuestions = createKanaQuizQuestions();
  renderKana('hiragana');
  document.querySelectorAll('[data-script-tab]').forEach((tab) => tab.addEventListener('click', () => renderKana(tab.dataset.scriptTab)));
  initializeWorksheetHandlers();
  document.querySelectorAll('[data-action="open-kana-quiz"]').forEach((button) => button.addEventListener('click', () => {
    const script = button.dataset.script || activeKanaScript;
    const category = button.dataset.category || 'basic';
    startQuiz(kanaQuizQuestions[script][category], `${script.toUpperCase()} · ${category.toUpperCase()}`, renderKanaWorksheet);
  }));
}
