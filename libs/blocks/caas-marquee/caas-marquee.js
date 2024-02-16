// TODO: Test network latency and if code handles that correctly
// TODO: Go through all code paths to make sure no exceptions occur
// TODO: Fix variants inconsistently supporting both ',' and '' (lines 95, 115, 198, 213)
// TODO: Update SEGMENT_MAP with final from Martech team
// TODO: Update Spectra AI endpoint to final one (instead of pointing to local Chimera IO instance)
// TODO: Fix tablet responsive class issue

import { getMetadata } from '../caas-marquee-metadata/caas-marquee-metadata.js';
import { createTag, getConfig } from '../../utils/utils.js';

// TODO: Final list needs to come from Target List before release
const SEGMENT_MAP = {
  '5a5fd14e-f4ca-49d2-9f87-835df5477e3c': 'PHSP',
  '09bc4ba3-ebed-4d05-812d-a1fb1a7e82ae': 'IDSN',
  '25ede755-7181-4be2-801e-19f157c005ae': 'ILST',
  '07609803-48a0-4762-be51-94051ccffb45': 'PPRO',
  '73c3406b-32a2-4465-abf3-2d415b9b1f4f': 'AEFT',
  'bf632803-4412-463d-83c5-757dda3224ee': 'CCSN',
};

const WIDTHS = {
  split: 1199,
  mobile: 1440,
  tablet: 2048,
  desktop: 2400
}

const HEIGHTS = {
  split: 828,
  mobile: 992,
  tablet: 520,
  desktop: 813
}

const LANA_OPTIONS = {
  tags: 'caasMarquee',
};

function isProd() {
  const { host } = window.location;
  return !(host.includes('hlx.page')
    || host.includes('localhost')
    || host.includes('hlx.live')
    || host.includes('stage.adobe')
    || host.includes('corp.adobe'));
}

// Our Chimera-SM BE has no caching on lower tiered environments (as of now) and requests will time out for authors
// showing them fallback content.
const REQUEST_TIMEOUT = isProd() ? 1500 : 10000;

const typeSize = {
  small: ['xl', 'm', 'm'],
  medium: ['xl', 'm', 'm'],
  large: ['xxl', 'xl', 'l'],
  xlarge: ['xxl', 'xl', 'l'],
};

const IMAGE_EXTENSIONS = /^.*\.(jpg|jpeg|png|gif|bmp|svg|webp|tiff|ico|avif|jfif)$/;
const VIDEO_EXTENSIONS = /^.*\.(mp4|mpeg|mpg|mov|wmv|avi|webm|ogg)$/;

let segments = ['default'];

// See https://experienceleague.adobe.com/docs/experience-platform/destinations/catalog/personalization/custom-personalization.html?lang=en
// for more information on how to integrate with this API.
window.addEventListener('alloy_sendEvent', (e) => {
  if (e.detail.type === 'pageView') {
    let mappedUserSegments = [];
    let userSegmentIds = e.detail?.result?.destinations?.[0]?.segments || [];
    for(let userSegmentId of userSegmentIds){
      if(SEGMENT_MAP[userSegmentId]){
        mappedUserSegments.push(SEGMENT_MAP[userSegmentId]);
      }
    }
    if(mappedUserSegments.length){
      segments = mappedUserSegments;
    }
  }
});

async function getAllMarquees(promoId, origin) {
  // TODO: Update this to https://14257-chimera.adobeioruntime.net/api/v1/web/chimera-0.0.1/sm-collection before release
  const endPoint = 'https://14257-chimera-feature.adobeioruntime.net/api/v1/web/chimera-0.0.1/sm-collection';
  const payload = `originSelection=${origin}&marqueeId=${promoId}&language=en&country=US`;

  // { signal: AbortSignal.timeout(TIMEOUT_TIME) } is way to cancel a request after T seconds using fetch
  // See https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static
  return fetch(`${endPoint}?${payload}`, { signal: AbortSignal.timeout(REQUEST_TIMEOUT) }).then((res) => res.json()).catch(error => {
    window.lana?.log(`getAllMarquees failed: ${error}`, LANA_OPTIONS);
  });
}

/**
 * function getMarqueeId() : Eventually from Spectra API
 * @returns {string} id - currently marquee index (eventually will be marquee ID from Spectra)
 */
async function getMarqueeId() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('marqueeId')) return urlParams.get('marqueeId');
  let visitedLinks = [document.referrer];

  if(segments.includes('default')){
    window.lana?.log(`Segment didn't load in time, sending default profile to Spectra AI`, LANA_OPTIONS);
  }

  // { signal: AbortSignal.timeout(TIMEOUT_TIME) } is way to cancel a request after T seconds using fetch
  // See https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static

  // TODO: Update this to final Spectra AI model before release
  let response = await fetch('https://14257-chimera-sanrai.adobeioruntime.net/api/v1/web/chimera-0.0.1/models', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'ChimeraAcom'
    },
    body: `{"endpoint":"community-recom-v1","contentType":"application/json","payload":{"data":{"visitedLinks": ${visitedLinks}, "segments": ${segments}}}}`,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  }).catch(error => {
    window.lana?.log(`getMarqueeId failed: ${error}`, LANA_OPTIONS);
  });
  let json = await response.json();
  return json?.data?.[0]?.content_id || '';
}

/**
 * function normalizeData()
 * @param {*} data - marquee JSON data
 * @returns {Object} metadata - marquee data
 */
function normalizeData(data) {
  const images = {
    tablet: data.arbitrary?.find((item) => item.key === 'imageTablet')?.value || '',
    desktop: data.arbitrary?.find((item) => item.key === 'imageDesktop')?.value || '',
  };

  const metadata = {
    id: data.id || '',
    title: data.contentArea?.title || '',
    description: data.contentArea?.description || '',
    details: data.contentArea?.detailText || '',
    image: data.styles?.backgroundImage || '',
    imagetablet: images.tablet || '',
    imagedesktop: images.desktop || '',
    cta1url: data.footer[0].right[0]?.href || '',
    cta1text: data.footer[0]?.right[0]?.text || '',
    cta1style: data.footer[0]?.right[0]?.style || '',
    cta2url: data.footer[0]?.center[0]?.href || '',
    cta2text: data.footer[0]?.center[0]?.text || '',
    cta2style: data.footer[0]?.center[0]?.style || '',
  };

  const arbitrary = {};
  data.arbitrary?.forEach((item) => { arbitrary[item.key] = item.value; });
  metadata.variant = arbitrary.variant || 'dark, static-links';
  metadata.backgroundcolor = arbitrary.backgroundColor;

  return metadata;
}

function getVideoHtml(src){
  return `<video autoplay muted playsinline> <source src="${src}" type="video/mp4"></video>`
}

function getImageHtml(src, screen){
  let format = (screen === 'desktop' || screen === 'split') ? 'png' : 'jpeg';
  let style = (screen === 'desktop') ? 'style="object-position: 32% center;"' : '';
  let fetchPriority = (screen === 'mobile') ? 'fetchpriority="high"' : '';
  let loadingType = (screen === 'mobile' || screen === 'split') ? 'eager' : 'lazy';
  let width = WIDTHS[screen];
  let height = HEIGHTS[screen];
  return `<picture>
        <source type="image/webp" srcset="${src}?width=2000&amp;format=webply&amp;optimize=medium" media="(min-width: 600px)">
        <source type="image/webp" srcset="${src}?width=750&amp;format=webply&amp;optimize=medium">
        <source type="image/${format}" srcset="${src}?width=2000&amp;format=${format}&amp;optimize=medium" media="(min-width: 600px)">
        <img loading="${loadingType}" alt src="${src}?width=750&amp;format=${format}&amp;optimize=medium" width="${width}" height="${height}" ${fetchPriority} ${style}>
  </picture>`
}

function getContent(src, screen){
  const isImage = IMAGE_EXTENSIONS.test(src);
  const isVideo = VIDEO_EXTENSIONS.test(src);
  let inner = ''
  if(isImage) {
    inner = getImageHtml(src, screen);
  }
  if(isVideo) {
    inner = getVideoHtml(src);
  }
  if(screen === 'split'){
    return `<div data-valign="middle" class="asset image bleed">${inner}</div>`
  }
  return `<div class=${screen}-only>${inner}</div>`
}

/**
 * function renderMarquee()
 * @param {HTMLElement} marquee - marquee container
 * @param {Object} data - marquee data
 * @param {string} id - marquee id
 * @returns {void}
 */
export function renderMarquee(marquee, data, id, fallback) {
  let chosen = data?.cards?.find(obj => obj.id === id);
  let shouldRenderMarquee = data?.cards?.length && chosen;
  const metadata = shouldRenderMarquee ? normalizeData(chosen) : fallback;

  // remove loader
  marquee.innerHTML = '';
  if(metadata.backgroundcolor){
    marquee.style.backgroundColor = metadata.backgroundcolor;
  }

  // configure block font sizes
  const classList = metadata.variant.split(',').map((c) => c.trim());
  const isSplit = metadata.variant.includes('split');
  // TODO: Update this to using a map to prevent nested ternaries
  /* eslint-disable no-nested-ternary */
  const size = classList.includes('small') ? 'small'
    : classList.includes('medium') ? 'medium'
      : classList.includes('large') ? 'large'
        : 'xlarge';
  /* eslint-enable no-nested-ternary */

  // background content
  const mobileBgContent = getContent(metadata.image, 'mobile');
  const tabletBgContent = getContent(metadata.imagetablet, 'tablet');
  const desktopBgContent = getContent(metadata.imagedesktop, 'desktop');
  const splitContent = getContent(metadata.imagedesktop, 'split');

  const bgContent = `${mobileBgContent}${tabletBgContent}${desktopBgContent}`;
  let background = createTag('div', { class: 'background' });
  if(isSplit) {
    let parser = new DOMParser();
    background = parser.parseFromString(splitContent, 'text/html').body.childNodes[0];
  } else {
    background.innerHTML = bgContent;
  }

  let cta1Style = (metadata.cta1style === "blue" || metadata.cta1style === "outline") ?
    `con-button ${metadata.cta1style} button-${typeSize[size][1]} button-justified-mobile` : "";

  let cta2Style = (metadata.cta2style === "blue" || metadata.cta2style === "outline") ?
    `con-button ${metadata.cta2style} button-${typeSize[size][1]} button-justified-mobile` : "";

  // foreground content
  let cta = metadata.cta1url
    ? `<a 
      class="${cta1Style}" 
      href="${metadata.cta1url}">${metadata.cta1text}</a>`
    : '';

  /*
    Note: Modal must be written exactly in this format to be picked up by milo decorators.
    Other formats/structures will not work.
    <a
      href="#abc"
      data-modal-path="/fragment/path-to-fragment"
      data-modal-hash="#abc">
        Some Modal Text
    </a>
   */

  if(metadata.cta1url?.includes('fragment')){
    let fragment = metadata.cta1url.split("#")[0];
    let hash = metadata.cta1url.split("#")[1];
    cta = `<a href="#${hash}" data-modal-path="${fragment}" data-modal-hash="#${hash}" daa-ll="${metadata.cta1text}" class="modal link-block ${cta1Style}">${metadata.cta1text}</a>`
  }

  let cta2 = metadata.cta2url
    ? `<a 
      class="${cta2Style}"
      href="${metadata.cta2url}">${metadata.cta2text}</a>`
    : '';

  if(metadata.cta2url?.includes('fragment')){
    let fragment = metadata.cta2url.split("#")[0];
    let hash = metadata.cta2url.split("#")[1];
    cta2 = `<a href="#${hash}" data-modal-path="${fragment}" data-modal-hash="#${hash}" daa-ll="${metadata.cta2text}" class="modal link-block ${cta2Style}">${metadata.cta2text}</a>`
  }

  const fgContent = `<div class="text">
    <p class="detail-l">${metadata.details}</p>
    <h1 class="heading-${typeSize[size][0]}">${metadata.title}</h1>
    <p class="body-${typeSize[size][1]}">${metadata.description}</p>
    <p class="action-area">
      ${cta} 
      ${cta2}
      </p>  
  </div>`;

  const foreground = createTag('div', { class: 'foreground container' });
  foreground.innerHTML = fgContent;

  // apply marquee variant to viewer
  if (metadata.variant) {
    const classes = metadata.variant.split(' ').map((c) => c.trim());
    marquee.classList.add(...classes);
  }

  // Note: Added data-block so marquee can be picked up by milo analytics decorators
  marquee.setAttribute('data-block', '');
  marquee.append(background, foreground);
}

/**
 * function init()
 * @param {*} el - element with metadata for marquee
 */
export default async function init(el) {
  const metadata = getMetadata(el);
  const promoId = metadata.promoid;
  const origin = getConfig().chimeraOrigin || metadata.origin;

  // We shouldn't be adding variant properties from the viewer table as the requirements are each marquee has
  // all their viewing properties completely self-contained.
  // const marquee = createTag('div', { class: `marquee split ${metadata.variant.replaceAll(',', ' ')}` });
  const marquee = createTag('div', { class: `marquee split` });

  // Only in the case of a fallback should we use the variant fields from the viewer table.
  const fallbackVariants = metadata.variant.split(',');
  marquee.innerHTML = '<div class="lds-ring LOADING"><div></div><div></div><div></div><div></div></div>';
  el.parentNode.prepend(marquee);

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('previewFallback')) {
    // This query param ensures authors can verify the fallback looks good before publishing live.
    // Requirement:
    // As long as we add easy way for authors to preview their fallback content (via query param)
    // Then we don't have to hardcode any fallbacks in the code.
    marquee.classList.add(...fallbackVariants);
    await renderMarquee(marquee, [], '', metadata);
    return;
  }

  /*
    Note: We cannot do the following code to get the Marquees
    due to performance issues.

    const allMarqueesJson = await getAllMarquees();
    const selectedId = await getMarqueeId();
    await renderMarquee(marquee, allMarqueesJson, selectedId);

    This will cause the code to run synchronously and be blocking.

    See the MDN docs warning not to do this for more context/information:
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all#using_promise.all_with_async_functions

    We need to use Promise.all to get all the information we need in parallel.

    See LH scores by using Promise.all here:
    https://pagespeed.web.dev/analysis/https-caas-marquee-viewer-lh-test--milo--adobecom-hlx-page-drafts-sanrai-marquee-viewer-cc-lapsed/av1124mjs0?form_factor=mobile

  */
  try {
    const [selectedId, allMarqueesJson] = await Promise.all([
      getMarqueeId(),
      getAllMarquees(promoId, origin)
    ]);
    await renderMarquee(marquee, allMarqueesJson, selectedId, metadata);
  } catch(e){
    marquee.classList.add(...fallbackVariants);
    await renderMarquee(marquee, [], '', metadata);
  }
}
