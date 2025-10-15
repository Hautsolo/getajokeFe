import firebase from 'firebase/app';
import 'firebase/auth';

const signIn = () => {
  const provider = new firebase.auth.GoogleAuthProvider();

  return firebase.auth().signInWithPopup(provider)
    .then((result) => {
      const { user } = result;
      console.log('Signed in user:', user);
    })
    .catch((error) => {
      console.error('Error signing in:', error);
    });
};

const signOut = () => firebase.auth().signOut()
  .then(() => {
    console.log('User signed out');
  })
  .catch((error) => {
    console.error('Error signing out:', error);
  });

export { signIn, signOut };
