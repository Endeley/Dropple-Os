// runtime/dispatcher/history.js

export function createHistory(maxHistory = 100) {
  let stack = [];
  let pointer = -1;

  function push(state) {
    if (pointer < stack.length - 1) {
      stack = stack.slice(0, pointer + 1);
    }

    stack.push(state);

    if (stack.length > maxHistory) {
      stack.shift();
    } else {
      pointer++;
    }

    if (pointer > stack.length - 1) {
      pointer = stack.length - 1;
    }

    return current();
  }

  function undo() {
    if (pointer <= 0) return current();
    pointer -= 1;
    return current();
  }

  function redo() {
    if (pointer >= stack.length - 1) return current();
    pointer += 1;
    return current();
  }

  function current() {
    return stack[pointer] ?? stack[stack.length - 1];
  }

  function reset() {
    stack = [];
    pointer = -1;
  }

  return {
    push,
    undo,
    redo,
    current,
    reset,
  };
}
