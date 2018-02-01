// A class to manage firebase things
import firebase from 'react-native-firebase';
import RNFetchBlob from 'react-native-fetch-blob'; // to upload uri images to firebase
import { firebaseRefUsers } from '../config/settings';
// Prepare Blob support
const { Blob } = RNFetchBlob.polyfill; // destructuring : RNFetchBlob.polyfill.Blob

window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
window.Blob = Blob;

// const firebaseRefUsers = firebase.database().ref('users');

class FirebaseHandling {

  static logOut() {
    firebase.auth().signOut();
  }

  static listenForAuth() {

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log(`user: ${user}`);
      } else {
        console.log('no user');
      }
    });
  }

  static isFbProfileAlreadySignedIn(p_uid) {
    console.log(p_uid);
    return new Promise( (resolve, reject) => {
      try {
        firebaseRefUsers.child(p_uid)
          .once('value', (snapshot) => {
            if (snapshot.val()) {
              console.log(snapshot.val());
              console.log('firebase.js => existe');
              resolve(true);
            } else {
              console.log('firebase.js => existe pas');
              resolve(false);
            }
          });
      } catch (e) {
        reject(e);
      }
    });
  }

  static createUserWithEmailAndPassword(p_email, p_password) {
    firebase.auth().createUserWithEmail(p_email, p_password)
      .then( (user) => {
        console.log('User created', user);
      })
      .catch( (error) => {
        console.log('User sign in error', error);
      });
  }

  static createUserWithFbDataInDatabase(p_userFbData, p_uid) {
    console.log('create user in database');
    // create user in Firebase with all usefull informations to have
    return new Promise( (resolve) => {
      firebaseRefUsers.child(p_uid).set({
        // we use a set because set won't let firebase create unique-id and
        // when we will need to update user data we won't need to query about user id
        first_name: userFbData.firstName,
        last_name: userFbData.lastName,
        gender: userFbData.gender ? userFbData.gender : '',
        email: userFbData.email ? userFbData.email : '',
        fb_profile_access_token: userFbData.fbProfileAccessToken,
        fb_profile_id: userFbData.fbProfileID,
        fb_profile_picture: userFbData.fbProfilePicture ? userFbData.fbProfilePicture : '',
        profile_picture: '',
        friends_from_fb: userFbData.friendsFromFb ? userFbData.friendsFromFb : '',
        is_connected: false,
        sign_up_date: firebase.database.ServerValue.TIMESTAMP, // millisec since 01/01/1970
        last_update_profile: firebase.database.ServerValue.TIMESTAMP,
        search_history: '',
        friends_group: {
          group_id: '',
          group_name: '',
          members_of_group_id: ''
        },
        data_fully_getted: false // will be switched to true when all getting data treatment will be done
      })
        .then( () => resolve() ) // return firebase database id of this element user
        .catch( (err) => { console.log(err); } );
    });
  }

  static uploadFbProfilePicture(userFbData, p_uid) {

    console.log('here is upload picture');

    return new Promise( (resolve, reject) => {
      RNFetchBlob.config({ fileCache: true, appendExt: 'jpeg' })
        .fetch('GET', userFbData.fbProfilePicture)
        .then((resp) => {
          console.log('PICTURE GETTED');
          const testFile = resp.path();
          const rnfbURI = RNFetchBlob.wrap(testFile);
          // create Blob from file path
          Blob.build(rnfbURI, { type: 'image/jpeg;' })
            .then( (blob) => {
              console.log('blob created');
              // upload image using Firebase SDK
              firebase.storage()
                .ref('users-profile-picture')
                // .child(p_uid + '-profile-picture.jpeg')
                .child(`${p_uid}-profile-picture.jpeg`)
                .put(blob, { contentType: 'image/jpeg' })
                .then( (snapshot) => {
                  console.log(snapshot);
                  console.log('upload fait');
                  blob.close();
                  resolve(snapshot.downloadURL);
                })
                .catch( (err) => {
                  console.log(err);
                  reject();
                } );
            })
            .catch( (err) => {
              console.log(err);
              reject();
            } );
        });
    });
  }

  static setProfilePictureDownloadURL(p_DownloadURL, p_uid) {
    return new Promise( (resolve, reject) => {
      firebaseRefUsers.child(p_uid)
        .update({ profile_picture: p_DownloadURL })
        .then( () => resolve() )
        .catch( () => reject() );
    });
  }

  static validateUserCreation(p_uid) {
    // p_firebaseTimestampedID -> id automatically created by firebase when pushing datas
    // this function will be use to validate the creation of a user by setting in
    // the database (for the current user), the element "data_fully_getted" to true.
    // This processus is usefull to be sure that a user is completly created (data fully getted)
    // because an user can be created in the database then he can have an internet issues
    // and in this case he will be created but the fb datas won't be getted.
    return new Promise( (resolve, reject) => {
      firebaseRefUsers.child(p_uid)
        .update({ data_fully_getted: true })
        .then( () => resolve() )
        .catch( () => reject() );
    });
  }

  static setUserOnline(p_uid) {
    // set the user online in the database
    return new Promise( (resolve, reject) => {
      firebaseRefUsers.child(p_uid)
        .update({ is_connected: true })
        .then( () => resolve() )
        .catch( () => reject() );
    });
  }

  static setUserOffline(p_uid) {
    // set the user offline in the database
    return new Promise( (resolve, reject) => {
      firebaseRefUsers.child(p_uid)
        .update({ is_connected: false })
        .then( () => resolve() )
        .catch( () => reject() );
    });
  }

  static deleteAllUsersInFirebase() {
    // delete all the users in firebase database (was usefull for dev purpose)
    firebaseRefUsers.remove()
      .then( () => console.log('users removed') )
      .catch( error => console.log(error));
  }

  constructor(accessToken) {
    this.fbProfileAccessToken = accessToken;
  }

  getAccessToken = () => {
    return this.fbProfileAccessToken;
  }

  signInFirebaseWithFacebook = () => {
    // I will do a promise here because I need to assume that user is logged
    // in firebase before writing data in database (it won't work if not)

    return new Promise( (resolve, reject) => {
      const credential = firebase.auth.FacebookAuthProvider.credential(this.fbProfileAccessToken);

      firebase.auth().signInAndRetrieveDataWithCredential(credential)
        .then( (user) => {
          console.log(user); // print user's connected informations
          resolve(user);
        })
        .catch( (error) => {
          console.log(error);
          reject(error);
        });
    });
  }

}

export default FirebaseHandling;
