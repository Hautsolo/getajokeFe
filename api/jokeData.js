import { clientCredentials } from '../utils/client';

const endpoint = clientCredentials.databaseURL.replace(/"/g, '');

// GET ALL POSTS
const getJokes = () => new Promise((resolve, reject) => {
  fetch(`${endpoint}jokes`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => resolve(Object.values(data)))
    .catch(reject);
});

export const upvoteJoke = (id) => new Promise((resolve, reject) => {
  fetch(`${endpoint}jokes/${id}/upvote/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // If authentication is needed, include the token or credentials here
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to upvote joke');
      }
      return response.json();
    })
    .then((data) => resolve(data))
    .catch(reject);
});
// GET ALL POSTS MADE BY A SINGLE USER
const getJokesForSingleUser = (uid) => new Promise((resolve, reject) => {
  fetch(`${endpoint}jokes?uid=${uid}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => resolve(Object.values(data)))
    .catch(reject);
});

// GET A SINGLE POST
const getSingleJoke = (id) => new Promise((resolve, reject) => {
  fetch(`${endpoint}jokes/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => resolve((data)))
    .catch(reject);
});

// CREATE POST
const createJoke = (payload) => new Promise((resolve, reject) => {
  fetch(`${endpoint}jokes`, {
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

// UPDATE POST
const updateJoke = (payload, id) => new Promise((resolve, reject) => {
  fetch(`${endpoint}jokes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => resolve(data))
    .catch(reject);
});

// DELETE POST
const deleteJoke = (id) => new Promise((resolve, reject) => {
  fetch(`${endpoint}jokes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(text || 'Failed to delete joke');
        });
      }
      return response.text('deleted');
    })
    .then((data) => resolve(data))
    .catch(reject);
});

const searchJokes = (searchValue) => new Promise((resolve, reject) => {
  getJokes().then((jokes) => {
    const searchTerm = searchValue ? searchValue.toLowerCase() : '';

    const filteredJokes = jokes.filter((joke) => {
      // Ensure joke properties are defined and are strings
      const content = joke.content ? joke.content.toLowerCase() : '';

      // Ensure tags are defined and handle the case where tag.label might be undefined
      const tagsMatch = joke.tags && joke.tags.some((tag) => (tag.label ? tag.label.toLowerCase().includes(searchTerm) : false));

      return (
        content.includes(searchTerm)
        || tagsMatch
      );
    });

    resolve(filteredJokes);
  }).catch(reject);
});

export {
  getJokes,
  getJokesForSingleUser,
  getSingleJoke,
  createJoke,
  updateJoke,
  deleteJoke,
  searchJokes,
};
