(() => {
  const images = [...document.querySelectorAll('img')];
  if (!images.length) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'image-lightbox';
  dialog.setAttribute('aria-label', 'Enlarged image');
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'image-lightbox-close';
  closeButton.textContent = 'Close ×';
  const enlargedImage = document.createElement('img');
  dialog.append(closeButton, enlargedImage);
  document.body.append(dialog);
  let opener;

  function openImage(image, trigger) {
    opener = trigger;
    enlargedImage.src = image.currentSrc || image.src;
    enlargedImage.alt = image.alt;
    dialog.showModal();
  }

  for (const image of images) {
    image.classList.add('zoomable-image');
    const trigger = image.closest('a, button') || image;
    if (trigger === image) {
      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', `Enlarge image${image.alt ? `: ${image.alt}` : ''}`);
      image.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openImage(image, trigger);
        }
      });
    }
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openImage(image, trigger);
    });
  }

  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    enlargedImage.removeAttribute('src');
    opener?.focus();
  });
})();
