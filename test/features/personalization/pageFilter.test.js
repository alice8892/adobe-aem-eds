import { expect } from '@esm-bundle/chai';
import { readFile } from '@web/test-runner-commands';
import { stub } from 'sinon';
import { createTag, getConfig, updateConfig } from '../../../libs/utils/utils.js';
import { applyPers } from '../../../libs/features/personalization/personalization.js';

document.body.innerHTML = await readFile({ path: './mocks/test1.html' });

const noop = () => {};

it('pageFilter should exclude page if it is not a match', async () => {
  let manifestJson = await readFile({ path: './mocks/manifestPageFilterExclude.json' });
  manifestJson = JSON.parse(manifestJson);
  const replacePageHtml = await readFile({ path: './mocks/replacePage.plain.html' });

  window.fetch = stub();
  window.fetch.onCall(0).returns(
    new Promise((resolve) => {
      resolve({
        ok: true,
        json: () => manifestJson,
      });
    }),
  );
  window.fetch.onCall(1).returns(
    new Promise((resolve) => {
      resolve({
        ok: true,
        text: () => replacePageHtml,
      });
    }),
  );

  expect(document.querySelector('.marquee')).to.not.be.null;
  expect(document.querySelector('.newpage')).to.be.null;

  await applyPers(
    // Path doesn't matter as we stub fetch above
    [{ manifestPath: '/path/to/manifest.json' }],
    { createTag, getConfig, updateConfig, loadLink: noop, loadScript: noop },
  );

  // Nothing should be changed since the pageFilter excludes this page
  expect(document.querySelector('.marquee')).to.not.be.null;
  expect(document.querySelector('.newpage')).to.be.null;
});

it('pageFilter should include page if it is a match', async () => {
  let manifestJson = await readFile({ path: './mocks/manifestPageFilterInclude.json' });
  manifestJson = JSON.parse(manifestJson);
  const replacePageHtml = await readFile({ path: './mocks/replacePage.plain.html' });

  window.fetch = stub();
  window.fetch.onCall(0).returns(
    new Promise((resolve) => {
      resolve({
        ok: true,
        json: () => manifestJson,
      });
    }),
  );
  window.fetch.onCall(1).returns(
    new Promise((resolve) => {
      resolve({
        ok: true,
        text: () => replacePageHtml,
      });
    }),
  );

  expect(document.querySelector('.marquee')).to.not.be.null;
  expect(document.querySelector('.newpage')).to.be.null;

  await applyPers(
    // Path doesn't matter as we stub fetch above
    [{ manifestPath: '/path/to/manifest.json' }],
    { createTag, getConfig, updateConfig, loadLink: noop, loadScript: noop },
  );

  // Nothing should be changed since the pageFilter excludes this page
  expect(document.querySelector('.marquee')).to.be.null;
  expect(document.querySelector('.newpage')).to.not.be.null;
});
