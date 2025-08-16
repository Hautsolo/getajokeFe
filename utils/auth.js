import firebase from 'firebase/app';
import 'firebase/auth';

const signIn = () => {
  const provider = new firebase.auth.GoogleAuthProvider();

  // Sign in with Google popup
  return firebase.auth().signInWithPopup(provider)
    .then((result) => {
      // Handle successful sign-in
      const { user } = result;
      console.log('Signed in user:', user);
      // You can perform additional actions after successful sign-in if needed
    })
    .catch((error) => {
      // Handle errors
      console.error('Error signing in:', error);
    });
};

const signOut = () => firebase.auth().signOut()
  .then(() => {
    // Handle successful sign-out
    console.log('User signed out');
    // You can perform additional actions after successful sign-out if needed
  })
  .catch((error) => {
    // Handle errors
    console.error('Error signing out:', error);
  });

export { signIn, signOut };
