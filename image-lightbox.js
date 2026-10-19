const imageTriggers = document.querySelectorAll('.image-grid-trigger');

if (imageTriggers.length) {
  const dialog = document.createElement('dialog');
  dialog.className = 'image-lightbox';
  dialog.setAttribute('aria-label', 'Enlarged animation');
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'image-lightbox-close';
  closeButton.textContent = 'Close ×';
  const enlargedImage = document.createElement('img');
  dialog.append(closeButton, enlargedImage);
  document.body.append(dialog);

  for (const trigger of imageTriggers) {
    trigger.addEventListener('click', () => {
      const thumbnail = trigger.querySelector('img');
      enlargedImage.src = thumbnail.currentSrc || thumbnail.src;
      enlargedImage.alt = thumbnail.alt;
      dialog.showModal();
    });
  }

  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) {
      dialog.close();
    }
  });
  dialog.addEventListener('close', () => enlargedImage.removeAttribute('src'));
}
