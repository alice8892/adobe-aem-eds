import { rolloutLang } from '../utils/miloc.js';
import { languages, polling } from '../utils/state.js';
import { getModal } from '../../modal/modal.js';
import Modal from './modal.js';
import { createTag } from '../../../utils/utils.js';

export function showUrls(item, prefix) {
  const div = createTag('div');
  const content = Modal(div, item, prefix);
  const modalOpts = {
    class: 'locui-modal',
    id: 'locui-modal',
    content,
    closeEvent: 'closeModal',
  };
  return getModal(null, modalOpts);
}

export async function rollout(item, idx) {
  console.log('start rollout');
  const reroll = item.status === 'completed';
  const retry = item.status === 'error';

  // stop polling until request is done
  console.log('pause polling');
  polling.value = false;

  // Update the UI immediate instead of waiting on polling
  languages.value[idx].status = retry ? 'retrying' : 'rolling-out';
  languages.value[idx].done = 0;
  languages.value = [...languages.value];

  if (retry) await rolloutLang(item.code, reroll, 'retry', 'Retry.');
  else await rolloutLang(item.code, reroll);

  // start status polling again when request finishes
  console.log('restart polling');
  polling.value = true;
}

export function showLangErrors(event, item) {
  if (!item.errors.length
    || event.target.classList.contains('locui-subproject-locale')) return null;
  const div = createTag('div');
  const content = Modal(div, item, null, item);
  const modalOpts = {
    class: 'locui-modal-errors',
    id: 'locui-modal',
    content,
    closeEvent: 'closeModal',
  };
  return getModal(null, modalOpts);
}