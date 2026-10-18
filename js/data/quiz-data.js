export const quizQuestions = [
  { prompt: 'What does 駅 mean?', answers: [['Book', 'wrong'], ['Station', 'correct'], ['Right', 'wrong'], ['Way', 'wrong']], feedback: '駅 means station.' },
  { prompt: 'What does 右 mean?', answers: [['Left', 'wrong'], ['Book', 'wrong'], ['Right', 'correct'], ['Station', 'wrong']], feedback: '右 means right.' }
];

export const initialKanaQuizQuestions = {
  hiragana: [
    { prompt: 'Which sound is ね?', answers: [['ne', 'correct'], ['na', 'wrong'], ['nu', 'wrong'], ['no', 'wrong']], feedback: 'ね is read ne.' },
    { prompt: 'Which hiragana is “shi”?', answers: [['さ', 'wrong'], ['し', 'correct'], ['す', 'wrong'], ['せ', 'wrong']], feedback: 'し is read shi.' },
    { prompt: 'Which sound is ぷ?', answers: [['bu', 'wrong'], ['pa', 'wrong'], ['pu', 'correct'], ['po', 'wrong']], feedback: 'ぷ is read pu.' }
  ],
  katakana: [
    { prompt: 'Which sound is ヌ?', answers: [['ne', 'wrong'], ['nu', 'correct'], ['na', 'wrong'], ['no', 'wrong']], feedback: 'ヌ is read nu.' },
    { prompt: 'Which katakana is “to”?', answers: [['タ', 'wrong'], ['チ', 'wrong'], ['ツ', 'wrong'], ['ト', 'correct']], feedback: 'ト is read to.' },
    { prompt: 'Which sound is パ?', answers: [['ba', 'wrong'], ['pa', 'correct'], ['pi', 'wrong'], ['po', 'wrong']], feedback: 'パ is read pa.' }
  ]
};
