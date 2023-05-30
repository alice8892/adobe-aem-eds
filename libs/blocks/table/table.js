import { createTag } from '../../utils/utils.js';

let originTable;

const positionStickyRows = (table) => {
  const tableRec = table.getBoundingClientRect();
  const tableBottom = tableRec.top + tableRec.height;
  const gnav = document.querySelector('header');
  const gnavHeight = gnav ? gnav.getBoundingClientRect().height : 0;
  const highlightRow = table.querySelector('.row-highlight');
  const highlightHeight = highlightRow ? highlightRow.getBoundingClientRect().height : 0;
  const highlightCells = highlightRow ? highlightRow.querySelectorAll(':scope > div') : null;
  const headerRow = table.querySelector('.row-header');
  const headerRowHeight = headerRow.getBoundingClientRect().height;
  const headerRowBottom = gnavHeight + highlightHeight + headerRowHeight;
  const headerCells = headerRow.querySelectorAll(':scope > div');
  const nextRow = table.querySelector('.row-header + div');
  const nextCells = nextRow ? nextRow.querySelectorAll(':scope > div') : null;
  const lastRow = table.querySelector(':scope > div:last-child');
  const lastRowRec = lastRow.getBoundingClientRect();

  if (!nextRow) return;
  if (tableRec.top < gnavHeight && tableBottom > gnavHeight) {
    nextCells.forEach((cell, index) => {
      const cellWidth = getComputedStyle(cell).width;
      if (highlightCells && highlightCells[index]) highlightCells[index].style.width = `${cellWidth}px`;
      if (headerCells[index]) headerCells[index].style.width = `${cellWidth}px`;
    });
    table.classList.add('table-sticky-on');
    nextRow.style.marginTop = `${highlightHeight + headerRowHeight}px`;
    headerRow.style.width = `${tableRec.width}px`;
    if (highlightRow) {
      highlightRow.style.width = `${tableRec.width}px`;
    }
    if (headerRowBottom < lastRowRec.top) {
      // lock under gnav
      if (highlightRow) {
        highlightRow.style.top = `${gnavHeight}px`;
      }
      headerRow.style.top = `${gnavHeight + highlightHeight}px`;
    } else {
      // scroll off
      if (highlightRow) {
        highlightRow.style.top = `${lastRowRec.top - headerRowHeight - highlightHeight}px`;
      }
      headerRow.style.top = `${lastRowRec.top - headerRowHeight}px`;
    }
  } else {
    highlightCells?.forEach((cell) => {
      cell.style.width = null;
    });
    headerCells.forEach((cell) => {
      cell.style.width = null;
    });
    table.classList.remove('table-sticky-on');
    nextRow.style.marginTop = null;
    headerRow.style.width = null;
    headerRow.style.top = null;
    if (highlightRow) {
      highlightRow.style.width = null;
      highlightRow.style.top = null;
    }
  }
};

const addStickyListeners = (table, highlightOn) => {
  window.addEventListener('scroll', () => {
    positionStickyRows(table, highlightOn);
  });
  window.addEventListener('resize', () => {
    positionStickyRows(table, highlightOn);
  });
};

export default function init(el) {
  // remove top row if empty
  // const firstRow = el.querySelector(':scope > div:first-child');
  // if (firstRow.innerText.trim() === '') firstRow.remove();

  const highlightOn = el.classList.contains('highlight');

  const rows = Array.from(el.children);
  rows.forEach((row, rdx) => {
    row.classList.add('row', `row-${rdx + 1}`);
    if (highlightOn && rdx === 0) {
      row.classList.add('row-highlight');
    } else if ((highlightOn && rdx === 1) || (!highlightOn && rdx === 0)) {
      row.classList.add('row-header');
    }

    const cols = Array.from(row.children);
    cols.forEach((col, cdx) => {
      col.classList.add('col', `col-${cdx + 1}`);
      col.dataset.colIndex = cdx + 1;
      if (rdx === 1) {
        col.classList.add('col-heading');
      }
      if (rdx === 0) {
        col.classList.add('col-highlight');
      }
    });
  });

  const isMerchTable = el.classList.contains('merch');

  handleSectionHead(el);
  handleHeading(el);
  handleHovering(el);
  handleHighlight(el);
  handleScrollEffect(el);
  if (isMerchTable) formatMerchTable(el);

  if (el.classList.contains('sticky-top')) addStickyListeners(el, highlightOn);

  window.addEventListener('milo:icons:loaded', () => {
    applyStylesBasedOnScreenSize(el);
    window.addEventListener('resize', () => applyStylesBasedOnScreenSize(el));
  });
}

function handleHighlight(table) {
  const rows = table.querySelectorAll('.row');
  const highlightCols = rows[0].querySelectorAll('.col');
  const headingCols = rows[1].querySelectorAll('.col');

  highlightCols.forEach((col, i) => {
    const hasText = headingCols[i].innerText && col.innerText;

    if (hasText) {
      col.classList.add('col-highlight');
      headingCols[i].classList.add('no-rounded');
    } else {
      col.classList.add('hidden');
    }
  });
}

function handleSectionHead(table) {
  const isMerchTable = table.classList.contains('merch');

  if (isMerchTable) {
    const merchCols = Array.from(table.querySelectorAll('.col'));
    const merhContentCols = merchCols.filter((col) => !col.parentElement.classList.contains('row-1') && !col.parentElement.classList.contains('row-2'));

    merhContentCols.forEach((e) => {
      if (e.firstElementChild && e.firstElementChild.tagName === 'STRONG') {
        e.classList.add('sectionTitle');
      } else {
        e.classList.add('col-merch');
      }
    });
  } else {
    const rows = table.querySelectorAll('.row');

    rows.forEach((row, i) => {
      if (i > 1) {
        const title = row.querySelector('.col-1');
        const { firstElementChild } = title;

        if (firstElementChild && firstElementChild === row.getElementsByTagName('strong')[0]) {
          title.classList.add('sectionTitle');
          row.classList.add('sectionHead');
        } else {
          title.classList.add('subSectionTitle');
          row.classList.add('subSection');
        }
      }
    });
  }
}

function applyStylesBasedOnScreenSize(table) {
  if (!(table instanceof Element)) {
    return;
  }

  if (!originTable) {
    originTable = table.cloneNode(true);
    console.log(originTable);
  }

  const desktopSize = 900;
  const mobileSize = 768;
  const screenWidth = window.innerWidth;

  const mobileRenderer = () => {
    const isMerch = table.classList.contains('merch');
    if (isMerch) {
      table.querySelectorAll('.col:not(.col-1, .col-2)').forEach((col) => col.remove());
    } else {
      table.querySelectorAll('.col:not(.col-1, .col-2, .col-3), .col.no-borders').forEach((col) => col.remove());
    }

    const filterChangeEvent = () => {
      table.innerHTML = originTable.innerHTML;
      table.querySelectorAll('.subSection').forEach((subSection) => {
        subSection.style.gridTemplateColumns = 'repeat(auto-fit, 50%)';
      });
      const filters = Array.from(table.parentElement.querySelectorAll('.filter')).map((f) => parseInt(f.value, 10));
      if (isMerch) {
        table.querySelectorAll(`.col:not(.col-${filters[0]}, .col-${filters[1]})`).forEach((col) => col.remove());
      } else {
        table.querySelectorAll(`.col:not(.col-1, .col-${filters[0] + 1}, .col-${filters[1] + 1}), .col.no-borders`).forEach((col) => col.remove());
      }
      if (filters[0] > filters[1]) {
        table.querySelectorAll('.row').forEach((row) => {
          row.querySelector('.col:not(.subSectionTitle)').style.order = 1;
        });
      } else if (filters[0] === filters[1]) {
        table.querySelectorAll('.row').forEach((row) => {
          row.append(row.querySelector('.col:last-child').cloneNode(true));
        });
      }
    };

    // filter
    if (!table.parentElement.querySelector('.filters')) {
      const filters = createTag('div', { class: 'filters' });
      const filter1 = createTag('div', { class: 'filter-wrapper' });
      const filter2 = createTag('div', { class: 'filter-wrapper' });
      const colSelect0 = createTag('select', { class: 'filter' });
      const headings = originTable.querySelectorAll('.col-heading');
      headings.forEach((heading, index) => {
        const title = heading.querySelector('.heading-title');
        if (!title) return;
        const option = createTag('option');
        option.value = index;
        option.innerHTML = title.innerText;
        colSelect0.append(option);
      });
      const colSelect1 = colSelect0.cloneNode(true);
      colSelect0.dataset.filterIndex = 0;
      colSelect1.dataset.filterIndex = 1;
      const visibleCols = table.querySelectorAll('.col-heading:not([style*="display: none"])');
      colSelect0.querySelectorAll('option').item(visibleCols.item(0).dataset.colIndex - (isMerch ? 1 : 2)).selected = true;
      colSelect1.querySelectorAll('option').item(visibleCols.item(1).dataset.colIndex - (isMerch ? 1 : 2)).selected = true;
      filter1.append(colSelect0);
      filter2.append(colSelect1);
      filters.append(filter1, filter2);
      filter1.addEventListener('change', filterChangeEvent);
      filter2.addEventListener('change', filterChangeEvent);
      table.parentElement.prepend(filters);
    }
  };

  // For Mobile
  if (screenWidth <= mobileSize) {
    mobileRenderer();
  } else if (originTable) {
    table.innerHTML = originTable.innerHTML;
  }

  const subSectionRows = Array.from(table.getElementsByClassName('subSection'));
  if (subSectionRows.length > 0) {
    const colsForTablet = subSectionRows[0].children.length - 1;
    const percentage = 100 / colsForTablet;
    const templateColumnsValue = `repeat(auto-fit, ${percentage}%)`;

    subSectionRows.forEach((row) => {
      if (screenWidth >= desktopSize) {
        row.style.gridTemplateColumns = 'repeat(auto-fit, minmax(100px, 1fr))';
      } else if (screenWidth <= mobileSize) {
        row.style.gridTemplateColumns = 'repeat(auto-fit, 50%)';
      } else {
        row.style.gridTemplateColumns = templateColumnsValue;
      }
    });
  }
}

function formatMerchTable(table) {
  const rows = table.querySelectorAll('.row');
  const rowsNum = rows.length;

  const firstRow = rows[0];
  const colsInRow = firstRow.querySelectorAll('.col');
  const colsInRowNum = colsInRow.length;

  for (let i = colsInRowNum; i > 0; i--) {
    const cols = table.querySelectorAll(`.col-${i}`);
    for (let j = rowsNum - 1; j >= 0; j--) {
      const currentCol = cols[j];
      if (!currentCol.innerText && currentCol.children.length === 0) {
        currentCol.classList.add('no-borders');
      } else {
        currentCol.classList.add('border-bottom');
        break;
      }
    }
  }
}

function handleHeading(table) {
  const row1 = table.querySelector('.row-1');
  const row2 = table.querySelector('.row-2');
  const cols1 = row1.querySelectorAll('.col');
  const cols2 = row2.querySelectorAll('.col');

  cols2.forEach((col, i) => {
    const isEmpty = col.innerHTML === '';

    if (isEmpty) {
      const nextCol = cols2[i + 1];
      nextCol.classList.add('left-top-rounded');
      col.classList.add('no-borders');
      cols1[i].classList.add('no-borders');
    } else {
      const elements = col.children;
      const hasElements = elements.length > 0;

      if (!hasElements) {
        const innerText = col.innerHTML;
        col.innerHTML = `<p class="heading-title">${innerText}</p>`;
      } else {
        elements[0].classList.add('heading-title');

        if (elements[1]) {
          elements[1].classList.add('pricing');
        }

        decorateButtons(col, 'button-l');
      }
    }
  });
}

function handleHovering(table) {
  const row1 = table.querySelector('.row-1');
  const colsInRowNum = row1.childElementCount;

  const isMerchTable = table.classList.contains('merch');
  const startValue = isMerchTable ? 1 : 2;

  for (let i = startValue; i <= colsInRowNum; i++) {
    const elements = table.querySelectorAll(`.col-${i}`);
    elements.forEach((e) => {
      e.addEventListener('mouseover', () => handleMouseOver(elements, table, i));
      e.addEventListener('mouseout', () => handleMouseOut(elements));
    });
  }
}

function handleMouseOver(elements, table, colNum) {
  handleMouseOut(elements);

  const secondRow = table.querySelector('.row-2');
  const colClass = `col-${colNum}`;

  elements.forEach((e) => {
    if (e.classList.contains('col-highlight') && e.innerText) {
      const matchingCols = Array.from(e.classList).filter((className) => className.startsWith(colClass));

      matchingCols.forEach((className) => {
        const noTopBorderCol = secondRow.querySelector(`.${className}`);
        noTopBorderCol.classList.add('no-top-border');
      });
    }

    e.classList.add('hover');
  });
}

function handleMouseOut(elements) {
  elements.forEach((e) => {
    e.classList.remove('hover');
    e.classList.remove('no-top-border');
  });
}

function handleScrollEffect(table) {
  const header = table.querySelector('.row-2');
  const intercept = document.createElement('div');
  intercept.setAttribute('data-observer-intercept', '');
  header.insertAdjacentElement('beforebegin', intercept);
  const observer = new IntersectionObserver(([entry]) => {
    header.classList.toggle('active', !entry.isIntersecting);
  });
  observer.observe(intercept);
}

export function decorateButtons(el, size) {
  const buttons = el.querySelectorAll('em a, strong a');
  if (buttons.length === 0) return;
  buttons.forEach((button) => {
    const parent = button.parentElement;
    const buttonType = parent.nodeName === 'STRONG' ? 'blue' : 'outline';
    button.classList.add('con-button', buttonType);
    if (size) button.classList.add(size); /* button-l, button-xl */
    parent.insertAdjacentElement('afterend', button);
    parent.remove();
  });
  const actionArea = buttons[0].closest('p, div');
  if (actionArea) {
    actionArea.classList.add('action-area');
    actionArea.nextElementSibling?.classList.add('supplemental-text', 'body-xl');
  }
}
