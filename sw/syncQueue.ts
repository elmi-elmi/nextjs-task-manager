// sw/syncQueue.ts
import localforage from 'localforage';
import type { AppDispatch } from '@/store/store';

const queue = localforage.createInstance({ name: 'taskQueue' });

export type QueuedAction = Parameters<AppDispatch>[0];

export const enqueueAction = async (action: QueuedAction) => {
  const actions = (await queue.getItem<QueuedAction[]>('actions')) || [];
  actions.push(action);
  await queue.setItem('actions', actions);
};

export const flushQueue = async (dispatch: AppDispatch) => {
  const actions = (await queue.getItem<QueuedAction[]>('actions')) || [];
  for (const a of actions) {
    // dispatch raw action object
    try {
      dispatch(a);
    } catch (err) {
      console.error('flushQueue dispatch error:', err);
    }
  }
  await queue.removeItem('actions');
};

export const setupOnlineListener = (dispatch: AppDispatch) => {
  window.addEventListener('online', () => {
    flushQueue(dispatch).catch((e) => console.error(e));
  });
};
