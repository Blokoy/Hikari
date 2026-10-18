import { shuffleItems } from './utils.js';
import { closeModals, openModal, showToast } from './modals.js';

let activeQuizQuestions = [];
let currentQuestion = 0;

function clearKanaWorksheet() {
  document.querySelector('#kana-worksheet').innerHTML = '';
  document.querySelector('#quiz-answers').hidden = false;
  document.querySelector('.quiz-modal .modal-lead').textContent = 'Choose the answer that matches the kanji.';
  document.querySelector('.quiz-modal').classList.remove('kana-worksheet-mode');
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

export function startQuiz(questionList, section = 'GENERAL', onStart) {
  activeQuizQuestions = shuffleItems(questionList);
  currentQuestion = 0;
  document.querySelector('#quiz-section').textContent = section;
  clearKanaWorksheet();
  loadQuestion(0);
  onStart?.(activeQuizQuestions);
  closeModals();
  openModal('quiz-modal');
}

export function getActiveQuizQuestion(index) {
  return activeQuizQuestions[index];
}

export function initializeQuiz(quizQuestions) {
  document.querySelectorAll('[data-action="open-quiz"]').forEach((button) => button.addEventListener('click', () => startQuiz(quizQuestions)));

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
      showToast();
    } else {
      answer.classList.add('wrong-answer');
      result.innerHTML = `Not quite. ${question.feedback} <button class="quiz-action" data-quiz-action="retry">Try again</button>`;
    }
  });

  document.querySelector('#quiz-result').addEventListener('click', (event) => {
    const action = event.target.closest('[data-quiz-action]')?.dataset.quizAction;
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
}
