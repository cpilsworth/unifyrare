export default function init(el) {
  const rows = el.querySelectorAll(':scope > div');
  rows.forEach((row) => {
    row.classList.add('cards-card');
    const pic = row.querySelector('picture');
    if (pic) {
      const picParent = pic.closest('div:not(.cards-card)');
      if (picParent) picParent.classList.add('cards-card-image');
    }
    const textDiv = row.querySelector(':scope > div:not(.cards-card-image)');
    if (textDiv) textDiv.classList.add('cards-card-body');
  });
}
