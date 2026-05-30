/* eslint-disable */
/* global WebImporter */

export default function cardsParser(element, { document }) {
  const cards = element.querySelectorAll('awt-ilustration-card');
  if (!cards.length) return;

  const cells = [['Cards']];
  cards.forEach((card) => {
    const img = card.querySelector('img');
    const text = card.textContent?.trim();
    const cellContent = document.createElement('div');
    if (img && img.getAttribute('src')) {
      const newImg = document.createElement('img');
      newImg.src = img.getAttribute('src');
      cellContent.appendChild(newImg);
    }
    if (text) {
      const p = document.createElement('p');
      p.textContent = text;
      cellContent.appendChild(p);
    }
    cells.push([cellContent]);
  });

  const table = WebImporter.DOMUtils.createTable(cells, document);
  element.replaceWith(table);
}
