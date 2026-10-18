import { quizQuestions, initialKanaQuizQuestions } from './js/data/quiz-data.js';
import { kanaCharts, kanaCombinations } from './js/data/kana-data.js';
import { closeModals, openModal } from './js/modals.js';
import { initializeNavigation } from './js/navigation.js';
import { initializeDictionary } from './js/dictionary.js';
import { initializeSentenceChecker } from './js/sentence-checker.js';
import { getActiveQuizQuestion, initializeQuiz, startQuiz } from './js/quiz.js';

initializeNavigation();
initializeDictionary();
initializeSentenceChecker();

document.querySelectorAll('[data-action="start-lesson"]').forEach((button) => button.addEventListener('click', () => openModal('lesson-modal')));
document.querySelectorAll('[data-action="close-modal"]').forEach((button) => button.addEventListener('click', closeModals));
document.querySelectorAll('.modal-backdrop').forEach((modal) => modal.addEventListener('click', (event) => { if (event.target === modal) closeModals(); }));

let kanaQuizQuestions = initialKanaQuizQuestions;

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
initializeQuiz(quizQuestions);
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
document.querySelectorAll('[data-action="open-kana-quiz"]').forEach((button) => button.addEventListener('click', () => {
  const script = button.dataset.script || activeKanaScript;
  const category = button.dataset.category || 'basic';
  startQuiz(kanaQuizQuestions[script][category], `${script.toUpperCase()} · ${category.toUpperCase()}`, (questions) => {
    const worksheet = document.querySelector('#kana-worksheet');
    worksheet.innerHTML = questions.map((question, index) => {
      const character = question.prompt.match(/is (.+)\?/)?.[1] || '';
      return `<label class="kana-test-tile"><strong>${character}</strong><input type="text" maxlength="5" data-kana-index="${index}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Answer for ${character}"><small class="kana-feedback" aria-live="polite"></small></label>`;
    }).join('');
    document.querySelector('#quiz-question').textContent = 'Write the reading for each kana';
    document.querySelector('.quiz-modal .modal-lead').textContent = 'Type the romaji under every character, then check your answers.';
    document.querySelector('#quiz-progress-bar').style.width = '0%';
    document.querySelector('#quiz-result').innerHTML = '<button class="primary-button finish-kana-button" data-quiz-action="finish-kana">Finish quiz <span>→</span></button>';
    document.querySelector('#quiz-answers').hidden = true;
    document.querySelector('.quiz-modal').classList.add('kana-worksheet-mode');
  });
}));

document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModals(); });
