export default async function init(el) {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return;

  const html = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const sections = doc.querySelectorAll(':scope > body > div');

  const wrapper = document.createElement('div');
  wrapper.className = 'footer-wrapper';

  if (sections[0]) {
    const legalSection = document.createElement('div');
    legalSection.className = 'footer-legal';
    legalSection.innerHTML = sections[0].innerHTML;
    wrapper.append(legalSection);
  }

  if (sections[1]) {
    const disclaimer = document.createElement('div');
    disclaimer.className = 'footer-disclaimer';
    disclaimer.innerHTML = sections[1].innerHTML;
    wrapper.append(disclaimer);
  }

  el.append(wrapper);
  el.style.display = 'block';
}
