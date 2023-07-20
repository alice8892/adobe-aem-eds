/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/*
* Aside - v5.1
*/

import { decorateBlockText } from '../../utils/decorate.js';
import { createTag } from '../../utils/utils.js';

// standard/default aside uses same text sizes as the split
const variants = ['split', 'inline', 'notification'];
const sizes = ['extra-small', 'small', 'medium', 'large'];
const [split, inline, notification] = variants;
const [xsmall, small, medium, large] = sizes;
const blockConfig = {
  [split]: ['xl', 's', 'm'],
  [inline]: ['s', 'm'],
  [notification]: {
    [xsmall]: ['m', 'm'],
    [small]: ['m', 'm'],
    [medium]: ['s', 's'],
    [large]: ['l', 'm'],
  },
};
const PLAY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32" fill="none" class="play-icon">
                    <path d="M24 16.0005L0 32L1.39876e-06 0L24 16.0005Z" fill="white"/>
                  </svg>
                  `;
const ASPECT_RATIO = /^format:/i;

function getBlockData(el) {
  const variant = variants.find((variantClass) => el.classList.contains(variantClass));
  const size = sizes.find((sizeClass) => el.classList.contains(sizeClass));
  const blockData = variant ? blockConfig[variant] : blockConfig[Object.keys(blockConfig)[0]];
  return variant && size && !Array.isArray(blockData) ? blockData[size] : blockData;
}

function decorateStaticLinks(el) {
  if (!el.classList.contains('notification')) return;
  const textLinks = el.querySelectorAll('a:not([class])');
  textLinks.forEach((link) => { link.classList.add('static'); });
}

function decorateModalImage(el) {
  const modalLink = el.querySelector('a');
  modalLink.closest('p').classList.add('play-container');
  modalLink.classList.add('play-btn');
  modalLink.innerHTML = '';
  const playIconContainer = createTag('div', { class: 'play-icon-container', 'aria-label': 'play' }, PLAY_ICON);
  const playCircle = createTag('div', { class: 'play-btn-circle', 'aria-label': 'play' }, playIconContainer);
  modalLink.appendChild(playCircle);
}

function decorateIconStack(el) {
  const ulEl = el.querySelector('ul');
  if (ulEl) {
    ulEl.classList.add('icon-stack-area', 'body-s');
  }
}

function decorateImage(el) {
  const mediaPtags = el.querySelectorAll(':scope > div.image > p');
  const ptag = (mediaPtags.length > 1)
  && [...mediaPtags].filter((mediaPtag) => mediaPtag.textContent.match(ASPECT_RATIO)?.index >= 0);
  if (ptag.length) {
    const formats = ptag[0].textContent.split(': ')[1]?.split(/\s+/);
    const formatClasses = formats ? ['format',
      `mobile-${formats[0]}`,
      `tablet-${formats[((formats.length - 2) > 0) ? (formats.length - 2) : 0]}`,
      `desktop-${formats[((formats.length - 1) > 0) ? (formats.length - 1) : 0]}`,
    ] : [];
    el.querySelector(':scope > div.image').classList.add(...formatClasses);
    ptag[0].remove();
  }
}

function decorateVideo(container) {
  const link = container.querySelector('a[href*=".mp4"]');
  if (!link) return;
  const isNotLooped = !!(link.hash?.includes('autoplay1'));
  const attrs = `playsinline autoplay ${isNotLooped ? '' : 'loop'} muted`;
  container.innerHTML = `<video preload="metadata" ${attrs}>
    <source src="${link.href}" type="video/mp4" />
  </video>`;
  container.classList.add('has-video');
}

function decorateBlockBg(block, node) {
  const viewports = ['mobile-only', 'tablet-only', 'desktop-only'];
  const childCount = node.childElementCount;
  const { children } = node;
  node.classList.add('background');
  if (childCount === 2) {
    children[0].classList.add(viewports[0], viewports[1]);
    children[1].classList.add(viewports[2]);
  }
  [...children].forEach(async (child, index) => {
    if (childCount === 3) {
      child.classList.add(viewports[index]);
    }
    decorateVideo(child);
  });
  if (!node.querySelector(':scope img') && !node.querySelector(':scope video')) {
    block.style.background = node.textContent;
    node.remove();
  }
}

function decorateLayout(el) {
  const elems = el.querySelectorAll(':scope > div');
  if (elems.length > 1) decorateBlockBg(el, elems[0]);
  const foreground = elems[elems.length - 1];
  foreground.classList.add('foreground', 'container');
  const text = foreground.querySelector('h1, h2, h3, h4, h5, h6, p')?.closest('div');
  text?.classList.add('text');
  const media = foreground.querySelector(':scope > div:not([class])');
  if (!el.classList.contains('notification')) media?.classList.add('image');
  const picture = text?.querySelector('picture');
  const iconArea = picture ? (picture.closest('p') || createTag('p', null, picture)) : null;
  iconArea?.classList.add('icon-area');
  const foregroundImage = foreground.querySelector(':scope > div:not(.text) img')?.closest('div');
  const bgImage = el.querySelector(':scope > div:not(.text) img')?.closest('div');
  const foregroundMedia = foreground.querySelector(':scope > div:not(.text) video')?.closest('div');
  const bgMedia = el.querySelector(':scope > div:not(.text) video')?.closest('div');
  const image = foregroundImage ?? bgImage;
  const asideMedia = foregroundMedia ?? bgMedia ?? image;
  if (asideMedia && !asideMedia.classList.contains('text')) {
    const isSplit = el.classList.contains('split');
    asideMedia.classList.add(`${isSplit ? 'split-' : ''}image`);
    if (isSplit) {
      const position = Array.from(asideMedia.parentNode.children).indexOf(asideMedia);
      el.classList.add(`split${!position ? '-right' : '-left'}`);
      foreground.parentElement.appendChild(asideMedia);
    }
    if (image && image.querySelector('a')?.dataset?.modalHash) {
      decorateModalImage(image);
    }
  } else if (!iconArea) {
    foreground?.classList.add('no-image');
  }
  if (el.classList.contains('split')
  && (el.classList.contains('medium')
  || el.classList.contains('large'))) {
    decorateIconStack(el);
    decorateImage(el);
  }
  return foreground;
}

export default function init(el) {
  const blockData = getBlockData(el);
  const blockText = decorateLayout(el);
  decorateBlockText(blockText, blockData);
  decorateStaticLinks(el);
}
