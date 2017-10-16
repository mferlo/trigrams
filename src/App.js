import React, { Component } from 'react';

// TODO:
//  Give it a UI
//  * make click handler for the trigrams, which makes them "activated"
//  * make click handler for the pattern, which will consume the "activated"
//  * make click handler for trigrams that are in the pattern
//  * do something with graphics to indicate state & valid drop zones
//  Then, iterate on it
//  * way to input the puzzle data on the page itself
//  * word suggest (literally all combos, then dictionary)
//    * need to make pattern aware of the concept of a word
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
    let replacementLetters = this.assignedTrigram || "???";
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
  constructor(pattern) { // Is expected to be an array of strings
    let patternTrigrams = [];

    // TODO: Make each letter of PatternTrigram aware of which word it belongs to
    let startIndex = 0;

    do {
      let endIndex = startIndex;
      let placeholderCount = 0;

      while (placeholderCount < 3 && endIndex < pattern.length) {
        if (!pattern[endIndex]) { // It's a placeholder
          placeholderCount += 1;
        }
        endIndex += 1;
      }

      patternTrigrams.push(new PatternTrigram(pattern.slice(startIndex, endIndex)));

      startIndex = endIndex;
    } while (startIndex < pattern.length)

    this.patternTrigrams = patternTrigrams;
  }
}


class T {
  static create(pattern, trigrams) {
    return {
      pattern: new Pattern(pattern),
      trigrams: trigrams.map(t => new Trigram(t))
    };
  }

  static assign(state, trigramText, i) {
    const trigramToAssign = state.trigrams.findIndex(t => t.letters === trigramText && t.assignedTo === null);
    if (trigramToAssign === -1) {
      return state;
    }

    state.trigrams[trigramToAssign].assignedTo = i;
    state.pattern.patternTrigrams[i].assignedTrigram = trigramText;

    return state;
  }

  static unassign(state, i) {
    const trigramToUnassign = state.trigrams.findIndex(t => t.assignedTo === i);
    if (trigramToUnassign === -1) {
      return state;
    }

    state.trigrams[trigramToUnassign].assignedTo = null;
    state.pattern.patternTrigrams[i].assignedTrigram = null;

    return state;
  }
}

class TrigramDisplay extends Component {
  render() {
    const className = this.props.assigned ? " assigned" : "";
    return (
      <span className={"trigram" + className}>
        {this.props.letters}
      </span>);
  }
}

class App extends Component {

  constructor(props) {
    super(props);
    this.state = T.create(
      ["", "", "", "'", "", " ", "", ""],
      [ "DGO", "YOU" ]
    );

    console.log(this.state);
  }

  renderTrigram(t) {
    const key = `${t.letters}-${t.assignedTo}`;
    return <TrigramDisplay key={key} letters={t.letters} assigned={t.assignedTo !== null} />;
  }

  renderTrigrams() {
    return (<div>
      {this.state.trigrams.map(t => this.renderTrigram(t))}
    </div>);
  }

  renderPattern() {
    return this.state.pattern.patternTrigrams.map(
      (t, i) => <span key={t+i} className={"pattern " + i}>{t.getText()}</span>);
  }

  assign() {
    this.setState(oldState => T.assign(oldState, "YOU", 0));
  }

  unassign() {
    this.setState(oldState => T.unassign(oldState, 0));
  }

  render() {

    return (
      <div>
        {this.renderTrigrams()}
        <br />
        {this.renderPattern()}
        <br />
        <button style={{width:"100px", height:"50px"}} onClick={e => this.assign()} />
        <button style={{width:"100px", height:"50px"}} onClick={e => this.unassign()} />
      </div>
    );
  }
}

export default App;
