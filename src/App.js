import React, { Component } from 'react';

// TODO:
//  * word suggest
//    * all combos
//    * dictionary
//  * drag and drop

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
      const currentWord = pattern[startIndex].wordNumber;
      let charCount = 0;

      let endIndex = startIndex;
      while (endIndex < pattern.length && pattern[endIndex].wordNumber === currentWord) {
        if (pattern[endIndex].value === "") {
          charCount += 1;
        }
        endIndex += 1;
      }
      const foo = {
        currentWord,
        length: charCount,
        startOffset: pattern[startIndex].trigramIndex,
      }
      console.log(foo);
      yield foo;

      startIndex = endIndex;
    } while (startIndex < pattern.length)
  }

  constructor(stringPattern) {
    const pattern = [...Pattern.parse(stringPattern)];
    console.log(pattern);
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
      activeTrigram: null
    };
  }

  toggleActiveTrigram(i) {
    const newActiveTrigram = this.state.activeTrigram === i ? null : i;
    this.setState(oldState => ({ ...oldState, activeTrigram: newActiveTrigram }));
  }

  placeActiveTrigram(i) {
    if (this.state.activeTrigram === null) {
      return;
    }

    this.setState(s => {
      const t = s.trigrams[s.activeTrigram];
      t.assignedTo = i;
      s.pattern.trigrams[i].assignedTrigram = t.letters;
      s.activeTrigram = null;
      return s;
    });
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

  renderWord(w, i) {
    const key = `word-${i}-${w}`;
    return <span key={key} className="word">{w}</span>;
  }

  render() {
    return (
      <div>
        {this.renderTrigrams()}
        <br />
        {this.state.pattern.trigrams.map((t, i) => this.renderPattern(t, i))}
        <br />
        {/*this.state.pattern.words.map((w, i) => this.renderWord(w, i))*/}
      </div>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);

    const initialPattern = "5 7!";
    const initialTrigrams = "HAP ING OLV PYS";

    this.state = {
      pattern: initialPattern,
      currentPattern: initialPattern,
      trigrams: initialTrigrams.split(" "),
      currentTrigrams: initialTrigrams
    };
  }

  update(e, key) {
    e.persist();
    this.setState(s => ({ ...s, [key]: e.target.value }));
  }

  updateValues() {
    this.setState(s => ({ ...s, pattern: s.currentPattern, trigrams: s.currentTrigrams.split(" ") }));
  }

  loadExample() {
    // From PB4
    const p = "6 3 9, 4 2 4 7 8. 1 4 3 4 3 2 5. 7 2";
    const t = "AND AVE BOA ELC GEN GIH IES INS KIN LAD MEN NON OME ONL PEA PTA RCA RDW SIS THE THI TLE YGU YOU TO";
    this.setState(_ => ({
      pattern: p,
      currentPattern: p,
      trigrams: t.split(" "),
      currentTrigrams: t
    }));
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
      <button onClick={_ => this.loadExample()}>Load Fancier Example</button>
    </div>);
  }
}

export default App;
