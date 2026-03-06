export function solveConstraintStack(input, constraints = []) {
  let result = { ...input };

  for (const constraint of constraints) {
    result = constraint(result);
  }

  return result;
}
