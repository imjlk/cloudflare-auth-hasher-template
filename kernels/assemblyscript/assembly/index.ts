export function probeVersion(): i32 {
  return 1;
}

export function estimatedWorkUnits(inputLength: i32): i32 {
  if (inputLength < 0) {
    return 0;
  }

  return inputLength * 12;
}
