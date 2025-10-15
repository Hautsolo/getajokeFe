import { clientCredentials } from '../utils/client';

const endpoint = clientCredentials.databaseURL;

const createComment = (jokeFirebaseKey, payload) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/jokes/${jokeFirebaseKey}/comments.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to create comment');
      }
      return response.json();
    })
    .then((data) => resolve(data))
    .catch(reject);
});

const getComments = (jokeFirebaseKey) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/jokes/${jokeFirebaseKey}/comments.json`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        const commentsWithKeys = Object.keys(data).map(key => ({
          ...data[key],
          firebaseKey: key
        }));
        resolve(commentsWithKeys);
      } else {
        resolve([]);
      }
    })
    .catch(reject);
});

const updateComment = (jokeFirebaseKey, commentFirebaseKey, payload) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/jokes/${jokeFirebaseKey}/comments/${commentFirebaseKey}.json`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to update comment');
      }
      return response.json();
    })
    .then((data) => resolve(data))
    .catch(reject);
});

const deleteComment = (jokeFirebaseKey, commentFirebaseKey) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/jokes/${jokeFirebaseKey}/comments/${commentFirebaseKey}.json`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }
      return response.json();
    })
    .then((data) => resolve(data))
    .catch(reject);
});

const getSingleComment = (jokeFirebaseKey, commentFirebaseKey) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/jokes/${jokeFirebaseKey}/comments/${commentFirebaseKey}.json`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        resolve({ ...data, firebaseKey: commentFirebaseKey });
      } else {
        resolve(null);
      }
    })
    .catch(reject);
});

export {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  getSingleComment,
};
