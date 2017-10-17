const words = require('word-list-json');

const wordsByLength = [];
for (let i = 2; i <= 28; i++) {
  wordsByLength[i] = new Set();
}

for (const w of words) {
  wordsByLength[w.length].add(w.toUpperCase());
}

export default wordsByLength;
