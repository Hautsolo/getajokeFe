import { clientCredentials } from '../utils/client';

let endpoint = clientCredentials.databaseURL.replace(/"/g, '');

// Check if the endpoint is using HTTP, and replace it with HTTPS if necessary
if (endpoint.startsWith('http://')) {
  endpoint = endpoint.replace('http://', 'https://');
}

const getSingleUser = (uid) => new Promise((resolve, reject) => {
  fetch(`${endpoint}users/${uid}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => resolve((data)))
    .catch(reject);
});

// CREATE USER
const createUser = (payload) => new Promise((resolve, reject) => {
  fetch(`${endpoint}users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => resolve(data))
    .catch(reject);
});

// UPDATE USER
const updateUserProfile = (payload) => new Promise((resolve, reject) => {
  fetch(`${endpoint}users/${payload.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    // .then((response) => response.json())
    .then((data) => resolve(data))
    .catch(reject);
});

export { getSingleUser, createUser, updateUserProfile };
