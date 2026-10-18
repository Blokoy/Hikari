# Hikari

```text
██╗  ██╗██╗██╗  ██╗ █████╗ ██████╗ ██╗
██║  ██║██║██║ ██╔╝██╔══██╗██╔══██╗██║
███████║██║█████╔╝ ███████║██████╔╝██║
██╔══██║██║██╔═██╗ ██╔══██║██╔══██╗██║
██║  ██║██║██║  ██╗██║  ██║██║  ██║██║
╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝
```

Hikari is a lightweight Japanese study dashboard for building N5 foundations one clear step at a time.

## Features

- Guided learning path with lessons and progress cards
- Vocabulary dictionary with live search
- Hiragana and katakana charts with recall quizzes
- N5 references for kanji, grammar, numbers, time, dates, question words, and more
- Beginner Japanese sentence checker with inline highlights, correction tips, and suggested structures
- Responsive layout for desktop and mobile

## Run locally

No build step or dependencies are required. From this directory, start a local server:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

You can also open `index.html` directly, though a local server is recommended for consistent browser behavior.

## Project files

- `index.html` - application markup and lesson content
- `style.css` - layout, responsive styles, and visual design
- `app.js` - small application entry point that initializes the feature modules
- `js/navigation.js` - page navigation, breadcrumbs, sidebar behavior, and verb-section visibility
- `js/modals.js` - lesson and quiz modal controls plus toast notifications
- `js/dictionary.js` - live dictionary search and word-card filtering
- `js/sentence-checker.js` - sentence analysis, highlighted feedback, tips, and local romaji output
- `js/quiz.js` - shared general quiz state, question flow, answer feedback, retry, and progress handling
- `js/kana.js` - kana charts, kana question generation, worksheets, scoring, and kana quiz categories
- `js/utils.js` - shared HTML escaping and array shuffling helpers
- `js/data/` - static quiz, kana, and sentence-checker data

The app uses native browser ES modules and has no build tool or package manager. Keep
`app.js` as the entry point and initialize new feature behavior from a dedicated module.
Feature modules query the DOM elements they own rather than relying on a shared DOM module.

## Manual verification

After making changes, start the local server and check the browser console for errors:

```bash
python3 -m http.server 8000
```

The main regression areas are:

- Navigate through the sidebar and verify the mobile sidebar can scroll.
- Search the dictionary, clear the search, and check a no-results query.
- Run a general quiz with a wrong answer, retry, next question, and finish toast.
- Open both kana charts and run basic, dakuten, and combination quizzes for Hiragana and Katakana.
- Enter valid and invalid Japanese sentences, confirm highlighted feedback, and check the romaji line.

## N5 Roadmap

This checklist compares Hikari with the curriculum areas listed on the [MLC Japanese N5 guide](https://www.mlcjapanese.co.jp/n5.html). It is a planning document, not a claim that the app reproduces every MLC lesson.

### 1. Core requirements

- [x] Basic sentence pattern: `は` + `です`
- [x] Pronoun and self-introduction foundations in the learning path
- [x] Numbers and large-number reading
- [x] Telling time, minutes, and duration
- [x] Days, dates, months, and weekdays
- [x] Question words: who, what, when, where, why, and how
- [x] Frequency words for daily, weekly, monthly, and yearly routines
- [x] Demonstratives: これ / それ / あれ / どれ and この / その / あの / どの
- [x] Contrast: が / けど / でも and related forms
- [x] Alternatives: か / または / それとも
- [ ] Add direct links and complete lessons for remaining MLC core topics

### 2. Adjectives

- [x] i-adjective and na-adjective distinction
- [x] Common adjective reference list
- [x] Degree words and comparison patterns
- [x] Positive, negative, past, and connective adjective forms
- [ ] Expand toward the MLC 104-adjective reference list
- [ ] Add adjective recall practice and answer feedback

### 3. Verbs

- [x] Everyday masu-form examples and sentence building
- [x] Movement verbs: 行きます / 来ます / 帰ります with に / へ / で
- [x] Existence verbs: あります / います
- [x] Frequency adverbs with verb sentences
- [x] て-form: てください, てもいいですか, ています, and sequential actions
- [x] Plain forms: dictionary, nai, ta, and polite comparisons
- [x] たい-form, ましょう, ましょうか, and ませんか
- [x] Plain-form verbs before nouns
- [x] 知っています / わかります / 知りません distinction
- [ ] Add あげます / もらいます / くれます
- [ ] Expand the verb bank to the full 40-verb MLC reference with audio-ready examples
- [ ] Add conjugation drills for all verb groups, including nakatta-form

### 4. Particles

- [x] Basic examples for は, が, を, に, and で
- [x] Particle usage appears inside the grammar, movement, and sentence lessons
- [ ] Create a dedicated particle guide for は / が / を / に / で / へ / と / の / も / から / まで
- [ ] Add focused particle quizzes with explanations for wrong answers
- [ ] Cover location `に` vs `で`, meeting `に` vs `と`, and time ranges `まで` / `までに`

### 5. N5 vocabulary

- [x] Small searchable dictionary
- [x] Direction, routine, calendar, number, and frequency vocabulary
- [ ] Add the complete MLC 802-word vocabulary set
- [ ] Organize vocabulary by topic and JLPT priority
- [ ] Add example sentences, kana readings, and audio controls to every word
- [ ] Add spaced review, favorites, and progress tracking

### 6. Kana and kanji

- [x] Complete hiragana and katakana charts
- [x] Kana recall quizzes for basic sounds, dakuten, and combinations
- [x] Initial kanji bank with reading and meaning
- [ ] Expand the kanji bank to 100+ N5 kanji
- [ ] Add kanji reading quizzes across 10 practice sets
- [ ] Add writing/stroke-order practice and answer states
- [ ] Add on-yomi / kun-yomi readings and example compounds

### 7. N5 special practice topics

- [ ] Fractions and Japanese math terms
- [ ] Quiz symbols: 〇 / △ / ×
- [ ] `そうおもいます` and opinion expressions
- [ ] Honorific and relationship words: さん / ちゃん / くん / ともだち
- [ ] Compliments: いいね / すごい / じょうず
- [ ] Apology and late-arrival phrases
- [ ] Shopping, medical, body-part, and seasonal vocabulary

### 8. Listening and speaking

- [x] Generic quiz modal and kana recall interaction
- [ ] Add a dedicated listening section with playable native audio
- [ ] Add MLC-style listening sets for general N5 and all four て-form patterns
- [ ] Add listen, repeat, and reveal-transcript states
- [ ] Add speaking prompts and optional recording/self-check workflow

### 9. Downloads and study workflow

- [x] Local dashboard navigation and responsive layout
- [x] Learning path and progress summary UI
- [ ] Add source links and downloadable worksheets for each curriculum section
- [ ] Add lesson completion state and per-topic progress
- [ ] Add a full N5 checkpoint test with score breakdown
- [ ] Add a study queue generated from unfinished or missed items
- [ ] Add an N4 handoff section after the N5 checklist is complete

### Suggested build order

1. Finish particles and connect them to the existing sentence examples.
2. Expand vocabulary and kanji data before building more screens.
3. Add focused quizzes for particles, adjectives, verbs, and kanji.
4. Add listening assets and playback states.
5. Add progress persistence, worksheets, and the full checkpoint test.
