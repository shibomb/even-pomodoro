/**
 * Large dot-matrix numbers using ■ (filled) and □ (empty)
 * Each digit is 5 rows x 3 columns
 */

const dotNumbers: Record<number, string[]> = {
  0: [
    '■■■',
    '■□■',
    '■□■',
    '■□■',
    '■■■',
  ],
  1: [
    '□■□',
    '□■□',
    '□■□',
    '□■□',
    '□■□',
  ],
  2: [
    '■■■',
    '□□■',
    '■■■',
    '■□□',
    '■■■',
  ],
  3: [
    '■■■',
    '□□■',
    '■■■',
    '□□■',
    '■■■',
  ],
  4: [
    '■□■',
    '■□■',
    '■■■',
    '□□■',
    '□□■',
  ],
  5: [
    '■■■',
    '■□□',
    '■■■',
    '□□■',
    '■■■',
  ],
  6: [
    '■■■',
    '■□□',
    '■■■',
    '■□■',
    '■■■',
  ],
  7: [
    '■■■',
    '□□■',
    '□□■',
    '□□■',
    '□□■',
  ],
  8: [
    '■■■',
    '■□■',
    '■■■',
    '■□■',
    '■■■',
  ],
  9: [
    '■■■',
    '■□■',
    '■■■',
    '□□■',
    '■■■',
  ],
};

/**
 * Render a number (0-9) as large dot-matrix string array
 * Returns 5 lines of text, one line per row
 */
export function getDotNumber(num: number): string[] {
  const digit = Math.max(0, Math.min(9, num));
  return dotNumbers[digit];
}

/**
 * Render seconds (0-59) as a 2-digit display
 * Returns 5 lines of text with both digits side by side
 */
export function getDotNumberTwoDigits(seconds: number): string[] {
  const sec = Math.max(0, Math.min(99, Math.floor(seconds)));
  const tens = Math.floor(sec / 10);
  const ones = sec % 10;

  const tensLines = dotNumbers[tens];
  const onesLines = dotNumbers[ones];

  return [
    tensLines[0] + ' ' + onesLines[0],
    tensLines[1] + ' ' + onesLines[1],
    tensLines[2] + ' ' + onesLines[2],
    tensLines[3] + ' ' + onesLines[3],
    tensLines[4] + ' ' + onesLines[4],
  ];
}
