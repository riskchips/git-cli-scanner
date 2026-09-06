/**
 * Advanced Dummy Detection Engine
 * Strictly identifies if a matched string is an obvious dummy/test secret.
 */
export function isDummySecret(match: string): boolean {
  const lowerMatch = match.toLowerCase();

  // 1. Common dummy placeholder words
  const dummyWords = [
    'example',
    'dummy',
    'test',
    'fake',
    'demo',
    'sample',
    'your_',
    'insert_',
    'replace_',
    'placeholder',
    'my-secret',
    'SOME_LONG_TOKEN'
  ];

  for (const word of dummyWords) {
    if (lowerMatch.includes(word)) {
      return true;
    }
  }

  // 2. Known standard test keys (AWS, Google, etc)
  const knownDummies = [
    'AKIAIOSFODNN7EXAMPLE', // AWS Test Key
    'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY' // AWS Test Secret
  ];

  for (const known of knownDummies) {
    if (match.includes(known)) {
      return true;
    }
  }

  // 3. Low entropy / repeating sequences
  const lowEntropyRegex = /(123456789|abcdef|000000|111111|xxxxxx)/i;
  if (lowEntropyRegex.test(lowerMatch)) {
    return true;
  }

  return false;
}
