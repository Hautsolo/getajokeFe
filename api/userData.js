import { clientCredentials } from '../utils/client';

const endpoint = clientCredentials.databaseURL;

const getSingleUser = (firebaseKey) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/users/${firebaseKey}.json`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        resolve({ ...data, firebaseKey });
      } else {
        resolve(null);
      }
    })
    .catch(reject);
});

const getUserByUid = (uid) => new Promise((resolve, reject) => {
  if (!uid) { resolve(null); return; }
  const normalized = String(uid);
  fetch(`${endpoint}/users.json?orderBy=%22uid%22&equalTo=%22${normalized}%22`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        const allResp = await fetch(`${endpoint}/users.json`);
        const allData = await allResp.json();
        if (allData && typeof allData === 'object') {
          const match = Object.entries(allData).find(([, u]) => u.uid === normalized);
          if (match) {
            const [firebaseKey, userData] = match;
            resolve({ ...userData, firebaseKey });
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
        return null;
      }
      return response.json();
    })
    .then((data) => {
      if (!data) return;
      if (data && typeof data === 'object') {
        const userEntries = Object.entries(data);
        if (userEntries.length > 0) {
          const [firebaseKey, userData] = userEntries[0];
          resolve({ ...userData, firebaseKey });
        } else {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    })
    .catch(async () => {
      try {
        const allResp = await fetch(`${endpoint}/users.json`);
        const allData = await allResp.json();
        if (allData && typeof allData === 'object') {
          const match = Object.entries(allData).find(([, u]) => u.uid === normalized);
          if (match) {
            const [firebaseKey, userData] = match;
            resolve({ ...userData, firebaseKey });
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      } catch (e) {
        reject(e);
      }
    });
});

const createUser = (payload) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/users.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      return response.json();
    })
    .then((data) => resolve(data))
    .catch(reject);
});

const updateUserProfile = (payload) => new Promise((resolve, reject) => {
  const { firebaseKey, ...updateData } = payload;
  if (!firebaseKey) { reject(new Error('FirebaseKey is required for user update')); return; }
  fetch(`${endpoint}/users/${firebaseKey}.json`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      return response.json();
    })
    .then((data) => resolve({ ...data, firebaseKey }))
    .catch(reject);
});

const getUsers = () => new Promise((resolve, reject) => {
  fetch(`${endpoint}/users.json`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data && typeof data === 'object') {
        const usersWithKeys = Object.keys(data).map(key => ({
          ...data[key],
          firebaseKey: key
        }));
        resolve(usersWithKeys);
      } else {
        resolve([]);
      }
    })
    .catch(reject);
});

export {
  getSingleUser,
  getUserByUid,
  createUser,
  updateUserProfile,
  getUsers
};
