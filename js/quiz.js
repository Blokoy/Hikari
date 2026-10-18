import { shuffleItems } from './utils.js';
import { closeModals, openModal, showToast } from './modals.js';

export function initializeQuiz(quizQuestions, kanaQuizQuestions) {
  let activeQuizQuestions = quizQuestions;
  let currentQuestion = 0;

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

  document.querySelectorAll('[data-action="open-quiz"]').forEach((button) => button.addEventListener('click', () => {
    activeQuizQuestions = shuffleItems(quizQuestions);
    currentQuestion = 0;
    document.querySelector('#quiz-section').textContent = 'GENERAL';
    clearKanaWorksheet();
    loadQuestion(0);
    closeModals();
    openModal('quiz-modal');
  }));

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

  document.querySelectorAll('[data-action="open-kana-quiz"]').forEach((button) => button.addEventListener('click', () => {
    const script = button.dataset.script || 'hiragana';
    const category = button.dataset.category || 'basic';
    activeQuizQuestions = shuffleItems(kanaQuizQuestions[script][category]);
    currentQuestion = 0;
    document.querySelector('#quiz-section').textContent = `${script.toUpperCase()} · ${category.toUpperCase()}`;
    loadKanaWorksheet();
    closeModals();
    openModal('quiz-modal');
  }));
}
