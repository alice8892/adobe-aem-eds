import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

const { default: init } = await import('../../../libs/blocks/aside/aside.js');
const standardBody = await readFile({ path: './mocks/standard.html' });
const splitBody = await readFile({ path: './mocks/split.html' });

describe('aside', () => {
  describe('standard', () => {
    before(() => {
      document.body.innerHTML = standardBody;
      const blocks = document.querySelectorAll('.aside');
      blocks.forEach((el) => init(el));
    });

    it('allows a background color', () => {
      const el = document.querySelector('#test-default');
      expect(window.getComputedStyle(el)?.backgroundColor).to.equal('rgb(238, 238, 238)');
    });

    it('allows a background image', () => {
      expect(document.querySelector('#test-default-2 .background img')).to.exist;
    });

    it('allows an icon image', () => {
      expect(document.querySelector('#test-default .icon-area img')).to.exist;
    });

    it('has Detail M by default', () => {
      expect(document.querySelector('#test-default .detail-m')).to.exist;
    });

    it('has Heading XL by default', () => {
      expect(document.querySelector('#test-default .heading-xl')).to.exist;
    });

    it('has Body S by default', () => {
      expect(document.querySelector('#test-default p.body-s')).to.exist;
    });

    it('allows a cta', () => {
      expect(document.querySelector('#test-default .action-area .con-button')).to.exist;
    });

    it('allows supplemental text', () => {
      expect(document.querySelector('#test-default .supplemental-text')).to.exist;
    });

    it('allows a foreground image', () => {
      expect(document.querySelector('#test-default .foreground .image img')).to.exist;
    });

    it('allows text overrides', () => {
      const el = document.querySelector('#test-text-overrides');
      expect(el.querySelector('.detail-l')).to.exist;
      expect(el.querySelector('.heading-l')).to.exist;
      expect(el.querySelector('p.body-m')).to.exist;
    });

    it('allows Title L to override Detail', () => {
      const el = document.querySelector('#test-title');
      expect(el.querySelector('.detail-m.title-l')).to.exist;
    });

    it('allows an avatar', () => {
      const el = document.querySelector('#test-avatar');
      expect(el.querySelector('.avatar-area img')).to.exist;
    });

    // it('has a product lockup'); // To Do
  });

  describe('split', () => {
    before(() => {
      document.body.innerHTML = splitBody;
      const blocks = document.querySelectorAll('.aside');
      blocks.forEach((el) => init(el));
    });

    it('allows a background color', () => {
      const el = document.querySelector('#test-default');
      expect(window.getComputedStyle(el)?.backgroundColor).to.equal('rgb(30, 30, 30)');
    });

    it('allows an icon image', () => {
      expect(document.querySelector('#test-default .icon-area img')).to.exist;
    });

    it('has Detail M by default', () => {
      expect(document.querySelector('#test-default .detail-m')).to.exist;
    });

    it('has Heading XL by default', () => {
      expect(document.querySelector('#test-default .heading-xl')).to.exist;
    });

    it('has Body S by default', () => {
      expect(document.querySelector('#test-default p.body-s')).to.exist;
    });

    it('allows icon stack', () => {
      expect(document.querySelector('#test-default .icon-stack-area')).to.exist;
    });

    it('allows a cta', () => {
      expect(document.querySelector('#test-default .action-area .con-button')).to.exist;
    });

    it('allows supplemental text', () => {
      expect(document.querySelector('#test-default .supplemental-text')).to.exist;
    });

    it('allows a split image', () => {
      expect(document.querySelector('#test-default .split-image img')).to.exist;
    });

    it('allows text overrides', () => {
      const el = document.querySelector('#test-text-overrides');
      expect(el.querySelector('.detail-l')).to.exist;
      expect(el.querySelector('.heading-l')).to.exist;
      expect(el.querySelector('p.body-m')).to.exist;
    });

    it('allows Title L to override Detail', () => {
      const el = document.querySelector('#test-title');
      expect(el.querySelector('.detail-m.title-l')).to.exist;
    });

    it('allows an avatar', () => {
      const el = document.querySelector('#test-avatar');
      expect(el.querySelector('.avatar-area img')).to.exist;
    });

    // it('has a product lockup'); // To Do
  });
});
