export function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]);
}

export function shuffleItems(items) {
  const shuffledItems = [...items];
  for (let itemIndex = shuffledItems.length - 1; itemIndex > 0; itemIndex -= 1) {
    const swapIndex = Math.floor(Math.random() * (itemIndex + 1));
    [shuffledItems[itemIndex], shuffledItems[swapIndex]] = [shuffledItems[swapIndex], shuffledItems[itemIndex]];
  }
  return shuffledItems;
}
