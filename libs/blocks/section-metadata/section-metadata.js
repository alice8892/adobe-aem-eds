function handleBackground(div, section) {
  const pic = div.querySelector('picture');
  if (pic) {
    section.classList.add('has-background');
    pic.classList.add('section-background');
    section.insertAdjacentElement('afterbegin', pic);
  } else {
    const color = div.textContent;
    if (color) {
      section.style.backgroundColor = color;
    }
  }
}

function handleStyle(div, section, customs = []) {
  const value = div.textContent.toLowerCase();
  let styles = value.split(', ').map((style) => style.replaceAll(' ', '-'));
  if (section) {
    if (customs) styles = [...styles, ...customs];
    section.classList.add(...styles.filter(i => i !== ''));
  }
}

export const getSectionMetadata = (el) => {
  if (!el) return {};
  const metadata = {};
  el.childNodes.forEach((node) => {
    const key = node.children?.[0]?.textContent?.toLowerCase();
    if (!key) return;
    const val = node.children?.[1]?.textContent?.toLowerCase();
    metadata[key] = val;
  });
  return metadata;
};

export default function init(el) {
  const section = el.closest('.section');
  if (!section) return;
  const keyDivs = el.querySelectorAll(':scope > div > div:first-child');
  keyDivs.forEach((div) => {
    const valueDiv = div.nextElementSibling;
    if (div.textContent === 'style' && valueDiv.textContent) {
      handleStyle(valueDiv, section);
    }
    if (div.textContent === 'grid') {
      handleStyle(valueDiv, section, ['grid']);
    }
    if (div.textContent === 'background') {
      handleBackground(valueDiv, section);
    }
  });
}
