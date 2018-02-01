import React, { Component } from 'react';
import { View, Text } from 'react-native';
import firebase from 'react-native-firebase';
import { NavigationActions } from 'react-navigation';

import FacebookLogin from '../components/login/FacebookLogin';
import FirebaseHandling from '../api/FirebaseHandling';


class Login extends Component {

  constructor() {
    super();
    this.test = "test"
    this.fbLogin = new FacebookLogin(); // contains an object from the class FacebookLogin
    this.fbAccessToken = null; // will be getted when the user will be connected via facebook
    this.firebaseHandler = null; // will contains new FirebaseHandler() but we need fb access token
    this.state = {
      isAuthenticated: false,
      fbDataGetted: false, // spinner when null, home page when true
      isError: false // true when there was an error during the login or signin process
    };
  }

  onFbLoginPassed = () => {
    console.log("fb login passed :)" + this.test);
    this.fbAccessToken = this.fbLogin.getAccessToken(); // get fb access token
    this.firebaseHandler = new FirebaseHandling(this.fbAccessToken); // create object with fb access token

    this.firebaseHandler.signInFirebaseWithFacebook()
      .then( () => {
        this.resetNavigation('Home');
      });
  }

  onFbLoginFailed = () => {
    console.log("fb login failed :("  + this.test);
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
      <View>
        <FacebookLogin
          onLoginPassed={this.onFbLoginPassed}
          onLoginFailed={this.onFbLoginFailed}
        />
      </View>
    );
  }

}

export default Login;
