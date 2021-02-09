import firebase from 'firebase';
require ('@firebase/firestore')

var firebaseConfig = {
  apiKey: "AIzaSyAfnLwupqg6HY1e5POyjc0BYS-AQ9icXxs",
  authDomain: "wireless-library-4f270.firebaseapp.com",
  databaseURL: "https://wireless-library-4f270.firebaseio.com",
  projectId: "wireless-library-4f270",
  storageBucket: "wireless-library-4f270.appspot.com",
  messagingSenderId: "598883737958",
  appId: "1:598883737958:web:728e60467ae915d565e8a7",
  measurementId: "G-LF698XZFQ0"
};

  firebase.initializeApp(firebaseConfig);
  

  export default firebase.firestore();