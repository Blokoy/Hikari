const pageTitles = { home: 'Overview', path: 'Learning path', practice: 'Practice', dictionary: 'Dictionary', checker: 'Sentence checker', kana: 'Kana chart', kanji: 'Kanji bank', grammar: 'Grammar guide', n5: 'N5 essentials', numbers: 'Numbers chart', time: 'Telling time', calendar: 'Calendar words', questions: 'Question words', frequency: 'Frequency words', demonstratives: 'This / That', contrast: 'But / However', or: 'Or / Alternatives', adjectives: 'Adjective lessons', verbs: 'Verb lessons' };

export function initializeNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.page-view');
  const breadcrumbTitle = document.querySelector('#breadcrumb-title');
  const sidebar = document.querySelector('.sidebar');
  const menuButton = document.querySelector('.menu-button');
  const sourceVerbSections = [...document.querySelectorAll('.verb-section')].filter((section) => !section.closest('#verbs-view'));

  sourceVerbSections.forEach((section) => { section.hidden = true; });

  function showView(viewName) {
    views.forEach((view) => view.classList.toggle('active-view', view.id === `${viewName}-view`));
    sourceVerbSections.forEach((section) => { section.hidden = viewName !== 'verbs'; });
    navItems.forEach((item) => item.classList.toggle('active', item.dataset.view === viewName));
    breadcrumbTitle.textContent = pageTitles[viewName] || 'Overview';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('[data-view]').forEach((item) => item.addEventListener('click', () => {
    showView(item.dataset.view);
    if (item.classList.contains('nav-item')) sidebar.classList.remove('mobile-open');
  }));
  menuButton.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));
}
