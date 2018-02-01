import React, { Component } from 'react';
import { View } from 'react-native';
// to disable back button (which go back to this blank screen)
import { NavigationActions } from 'react-navigation';
import firebase from 'react-native-firebase';


class CheckIfUserLoggedIn extends Component {

  constructor(props) {
    super(props);
    this.offAuthStateChanged = null; // will contain callback to off the listener on firebase auth
  }

  componentWillMount() {
    // onAuthStateChanged returns a call back which when he's called he offs the listener
    this.offAuthStateChanged = firebase.auth().onAuthStateChanged( (user) => {
      if (user) {
        this.resetNavigation('Home');
        this.offAuthStateChanged();
      } else {
        this.resetNavigation('Login');
        this.offAuthStateChanged();
      }
    });
  }

  resetNavigation(targetRoute) {
    const resetAction = NavigationActions.reset({
      index: 0,
      key: null, // without this it will bug :/
      actions: [
        NavigationActions.navigate({ routeName: targetRoute })
      ]
    });
    this.props.navigation.dispatch(resetAction);
  }

  render() {
    return (
      <View />
    );
  }

}

export default CheckIfUserLoggedIn;
