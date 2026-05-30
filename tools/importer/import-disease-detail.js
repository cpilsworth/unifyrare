/* eslint-disable */
/* global WebImporter */

export default {
  transform: ({ document, url, html, params }) => {
    const main = document.body;

    // Remove non-content elements
    const selectors = [
      'awt-modal-hcp',
      'header',
      'footer',
      'nav',
      'awt-footer',
      'awt-header',
      '#onetrust-consent-sdk',
      '.cookie-banner',
      'script',
      'style',
      'noscript',
      'iframe',
    ];
    selectors.forEach((sel) => {
      main.querySelectorAll(sel).forEach((el) => el.remove());
    });

    const content = main.querySelector('#content') || main;

    // Helper: insert a section break (hr)
    function addSectionBreak(beforeEl) {
      const hr = document.createElement('hr');
      beforeEl.parentNode.insertBefore(hr, beforeEl);
    }

    // 1. Convert hero into a Hero block table (2 rows: bg image, then text)
    const hero = content.querySelector('awt-hero');
    if (hero) {
      const heroText = hero.querySelector('awt-hero-text');
      const title = heroText?.textContent?.trim();
      const img = hero.querySelector('img');

      const cells = [['Hero']];
      if (img && img.getAttribute('src')) {
        const newImg = document.createElement('img');
        newImg.src = img.getAttribute('src');
        cells.push([newImg]);
      }
      const textCell = document.createElement('div');
      if (title) {
        const h1 = document.createElement('h1');
        h1.textContent = title;
        textCell.appendChild(h1);
      }
      cells.push([textCell]);

      const table = WebImporter.DOMUtils.createTable(cells, document);
      hero.replaceWith(table);
    }

    // 2. Process awt-ilustration-card elements into a Cards block table
    const allContainers = content.querySelectorAll('awt-container');
    allContainers.forEach((container) => {
      const cards = container.querySelectorAll(':scope > awt-ilustration-card');
      if (cards.length > 0) {
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
        container.replaceWith(table);
      }
    });

    // 3. Process nested awt-container with icons (symptom cards)
    content.querySelectorAll('awt-container').forEach((container) => {
      const nestedContainers = container.querySelectorAll(':scope > awt-container');
      if (nestedContainers.length >= 2) {
        const hasIcons = Array.from(nestedContainers).every(
          (nc) => nc.querySelector('img')
        );
        if (hasIcons) {
          const cells = [['Cards']];
          nestedContainers.forEach((nc) => {
            const img = nc.querySelector('img');
            const text = nc.textContent?.trim();
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
          container.replaceWith(table);
        }
      }
    });

    // 4. Process awt-references into a simple list
    content.querySelectorAll('awt-references').forEach((refsEl) => {
      const items = refsEl.querySelectorAll('awt-reference-item');
      if (items.length > 0) {
        const ol = document.createElement('ol');
        items.forEach((item) => {
          const li = document.createElement('li');
          const link = item.querySelector('a');
          if (link) {
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = item.textContent?.trim() || link.textContent?.trim();
            li.appendChild(a);
          } else {
            li.textContent = item.textContent?.trim();
          }
          ol.appendChild(li);
        });
        const heading = document.createElement('h3');
        heading.textContent = 'References';
        refsEl.parentNode.insertBefore(heading, refsEl);
        refsEl.replaceWith(ol);
      }
    });

    // 5. Process awt-image elements - extract the img
    content.querySelectorAll('awt-image').forEach((awtImg) => {
      const img = awtImg.querySelector('img');
      const link = awtImg.querySelector('a');
      if (img && img.getAttribute('src')) {
        const newImg = document.createElement('img');
        newImg.src = img.getAttribute('src');
        if (link && link.getAttribute('href')) {
          const a = document.createElement('a');
          a.href = link.getAttribute('href');
          a.appendChild(newImg);
          awtImg.replaceWith(a);
        } else {
          awtImg.replaceWith(newImg);
        }
      } else {
        awtImg.remove();
      }
    });

    // 6. Process awt-article and awt-article-section - unwrap content
    content.querySelectorAll('awt-article, awt-article-section').forEach((article) => {
      const div = document.createElement('div');
      while (article.firstChild) {
        div.appendChild(article.firstChild);
      }
      article.replaceWith(div);
    });

    // 7. Remove awt-divider elements
    content.querySelectorAll('awt-divider').forEach((el) => el.remove());

    // 8. Unwrap remaining awt-container elements
    content.querySelectorAll('awt-container').forEach((container) => {
      const div = document.createElement('div');
      while (container.firstChild) {
        div.appendChild(container.firstChild);
      }
      container.replaceWith(div);
    });

    // 9. Add section breaks between major content areas
    // Insert <hr> before each block table (cards) and before references
    const blockTables = content.querySelectorAll('table');
    blockTables.forEach((table) => {
      addSectionBreak(table);
    });

    const refsHeading = content.querySelector('h3');
    if (refsHeading && refsHeading.textContent === 'References') {
      addSectionBreak(refsHeading);
    }

    // 9b. Add section-metadata for the intro section (highlight background)
    // The first section after hero gets a light blue background
    const firstHr = content.querySelector('hr');
    if (firstHr) {
      const sectionMeta = WebImporter.DOMUtils.createTable(
        [['Section Metadata'], ['style', 'highlight']],
        document,
      );
      firstHr.parentNode.insertBefore(sectionMeta, firstHr);
    }

    // 10. Clean up empty elements
    content.querySelectorAll('div:empty, span:empty').forEach((el) => {
      if (!el.querySelector('img, picture, table')) {
        el.remove();
      }
    });

    // Replace content body with processed content
    while (main.firstChild) main.removeChild(main.firstChild);
    while (content.firstChild) main.appendChild(content.firstChild);

    // Apply WebImporter built-in rules
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title || '',
        template: 'disease-detail',
      },
    }];
  },
};
