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
    return {
      pattern,
      trigrams,
      mappedTrigrams: trigrams.map(_ => null),
      mappedLetters: {}
    };
  }

  static getTrigram(state, t, i) {
    return {
      value: t,
      index: i,
      assigned: state.mappedTrigrams[i] !== null
    };
  }

  static getTrigrams(state) {
    console.log(state.trigrams);
    return state.trigrams.map((t, i) => T.getTrigram(state, t, i));
  }

  static getText(state) {
    let text = "";
    let i = 0;
    for (let p of state.pattern) {
      if (p) {
        text += p;
      } else {
        text += state.mappedLetters[i] || "_";
        i++;
      }
    }
    return text;
  }
}

class Trigram extends Component {
  render() {
    console.log(this.props);
    const className = this.props.assigned ? "assigned" : "";
    const key = `${this.props.index}-${this.props.value}-${this.props.assigned}`;
    return (
      <span key={key} className={"trigram " + className}>
        {this.props.value}
      </span>);
  }
}

class Trigrams extends Component {
  render() {
    const trigrams = this.props.trigrams.map(t => <Trigram {...t} />);
    return (<div className="trigrams">{trigrams}</div>);
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
    const trigrams = T.getTrigrams(this.state);

    console.log(trigrams);

    return (
      <div>
        <Trigrams trigrams={trigrams} />
        <br />
        {text}
      </div>
    );
  }
}

export default App;
