// Class that will manage the facebook login and sign in of the App

import React, { Component } from 'react';
import { AccessToken, LoginManager } from 'react-native-fbsdk';
import { SocialIcon } from 'react-native-elements';
import I18n from 'react-native-i18n';

const readPermissionsOnFbProfile = [
  'public_profile',
  'user_friends',
  'email',
  'user_birthday'
];
const strErrorLogin = 'Error during the connection to your Facebook profile. :(';
let isFbProfileLoggedIn = false;
let isLogInIssues = false; // true when we couldn't log the user (internet issues)
let accessTokenOfFbProfile = '';
let fbUserProfileID = '';

/*eslint-disable */

class FacebookLogin extends Component {

  static logOutFbAccount() {
    console.log('logout fb account');
    LoginManager.logOut();
  }

  constructor(props) {
   super(props);
  }

  state = {
    userIsAlreadyConnected: false
  }

  componentWillMount() {
    AccessToken.getCurrentAccessToken()
      .then(
        (data) => {
          if (data) {
            this.setState({ userIsAlreadyConnected: true });
            console.log("User is already connected to Facebook.");
          } else {
            console.log("User isn't connected to Facebook.");
          }
        }
      );
  }

  setFalseIsFbProfileLoggedIn = ()  => {
    // because getters dont work i use globlal var, which i need to reset to initial value also
    isFbProfileLoggedIn = false;
  }

  getLogInIssues = ()  => {
    return isLogInIssues;
  }

  getFbProfileLoggedIn = ()  => {
    return isFbProfileLoggedIn;
  }

  getFbUserProfileID = ()  => {
    return fbUserProfileID;
  }

  getAccessToken = ()  => {
    return accessTokenOfFbProfile;
  }

  logInOrLogOutFromFacebook = ()  => {
    if (this.state.userIsAlreadyConnected) {
      FacebookLogin.logOutFbAccount();
      this.setState({ userIsAlreadyConnected: false }); // to refresh the page and actualize the button text
    } else {
      LoginManager.logInWithReadPermissions(readPermissionsOnFbProfile)
        .then(
          (result, error) => {
            if (error) {
              isLogInIssues = true;
              alert(strErrorLogin);
              console.log('Login fail with error: ' + error);
              this.props.onLoginFailed();
            } else if (result.isCancelled) {
              isLogInIssues = true;
              alert(strErrorLogin);
              console.log('Login cancelled');
              this.props.onLoginFailed();
            } else {
              this.setState({ userIsAlreadyConnected: true });
              AccessToken.getCurrentAccessToken()
                .then(
                  (data) => {
                    console.log(data.accessToken, data.userID);
                    isFbProfileLoggedIn = true;
                    accessTokenOfFbProfile = data.accessToken;
                    fbUserProfileID = data.userID;
                    this.props.onLoginPassed();
                  }
                );
              console.log('Login success with permissions:'
                + result.grantedPermissions.toString());
            }
          }
        );
    }
  }

  render() {
    return (
      <SocialIcon
        title = {
          this.state.userIsAlreadyConnected ?
          I18n.t('login.button_fb_logout') : I18n.t('login.button_fb_login') }
        button
        type = 'facebook'
        style = {{ width: 300, height: 40 }}
        onPress = {this.logInOrLogOutFromFacebook}
      />
      );
  }

}

export default FacebookLogin;
