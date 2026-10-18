import { quizQuestions, initialKanaQuizQuestions } from './js/data/quiz-data.js';
import { kanaCharts, kanaCombinations } from './js/data/kana-data.js';
import { closeModals, openModal } from './js/modals.js';
import { initializeNavigation } from './js/navigation.js';
import { initializeDictionary } from './js/dictionary.js';
import { initializeSentenceChecker } from './js/sentence-checker.js';
import { initializeQuiz } from './js/quiz.js';

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
initializeQuiz(quizQuestions, kanaQuizQuestions);
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

document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModals(); });
