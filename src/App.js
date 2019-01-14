import React, { Component } from 'react';
import logo from './logo.svg';
import Paperbase from './paperbase/Paperbase';
import './App.css';
import { IntlProvider } from 'react-intl'

class App extends Component {
  render() {
    return (
      <IntlProvider language="en">
        <Paperbase />
      </IntlProvider>
    );
  }
}

export default App;
