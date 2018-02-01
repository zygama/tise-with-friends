import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { StackNavigator, TabNavigator } from 'react-navigation';

import Login from '../screens/Login';
import CheckIfUserLoggedIn from '../screens/CheckIfUserLoggedIn';
import Home from '../screens/Home';


export const HomeStack = StackNavigator({
  Home: {
    screen: Home
  }
});

export const LoginStack = StackNavigator({
  Login: {
    screen: Login
  },
  Home: {
    screen: HomeStack
  }
}, {
  headerMode: 'none'
});
