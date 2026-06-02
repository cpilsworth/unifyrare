export default function init(el) {
  const rows = el.querySelectorAll(':scope > div');
  rows.forEach((row) => {
    row.classList.add('cards-card');

    const cells = row.querySelectorAll(':scope > div');
    if (cells.length >= 2) {
      const imgCell = cells[0];
      if (imgCell.querySelector('picture')) {
        imgCell.classList.add('cards-card-image');
      }
      const bodyCell = cells[1];
      if (bodyCell) bodyCell.classList.add('cards-card-body');
    } else if (cells.length === 1) {
      const cell = cells[0];
      const pic = cell.querySelector('picture');
      if (pic) {
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'cards-card-image';
        const picParent = pic.closest('p') || pic.parentElement;
        imgWrapper.append(pic);
        cell.insertBefore(imgWrapper, cell.firstChild);
        if (picParent && picParent !== cell && !picParent.hasChildNodes()) {
          picParent.remove();
        }
        cell.classList.add('cards-card-body');
      }
    }
  });
}
