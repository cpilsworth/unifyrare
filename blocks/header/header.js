function buildNavPanel(navSection) {
  const panel = document.createElement('div');
  panel.className = 'nav-panel';

  const navList = navSection.querySelector('ul');
  if (!navList) return panel;

  const list = document.createElement('ul');
  list.className = 'nav-list';

  navList.querySelectorAll(':scope > li').forEach((li) => {
    const item = document.createElement('li');
    item.className = 'nav-item';

    const link = li.querySelector(':scope > a') || li.querySelector(':scope > p > a');
    if (link) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = link.textContent;
      a.className = 'nav-link';
      item.append(a);
    }

    const subList = li.querySelector(':scope > ul');
    if (subList) {
      item.classList.add('has-children');
      const chevron = document.createElement('button');
      chevron.className = 'nav-chevron';
      chevron.setAttribute('aria-label', 'Expand');
      item.append(chevron);

      const subPanel = document.createElement('ul');
      subPanel.className = 'nav-sublist';
      subList.querySelectorAll(':scope > li').forEach((subLi) => {
        const subItem = document.createElement('li');
        subItem.className = 'nav-subitem';
        const subLink = subLi.querySelector('a');
        if (subLink) {
          const sa = document.createElement('a');
          sa.href = subLink.getAttribute('href');
          sa.textContent = subLink.textContent;
          sa.className = 'nav-sublink';
          subItem.append(sa);
        }
        subPanel.append(subItem);
      });

      const backBtn = document.createElement('button');
      backBtn.className = 'nav-back';
      backBtn.textContent = 'Back';

      const subWrapper = document.createElement('div');
      subWrapper.className = 'nav-sub-panel';
      subWrapper.append(backBtn, subPanel);
      item.append(subWrapper);

      chevron.addEventListener('click', (e) => {
        e.stopPropagation();
        item.classList.toggle('is-expanded');
      });

      backBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        item.classList.remove('is-expanded');
      });
    }

    list.append(item);
  });

  panel.append(list);
  return panel;
}

export default async function init(el) {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return;

  const html = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const sections = doc.querySelectorAll(':scope > body > div');

  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';

  const brandSection = sections[0];
  if (brandSection) {
    const brand = document.createElement('div');
    brand.className = 'nav-brand';
    const logoLink = brandSection.querySelector('a');
    if (logoLink) {
      const a = document.createElement('a');
      a.href = logoLink.getAttribute('href');
      a.className = 'nav-logo';
      const img = logoLink.querySelector('img');
      if (img) {
        const newImg = document.createElement('img');
        newImg.src = img.getAttribute('src');
        newImg.alt = img.getAttribute('alt') || 'Logo';
        a.append(newImg);
      }
      brand.append(a);
    }
    wrapper.append(brand);
  }

  const hamburger = document.createElement('button');
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-label', 'Open menu');
  hamburger.innerHTML = '<span></span><span></span><span></span>';
  wrapper.append(hamburger);

  const navSection = sections[1];
  if (navSection) {
    const panel = buildNavPanel(navSection);
    wrapper.append(panel);
  }

  hamburger.addEventListener('click', () => {
    const isOpen = wrapper.classList.toggle('is-open');
    hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('nav-open', isOpen);
  });

  el.append(wrapper);
  el.style.display = 'block';
}
