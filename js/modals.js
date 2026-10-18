const toast = document.querySelector('#toast');

export function openModal(id) {
  const modal = document.querySelector(`#${id}`);
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}

export function closeModals() {
  document.querySelectorAll('.modal-backdrop').forEach((modal) => {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  });
}

export function showToast() {
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}
