import { clientCredentials } from '../utils/client';

const endpoint = clientCredentials.databaseURL;

// GET ALL TAGS
const getTags = () => new Promise((resolve, reject) => {
  fetch(`${endpoint}/tags.json`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        resolve(Object.values(data));
      } else {
        resolve([]);
      }
    })
    .catch(reject);
});

// GET SINGLE TAG
const getSingleTag = (firebaseKey) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/tags/${firebaseKey}.json`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => resolve(data))
    .catch(reject);
});

// CREATE TAG
const createTag = (payload) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/tags.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to create tag');
      }
      return response.json();
    })
    .then((data) => resolve(data))
    .catch(reject);
});

// UPDATE TAG
const updateTag = (payload) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/tags/${payload.firebaseKey}.json`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to update tag');
      }
      return response.json();
    })
    .then((data) => resolve(data))
    .catch(reject);
});

// DELETE TAG
const deleteTag = (firebaseKey) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/tags/${firebaseKey}.json`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => resolve(data))
    .catch(reject);
});

export {
  getTags,
  getSingleTag,
  createTag,
  updateTag,
  deleteTag,
};
