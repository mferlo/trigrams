import React, { Component } from 'react';

// TODO:
//  * way to input the puzzle data on the page itself
//  * word suggest (literally all combos, then dictionary)
//    * need to make pattern aware of the concept of a word
//    * easy way out: have 2nd display of the pattern that's word-aware,
//      use that for UI stuff
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

  static asArray(inputString) {
    const pieces = inputString.split(" ");
    const result = [];

    for (const piece of pieces) {
      let p = piece;
      while (p) {
        const maybeNumber = Number.parseInt(p, 10);
        if (Number.isNaN(maybeNumber)) {
          result.push(p.charAt(0));
          p = p.substr(1);
        } else {
          result.push(...Array(maybeNumber).fill(""));
          p = p.replace(/^\d+/, "");
        }
      }
      result.push(" ");
    }
    result.pop();
    return result;
  }

  constructor(stringPattern) {
    let pattern = Pattern.asArray(stringPattern);
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

class Solver extends Component {

  constructor(props) {
    super(props);

    this.state = {
      pattern: new Pattern("3'2 2 3 10!"),
      trigrams: [ "LLG", "OFA", "YOU", "R" ].map(t => new Trigram(t)),
      activeTrigram: null
    };
  }

  toggleActiveTrigram(i) {
    const newActiveTrigram = this.state.activeTrigram === i ? null : i;
    this.setState(oldState => { return { ...oldState, activeTrigram: newActiveTrigram }; });
  }

  placeActiveTrigram(i) {
    if (this.state.activeTrigram === null) {
      return;
    }

    this.setState(s => {
      const t = s.trigrams[s.activeTrigram];
      t.assignedTo = i;
      s.pattern.patternTrigrams[i].assignedTrigram = t.letters;
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
      s.pattern.patternTrigrams[i].assignedTrigram = null;

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

  render() {
    return (
      <div>
        {this.renderTrigrams()}
        <br />
        {this.state.pattern.patternTrigrams.map((t, i) => this.renderPattern(t, i))}
      </div>
    );
  }
}

export default Solver;
