import { quizQuestions } from './js/data/quiz-data.js';
import { initializeModals } from './js/modals.js';
import { initializeNavigation } from './js/navigation.js';
import { initializeDictionary } from './js/dictionary.js';
import { initializeSentenceChecker } from './js/sentence-checker.js';
import { initializeQuiz } from './js/quiz.js';
import { initializeKana } from './js/kana.js';
import { initializeKanji } from './js/kanji.js';

initializeNavigation();
initializeModals();
initializeDictionary();
initializeSentenceChecker();
initializeQuiz(quizQuestions);
initializeKana();
initializeKanji();
