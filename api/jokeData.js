import { clientCredentials } from '../utils/client';

const endpoint = clientCredentials.databaseURL;

// GET ALL POSTS
const getJokes = () => new Promise((resolve, reject) => {
  fetch(`${endpoint}/jokes`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => resolve(Object.values(data)))
    .catch(reject);
});

// GET ALL POSTS MADE BY A SINGLE USER
const getJokesForSingleUser = (uid) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/jokes?uid=${uid}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => resolve(Object.values(data)))
    .catch(reject);
});

// GET ALL POSTS MADE BY A SINGLE USER
// const getJokesForSingleUser = (id) => new Promise((resolve, reject) => {
//   getJokes().then((jokes) => {
//     const filteredJokes = jokes.filter((post) => post.user_id === id);
//     resolve(filteredJokes);
//   })
//     .catch(reject);
// });

// GET A SINGLE POST
const getSingleJoke = (id) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/jokes/${id}`, {
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
  fetch(`${endpoint}/jokes`, {
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
const updateJoke = (payload) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/jokes/${payload.id}`, {
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
  fetch(`${endpoint}/jokes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    // .then((response) => response.json())
    .then((data) => resolve(data))
    .catch(reject);
});

// SEARCH POSTS
const searchJokes = (searchValue) => new Promise((resolve, reject) => {
  getJokes().then((jokes) => {
    const filteredJokes = jokes.filter((post) => post.title.toLowerCase().includes(searchValue.toLowerCase()) || post.category.label.toLowerCase().includes(searchValue.toLowerCase()));
    resolve(filteredJokes);
  })
    .catch(reject);
});

// FILTER POSTS BY CATEGORY
// const filterJokesByCategory = (category) => new Promise((resolve, reject) => {
//   fetch(`${endpoint}/jokes?category.label="${category}"`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   })
//     .then((response) => response.json())
//     .then((data) => resolve(Object.values(data)))
//     .catch(reject);
// });

export {
  getJokes, getJokesForSingleUser, getSingleJoke, createJoke, updateJoke, deleteJoke, searchJokes,
};
