import { nanoid } from 'nanoid';

export function createOptimisticTx(event) {
  return {
    txId: nanoid(),
    event,
  };
}
