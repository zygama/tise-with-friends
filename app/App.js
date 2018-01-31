import React, { Component } from 'react';
import { View, Text } from 'react-native';
import firebase from 'react-native-firebase';

class App extends Component {

  constructor() {
    super();
    this.state = {
      isAuthenticated: false,
    };
  }

  componentDidMount() {
    firebase.auth().signInAnonymously()
      .then(() => {
        this.setState({
          isAuthenticated: true,
        });
      });
  }

  render() {
    // If the user has not authenticated
    if (!this.state.isAuthenticated) {
      return null;
    }

    return (
      <View>
        <Text>Welcome to my awesome app!</Text>
      </View>
    );
  }

}

export default App;
