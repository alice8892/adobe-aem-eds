import {
  debug,
  createTag,
} from '../../utils/utils.js';

const GLOBE_IMG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" focusable="false" class="footer-region-img" loading="lazy" alt="wireframe globe"><path d="M50 23.8c-0.2-3.3-1-6.5-2.4-9.5l0 0C43.7 5.9 35.4 0.4 26.2 0h-2.4C14.6 0.4 6.3 5.9 2.4 14.3l0 0c-1.4 3-2.2 6.2-2.4 9.5l0 0v2.4l0 0c0.2 3.3 1 6.5 2.4 9.5l0 0c4 8.4 12.2 13.9 21.4 14.3h2.4c9.2-0.4 17.5-5.9 21.4-14.3l0 0c1.4-3 2.2-6.2 2.4-9.5l0 0V23.8zM47.6 23.8h-9.5c0-3.2-0.4-6.4-1.2-9.5H45C46.6 17.2 47.5 20.5 47.6 23.8zM33.6 11.9h-7.4V2.6C29.3 3.3 31.9 7.1 33.6 11.9zM23.8 2.6v9.3h-7.4C18.1 7.1 20.7 3.3 23.8 2.6zM23.8 14.3v9.5h-9.5c0.1-3.2 0.6-6.4 1.4-9.5H23.8zM23.8 26.2v9.5h-8.1c-0.8-3.1-1.3-6.3-1.4-9.5H23.8zM23.8 38.1v9.3c-3.1-0.7-5.7-4.5-7.4-9.3H23.8zM26.2 47.4v-9.3h7.4C31.9 42.9 29.3 46.7 26.2 47.4zM26.2 35.7v-9.5h9.5c-0.1 3.2-0.6 6.4-1.4 9.5H26.2zM26.2 23.8v-9.5h8.1c0.8 3.1 1.3 6.3 1.4 9.5H26.2zM43.3 11.9h-7.1c-0.9-3.1-2.4-6.1-4.5-8.6C36.4 4.8 40.5 7.8 43.3 11.9zM18.6 3.3c-2.2 2.5-3.8 5.4-4.8 8.6H6.7C9.6 7.8 13.8 4.8 18.6 3.3zM5 14.3h8.1c-0.7 3.1-1.1 6.3-1.2 9.5H2.4C2.5 20.5 3.4 17.2 5 14.3zM2.4 26.2h9.5c0 3.2 0.4 6.4 1.2 9.5H5C3.4 32.8 2.5 29.5 2.4 26.2zM6.4 38.1h7.4c0.9 3.1 2.4 6.1 4.5 8.6 -4.7-1.5-8.8-4.5-11.7-8.6H6.4zM31.4 46.7c2.2-2.5 3.8-5.4 4.8-8.6h7.4C40.6 42.2 36.3 45.3 31.4 46.7zM45 35.7h-8.1c0.7-3.1 1.1-6.3 1.2-9.5h9.5C47.5 29.5 46.6 32.8 45 35.7z"></path></svg>';
const ADCHOICE_IMG = '<img class="footer-link-img" loading="lazy" alt="AdChoices icon" src="/libs/blocks/footer/adchoices-small.svg" height="9" width="9">';

class Footer {
  constructor(body, el) {
    this.el = el;
    this.body = body;
    this.desktop = window.matchMedia('(min-width: 900px)');
  }

  init = async () => {
    const wrapper = createTag('div', { class: 'footer-wrapper' });

    const grid = this.decorateGrid();
    if (grid) {
      wrapper.append(grid);
    }

    const infoRow = createTag('div', { class: 'footer-info' });
    const infoColumnLeft = createTag('div', { class: 'footer-info-column' });
    const infoColumnRight = createTag('div', { class: 'footer-info-column' });

    const region = await this.decorateRegion();
    if (region) {
      infoColumnLeft.append(region);
      infoRow.classList.add('has-region');
    }

    const social = this.decorateSocial();
    if (social) {
      infoColumnLeft.append(social);
      infoRow.classList.add('has-social');
    }

    const privacy = this.decoratePrivacy();
    if (privacy) {
      infoColumnRight.append(privacy);
      infoRow.classList.add('has-privacy');
    }

    if (infoColumnLeft.hasChildNodes()) {
      infoRow.append(infoColumnLeft);
    }
    if (infoColumnRight.hasChildNodes()) {
      infoRow.append(infoColumnRight);
    }
    if (infoRow.hasChildNodes()) {
      wrapper.append(infoRow);
    }

    this.el.append(wrapper);
  };

  decorateGrid = () => {
    const gridBlock = this.body.querySelectorAll('div');
    const footer = document.querySelector('footer');
    if (!gridBlock) return null;
    this.desktop.addEventListener('change', this.onMediaChange);
    const navGrid = createTag('div', { class: 'footer-nav-grid' });
    const columns = gridBlock;
    const columnsArray = Array.from(columns);
    const regionSelectorIndex = columnsArray.findIndex((column) => column.classList.contains('region-selector'));
    const navCols = columnsArray.slice(0, regionSelectorIndex - 1);
    navCols.forEach((column) => {
      if (column) {
        const navColumn = createTag('div', { class: 'footer-nav-column' });
        const headings = column.querySelectorAll('h2');
        headings.forEach((heading) => {
          const navItem = createTag('div', { class: 'footer-nav-item' });
          const titleId = heading.textContent.trim().toLowerCase().replace(/ /g, '-');
          const title = createTag('a', {
            class: 'footer-nav-item-title',
            role: 'button',
            'aria-expanded': this.desktop.matches,
            'aria-controls': `${titleId}-menu`,
          });
          title.textContent = heading.textContent;
          navItem.append(title);
          const linksContainer = heading.nextElementSibling;
          linksContainer.classList = 'footer-nav-item-links';
          linksContainer.id = `${titleId}-menu`;
          if (!this.desktop.matches) {
            title.setAttribute('tabindex', 0);
            title.addEventListener('click', this.toggleMenu);
            title.addEventListener('focus', () => {
              window.addEventListener('keydown', this.toggleOnKey);
            });
            title.addEventListener('blur', () => {
              window.removeEventListener('keydown', this.toggleOnKey);
            });
          }
          const links = linksContainer.querySelectorAll('li');
          links.forEach((link) => {
            link.classList.add('footer-nav-item-link');
          });
          navItem.append(linksContainer);
          navColumn.append(navItem);
        });
        navGrid.append(navColumn);
      }
    });
    if (navCols.length < 1) {
      footer.classList.add('footer-small');
    }
    return navGrid;
  };

  decorateRegion = async () => {
    const region = this.body.querySelector('.region-selector > div');
    const regionTextContent = this.body.querySelector('.region-selector div > div')?.innerText;
    if (!region) return null;
    const regionContainer = createTag('div', { class: 'footer-region' });
    const regionButton = createTag('a', {
      class: 'footer-region-button',
      id: 'region-button',
      'aria-haspopup': true,
      'aria-label': regionTextContent,
      href: '#modal',
      role: 'button',
      tabindex: 0,
    });
    const regionText = createTag('span', { class: 'footer-region-text' }, regionTextContent);
    regionButton.insertAdjacentHTML('afterbegin', GLOBE_IMG);
    regionButton.append(regionText);
    regionContainer.append(regionButton);

    const regionLinks = region.querySelectorAll('a');
    regionLinks.forEach((link) => {
      const selected = link.parentNode.nodeName === 'STRONG';
      const options = { class: 'footer-region-option' };
      if (selected) {
        options.class += ' footer-region-selected';
        options['aria-current'] = 'page';
      }
    });
    return regionContainer;
  };

  decorateSocial = () => {
    const socialEl = this.body.querySelector('.social > div');
    if (!socialEl) return null;
    const socialWrapper = createTag('div', { class: 'footer-social' });
    const socialLinks = createTag('ul', { class: 'footer-social-icons' });
    socialEl.querySelectorAll('a').forEach((a) => {
      const domain = a.host.replace(/www./, '').replace(/.com/, '');
      const supported = ['facebook', 'instagram', 'twitter', 'linkedin'];
      if (supported.includes(domain)) {
        const li = createTag('li', { class: 'footer-social-icon' });
        const socialIcon = createTag('img', {
          class: 'footer-social-img',
          loading: 'lazy',
          src: `/libs/blocks/footer/${domain}-square.svg`,
          alt: `${domain} logo`,
          height: '20',
          width: '20',
        });
        a.setAttribute('aria-label', domain);
        a.textContent = '';
        a.append(socialIcon);
        li.append(a);
        socialLinks.append(li);
      } else { a.remove(); }
      socialWrapper.append(socialLinks);
    });
    return socialWrapper;
  };

  decoratePrivacy = () => {
    const copyrightEl = this.body.querySelector('div em');
    const links = copyrightEl.parentElement.querySelectorAll('a');
    if (!copyrightEl || !links) return null;
    const privacyWrapper = createTag('div', { class: 'footer-privacy' });
    const copyright = createTag('p', { class: 'footer-privacy-copyright' });
    copyright.textContent = copyrightEl.textContent;
    privacyWrapper.append(copyright);
    const infoLinks = createTag('ul', { class: 'footer-privacy-links' });
    links.forEach((link) => {
      const li = createTag('li', { class: 'footer-privacy-link' });
      if (link.hash === '#interest-based-ads') {
        link.insertAdjacentHTML('afterbegin', ADCHOICE_IMG);
      }
      li.append(link);
      infoLinks.append(li);
    });
    privacyWrapper.append(infoLinks);
    return privacyWrapper;
  };

  toggleMenu = (e) => {
    const button = e.target.closest('[role=button]');
    const expanded = button.getAttribute('aria-expanded');
    if (expanded === 'true') {
      this.closeMenu(button);
    } else {
      this.openMenu(button);
    }
  };

  closeMenu = (el) => {
    if (el.id === 'region-button') {
      window.removeEventListener('keydown', this.closeOnEscape);
      window.removeEventListener('click', this.closeOnDocClick);
    }
    el.setAttribute('aria-expanded', false);
  };

  openMenu = (el) => {
    const type = el.classList[0];
    const expandedMenu = document.querySelector(`.${type}[aria-expanded=true]`);
    if (expandedMenu) { this.closeMenu(expandedMenu); }
    if (el.id === 'region-button') {
      window.addEventListener('keydown', this.closeOnEscape);
      window.addEventListener('click', this.closeOnDocClick);
    }
    el.setAttribute('aria-expanded', true);
  };

  toggleOnKey = (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
      this.toggleMenu(e);
    }
  };

  closeOnEscape = (e) => {
    const button = document.getElementById('region-button');
    if (e.code === 'Escape') {
      this.closeMenu(button);
    }
  };

  closeOnDocClick = (e) => {
    const button = document.getElementById('region-button');
    const a = e.target.closest('a');
    if (a !== button) {
      this.closeMenu(button);
    }
  };

  onMediaChange = (desktop) => {
    if (desktop.matches) {
      document.querySelectorAll('.footer-nav-item-title').forEach((button) => {
        button.removeAttribute('tabindex');
        window.removeEventListener('keydown', this.toggleOnKey);
        button.setAttribute('aria-expanded', true);
        button.removeEventListener('click', this.toggleMenu);
      });
    } else {
      document.querySelectorAll('.footer-nav-item-title').forEach((button) => {
        button.setAttribute('tabindex', 0);
        button.addEventListener('focus', () => {
          window.addEventListener('keydown', this.toggleOnKey);
        });
        button.addEventListener('blur', () => {
          window.removeEventListener('keydown', this.toggleOnKey);
        });
        button.setAttribute('aria-expanded', false);
        button.addEventListener('click', this.toggleMenu);
      });
    }
  };
}

async function fetchFooter(url) {
  const resp = await fetch(`${url}.plain.html`);
  const html = await resp.text();
  return html;
}

export default async function init(block) {
  const url = block.getAttribute('data-footer-source');
  if (url) {
    const html = await fetchFooter(url);
    if (html) {
      try {
        const parser = new DOMParser();
        const footerDoc = parser.parseFromString(html, 'text/html');
        const footer = new Footer(footerDoc.body, block);
        footer.init();
      } catch {
        debug('Could not create footer.');
      }
    }
  }
}
