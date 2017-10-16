import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Solver from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Solver />, document.getElementById('root'));
registerServiceWorker();
