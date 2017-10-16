import React, { Component } from 'react';

// TODO:
//  * write "assigned" logic, by faking it with a hard-coded button
//  * write "unassign" logic, ditto
//  Then, give it a UI
//  * make click handler for the trigrams, which makes them "activated"
//  * make click handler for the pattern, which will consume the "activated"
//  * make click handler for trigrams that are in the pattern
//  * do something with graphics to indicate state & valid drop zones
//  Then, iterate on it
//  * less shitty input method
//  * word suggest (literally all combos, and dictionary)
//  * drag and drop

class T {
  // "pattern" is array of strings. If string is "",
  // it is a placeholder, otherwise a literal.
  // "trigrams" is array of strings.
  static create(pattern, trigrams) {
    let p = [];
    let trigramIndex = 0; // [0, 0, 0, 1, 1, 1, 2, ...]
    let trigramCount = 0;
    for (let i = 0; i <= pattern.length; i++) {
      if (pattern[i]) {
        p[i] = { isLiteral: true, value: pattern[i] };
      } else {
        p[i] = { isLiteral: false,
                 trigramIndex,
                 internalTrigramIndex: trigramCount };
        trigramCount += 1;
        if (trigramCount === 3) {
          trigramIndex += 1;
          trigramCount = 0;
        }
      }
    }

    return {
      pattern: p,
      trigrams: trigrams.map(
        (t, i) => { return { value: t, index: i, mappedTo: null }; }),
    };
  }

  static getMappings(state) {
    const result = [];
    state.trigrams.forEach(
      t => { if (t.mappedTo !== null) { result[t.mappedTo] = t.value; } });
    return result;
  }

  static maybeGetMappedChar(state, trigramIndex, internalTrigramIndex) {
    
  }

  static assign(state, trigram, patternIndex) {
    if (trigram.assigned) {
      return state;
    }

    
  }

  static getText(state) {
    let text = "";
    let i = 0;
    let ii = 0;
    for (let p of state.pattern) {
      if (p.isLiteral) {
        text += p.value;
      } else {
        text += T.maybeGetMappedChar(state, i, ii);
        ii += 1;
        if (ii === 3) {
          ii = 0;
          i += 1;
        }
      }
    }
    return text;
  }
}

class Trigram extends Component {
  render() {
    const className = this.props.assigned ? " assigned" : "";
    return (
      <span className={"trigram " + className}>
        {this.props.value}
      </span>);
  }
}

class Trigrams extends Component {

  render() {
    const makeKey = t => `${t.index}-${t.value}-${t.assigned}`;
    return (
      <div className="trigrams">
        {this.props.trigrams.map(t => <Trigram key={makeKey(t)} {...t} />)}
      </div>);
  }
}

class App extends Component {

  constructor(props) {
    super(props);
    this.state = T.create(
      ["", "", "", "'", "", " ", "", ""],
      [ "DGO", "YOU" ]
    );
  }

  render() {
    const text = T.getText(this.state);

    return (
      <div>
        <Trigrams trigrams={this.state.trigrams} />
        <br />
        {text}
      </div>
    );
  }
}

export default App;
