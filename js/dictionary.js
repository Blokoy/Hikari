export function initializeDictionary() {
  const dictionaryInput = document.querySelector('#dictionary-input');
  const wordCards = document.querySelectorAll('.word-card');

  dictionaryInput.addEventListener('input', (event) => {
    const query = event.target.value.toLowerCase();
    wordCards.forEach((card) => { card.hidden = query && !card.textContent.toLowerCase().includes(query); });
  });
}
