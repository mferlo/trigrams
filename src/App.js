import React, { Component } from 'react';
import wordsByLength from './Dictionary.js';

// TODO:
//  * align suggestion to be below word
//  * UI

class Trigram {
  constructor(letters) {
    this.letters = letters;
    this.assignedTo = null;
  }
}

class PatternTrigram {
  constructor(pattern) {
    this.pattern = pattern;
    this.assignedTrigram = null;
  }

  getText() {
    let result = "";
    let replacementLetters = this.assignedTrigram || "___";
    let replacementIndex = 0;

    for (let i = 0; i < this.pattern.length; i++) {
      if (this.pattern[i] === "") {
        result += replacementLetters.charAt(replacementIndex);
        replacementIndex++;
      } else {
        result += this.pattern[i];
      }
    }
    return result;
  }
}

class Pattern {

  static* parse(inputString) {
    let trigramNumber = 0;
    let trigramIndex = 0;
    let wordNumber = 0;
    let currentNumber = "";

    const yieldBlanks = function*() {
      for (let j = 0; j < Number.parseInt(currentNumber, 10); j++) {
        yield { trigramNumber, trigramIndex, wordNumber, value: "" };
        trigramIndex += 1;
        if (trigramIndex === 3) {
          trigramIndex = 0;
          trigramNumber += 1;
        }
      }
      currentNumber = "";
    }

    for (let i = 0; i < inputString.length; i++) {
      const ch = inputString.charAt(i);
      if (ch.match(/\d/)) {
        currentNumber += ch;
      } else {
        yield* yieldBlanks();
        yield { trigramNumber, trigramIndex, wordNumber, value: ch };
        if (ch === " ") {
          wordNumber += 1;
        }
      }
    }

    // Maybe we got to the end without seeing more punctuation
    wordNumber += 1;
    yield* yieldBlanks();
  }

  static* extractTrigrams(pattern) {
    let startIndex = 0;

    do {
      const currentTrigram = pattern[startIndex].trigramNumber;

      let endIndex = startIndex;
      while (endIndex < pattern.length && pattern[endIndex].trigramNumber === currentTrigram) {
        endIndex += 1;
      }
      yield new PatternTrigram(pattern.slice(startIndex, endIndex).map(p => p.value));

      startIndex = endIndex;
    } while (startIndex < pattern.length)
  }

  static* extractWords(pattern) {
    let startIndex = 0;
    do {
      const index = pattern[startIndex].wordNumber;
      let charCount = 0;

      let endIndex = startIndex;
      while (endIndex < pattern.length && pattern[endIndex].wordNumber === index) {
        if (pattern[endIndex].value === "") {
          charCount += 1;
        }
        endIndex += 1;
      }

      const patternUsed = pattern.slice(startIndex, endIndex);
      yield {
        index,
        length: charCount,
        startOffset: pattern[startIndex].trigramIndex,
        text: patternUsed.map(p => p.value || "#").join(""),
        consumedTrigrams: Array.from(new Set(patternUsed.map(p => p.trigramNumber)))
      }

      startIndex = endIndex;
    } while (startIndex < pattern.length)
  }

  constructor(stringPattern) {
    const pattern = [...Pattern.parse(stringPattern)];

    // Trailing punctuation makes things annoying (since it can end up being an orphaned, zero-length trigram).
    // Let's just strip it. Extra credit later: have it display but be inert.
    while (pattern[pattern.length - 1].value !== "") {
      pattern.pop();
    }

    this.trigrams = [...Pattern.extractTrigrams(pattern)];
    this.words = [...Pattern.extractWords(pattern)];
  }
}

class Solver extends Component {

  constructor(props) {
    super(props);

    this.state = {
      pattern: new Pattern(this.props.pattern),
      trigrams: this.props.trigrams.map(t => new Trigram(t)),
      activeTrigram: null,
      wordPossibilities: null
    };
  }

  toggleActiveTrigram(i) {
    const newActiveTrigram = this.state.activeTrigram === i ? null : i;
    this.setState(oldState => ({ ...oldState, activeTrigram: newActiveTrigram }));
  }

  placeTrigram(trigram, patternTrigramIndex) {
    this.setState(s => {
      trigram.assignedTo = patternTrigramIndex;
      s.pattern.trigrams[patternTrigramIndex].assignedTrigram = trigram.letters;
      return s;
    });
  }

  placeActiveTrigram(i) {
    if (this.state.activeTrigram === null) {
      return;
    }

    const t = this.state.trigrams[this.state.activeTrigram];
    this.placeTrigram(t, i);
    this.setState(s => ({ ...s, activeTrigram: null }));
  }

  removePlacedTrigram(i) {
    this.setState(s => {
      const trigramToUnassign = s.trigrams.findIndex(t => t.assignedTo === i);
      if (trigramToUnassign === -1) {
        return s;
      }
      s.trigrams[trigramToUnassign].assignedTo = null;
      s.pattern.trigrams[i].assignedTrigram = null;

      return s;
    });
  }

  renderTrigram(t, i) {
    const key = `trigram-${i}-${t.letters}`;

    const className = "trigram"
      + (t.assignedTo !== null ? " assigned" : " unassigned")
      + (this.state.activeTrigram === i ? " active" : "");

    return (<span className={className} key={key} onClick={_ => t.assignedTo === null && this.toggleActiveTrigram(i)}>
      {t.letters}
    </span>);
  }

  renderTrigrams() {
    return (<div>
      {this.state.trigrams.map((t, i) => this.renderTrigram(t, i))}
    </div>);
  }

  renderPattern(t, i) {
    const key = `pattern-${i}-${t.pattern}-${t.assignedTrigram}`;
    let className, onClick;
    if (t.assignedTrigram) {
      className = "pattern assigned";
      onClick = _ => this.removePlacedTrigram(i);
    } else {
      className = "pattern";
      onClick = _ => this.placeActiveTrigram(i);
    }

    return (<span key={key} className={className} onClick={onClick}>
      {t.getText()}
    </span>);
  }

  static getTrigramCount(word) {
    let numTrigrams = 0;
    let length = word.length;
    if (word.startOffset) {
      numTrigrams += 1;
      length -= word.startOffset === 1 ? 2 : 1;
    }
    return numTrigrams + Math.ceil(length / 3);
  }

  static getCombosImpl(count, items) {
    const results = [];
    for (let i = 0; i < items.length; i++) {
      const curItem = items[i];
      if (curItem.assigned) {
        continue;
      }

      const filteredItems = items.filter((_, _i) => i !== _i);
      if (count === 1) {
        results.push([curItem]);
      } else {
        for (const rest of Solver.getCombosImpl(count - 1, filteredItems)) {
          results.push([curItem, ...rest]);
        }
      }
    }
    return results;
  }

  static getCombos(count, items, maybeFirst, maybeLast) {
    if (maybeFirst) {
      count -= 1;
    }

    if (maybeLast) {
      count -= 1;
    }

    let combos = Solver.getCombosImpl(count, items);

    if (maybeFirst) {
      combos = combos.map(c => [maybeFirst, ...c]);
    }

    if (maybeLast) {
      combos = combos.map(c => [...c, maybeLast]);
    }

    return combos;
  }

  generateSuggestions(word) {
    this.setState(s => ({ ...s, error: null }));

    const numTrigrams = Solver.getTrigramCount(word);
    const patternTrigramStatus = word.consumedTrigrams.map(
      (patternIndex, comboIndex) =>
        ({ patternIndex,
           comboIndex,
           assignedTrigram: this.state.trigrams.find(t => t.assignedTo === patternIndex) || null }));

    // Only the first and last may be filled in, because it makes my life easier
    if (patternTrigramStatus.slice(1, -1).find(s => s.assignedTrigram)) {
      return "Cannot give suggestions when middle of word is filled in";
    }

    const unassignedIndexedTrigrams = this.state.trigrams.map(
      (t, i) => ({ letters: t.letters, assigned: t.assignedTo !== null, index: i })
    ).filter(
      t => !t.assigned
    );

    const first = patternTrigramStatus[0].assignedTrigram;
    const last = patternTrigramStatus[patternTrigramStatus.length - 1].assignedTrigram;

    const allTrigrams = Solver.getCombos(
      numTrigrams,
      unassignedIndexedTrigrams,
      first,
      last
    );

    const allWords = allTrigrams.map(
      trigramList => ({
        word: trigramList.map(t => t.letters).join("").substr(word.startOffset, word.length),
        trigramsUsed: trigramList.map(t => t.index)
      })
    );

    const seenWords = new Set();
    return allWords
      .filter(w => seenWords.has(w.word) ? false : seenWords.add(w.word))
      .sort((w1, w2) => w1.word < w2.word ? -1 : 1);
  }

  giveSuggestionsFor(word) {
    if (word.length < 2) {
      return;
    }

    const dictionary = wordsByLength[word.length];
    let suggestions = this.generateSuggestions(word);

    let error;
    if (typeof suggestions === 'string') {
      error = suggestions;
      suggestions = [];
    } else {
      suggestions = suggestions.filter(c => dictionary.has(c.word));
      error = suggestions.length ? null : "No suggestions found";
    }

    this.setState(s => ({ ...s, suggestions, error, wordBeingSuggested: word }));
  }

  useSuggestion(suggestion) {
    const patternTrigramIndexes = this.state.wordBeingSuggested.consumedTrigrams;
    const trigramIndexes = suggestion.trigramsUsed;

    for (let i = 0; i < trigramIndexes.length; i++) {
      if (trigramIndexes[i] === undefined) {
        continue; // The trigram has already been placed
      }
      this.placeTrigram(this.state.trigrams[trigramIndexes[i]], patternTrigramIndexes[i]);
    }
  }

  renderSuggestion(s) {
    return <div key={s.word} className="suggestion" onClick={(_ => this.useSuggestion(s))}>{s.word}</div>;
  }

  renderWord(w, i) {
    const key = `${i}-${w.text}-${w.index}`;
    const click = e => this.giveSuggestionsFor(w);
    return <span key={key} className="word" onClick={click}>{w.text}</span>;
  }

  render() {
    return (
      <div>
        {this.renderTrigrams()}
        <br />
        {this.state.pattern.trigrams.map((t, i) => this.renderPattern(t, i))}
        <br />
        <br />
        {this.state.pattern.words.map((w, i) => this.renderWord(w, i))}
        <br />
        <br />
        {this.state.suggestions && this.state.suggestions.map(c => this.renderSuggestion(c))}
        {this.state.error && <div>{this.state.error}</div>}
      </div>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);

    // Happy solving!
    const p = "5 7!";
    const t = "HAP ING OLV PYS";
    this.state = this.getState(p, t);
  }

  update(e, key) {
    e.persist();
    this.setState(s => ({ ...s, [key]: e.target.value }));
  }

  updateValues() {
    this.setState(s => ({ ...s, pattern: s.currentPattern, trigrams: s.currentTrigrams.split(" ") }));
  }

  getState(p, t) {
    return {
      pattern: p,
      currentPattern: p,
      trigrams: t.split(" "),
      currentTrigrams: t
    };
  }

  load(p, t) {
    this.setState(_ => this.getState(p, t));
  }

  loadFancyExample() {
    // From PB4: Tell them to be patient and ask death for speed; for they are all there but one - I, Chingachgook
    const p = "4 4 2 2 7 3 3 5 3 5; 3 4 3 3 5 3 3 - 1, 12*";
    const t = "ALL ARE ATH CHG CHI DAS EDF EMT FOR HEY IEN KDE LTH NEI NGA OBE OOK ORT PAT REB SPE TAN TEL THE UTO"
    this.load(p, t);
  }

  loadPunctuationExample() {
    // "Wait!", he said. "It's dangerous to go alone. Take this!"
    const p = '"4!", 2 4. "2\'1 9 2 2 5. 4 4!"';
    const t = "WAI THE SAI DIT SDA NGE ROU STO GOA LON ETA KET HIS";
    this.load(p, t);
  }

  render() {
    return (<div>
      <Solver pattern={this.state.pattern} trigrams={this.state.trigrams} key={this.state.pattern+this.state.currentTrigrams}/>
      <br />
      <br />
      <input size="200" type="text" value={this.state.currentPattern} onChange={e => this.update(e, 'currentPattern')} />
      <br />
      <input size="200" type="text" value={this.state.currentTrigrams} onChange={e => this.update(e, 'currentTrigrams')} />
      <br />
      <button onClick={_ => this.updateValues()}>Update</button>
      <br />
      <button onClick={_ => this.loadFancyExample()}>Load Fancy Example</button>
      <br />
      <button onClick={_ => this.loadPunctuationExample()}>Load Punctuation Example</button>
    </div>);
  }
}

export default App;
