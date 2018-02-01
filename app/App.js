import './config/i18n/i18n'; // import languages at first

// import React, { Component } from 'react';

// import { CheckIfUserLoggedInStack } from './config/routes';
import { LoginStack } from './config/routes';
import { HomeStack } from './config/routes';


import React, { Component } from 'react';
// import { View } from 'react-native';
// to disable back button (which go back to this blank screen)
import { NavigationActions } from 'react-navigation';
import firebase from 'react-native-firebase';


class App extends Component {

  constructor(props) {
    super(props);
    this.offAuthStateChanged = null; // will contain callback to off the listener on firebase auth
  }

  state = {
    isLoggedIn: null
  }

  componentWillMount() {
    // onAuthStateChanged returns a call back which when he's called he offs the listener
    this.offAuthStateChanged = firebase.auth().onAuthStateChanged( (user) => {
      if (user) {
        console.log("User already connected on Firebase.");
        this.setState({ isLoggedIn: true });
        this.offAuthStateChanged();
      } else {
        console.log("User isn't already connected on Firebase.");
        this.setState({ isLoggedIn: false });
        this.offAuthStateChanged();
      }
    });
  }

  render() {
    if (this.state.isLoggedIn == null) {
      return null; // it would be great to show a generic animated screen
    } else {
      if (!this.state.isLoggedIn) {
        return <LoginStack />;
      } else if (this.state.isLoggedIn) {
        return <HomeStack />;
      }
    }

    return null; // in case of isLoggedIn wasnt null at the begging (it should never be the case)
  }

}

export default App;
