import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { firebase } from '../client';
import { getUserByUid, createUser } from '../../api/userData';

const AuthContext = createContext();
AuthContext.displayName = 'AuthContext';

function AuthProvider(props) {
  const [user, setUser] = useState(null);
  const [oAuthUser, setOAuthUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const setFinalUser = (fbUser, dbUser) => {
    const finalUserData = fbUser
      ? {
          fbUser,
          uid: fbUser.uid,
          displayName: fbUser.displayName,
          email: fbUser.email,
          photoURL: fbUser.photoURL,
          ...(dbUser || {}),
        }
      : false;
    setUser(finalUserData);
  };

  useEffect(() => {
    const unsub = firebase.auth().onAuthStateChanged((fbUser) => {
      if (fbUser) {
        setOAuthUser(fbUser);
        getUserByUid(fbUser.uid)
          .then((userInfo) => {
            if (userInfo) {
              setFinalUser(fbUser, userInfo);
            } else {
              const newUser = {
                uid: fbUser.uid,
                displayName: fbUser.displayName,
                email: fbUser.email,
                photoURL: fbUser.photoURL,
              };
              createUser(newUser)
                .then((response) => {
                  const firebaseKey = response.name;
                  setFinalUser(fbUser, { ...newUser, firebaseKey });
                })
                .catch(() => {
                  setFinalUser(fbUser, newUser);
                })
                .finally(() => setInitializing(false));
              return;
            }
          })
          .catch(() => setFinalUser(fbUser, null))
          .finally(() => setInitializing(false));
      } else {
        setOAuthUser(false);
        setFinalUser(null, null);
        setInitializing(false);
      }
    });
    return () => unsub();
  }, []);

  const updateUser = (uidParam) => {
    const uid = uidParam || oAuthUser?.uid;
    if (!uid) return Promise.resolve();
    return getUserByUid(uid).then((userInfo) => {
      if (oAuthUser) setFinalUser(oAuthUser, userInfo || {});
    });
  };

  const value = useMemo(
    () => ({
      user,
      userLoading: initializing,
      oAuthUser,
      updateUser,
    }),
    [user, initializing, oAuthUser],
  );

  return <AuthContext.Provider value={value} {...props} />;
}
const AuthConsumer = AuthContext.Consumer;

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth, AuthConsumer };
