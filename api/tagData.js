import { clientCredentials } from '../utils/client';

let endpoint = clientCredentials.databaseURL.replace(/"/g, '');

// Check if the endpoint is using HTTP, and replace it with HTTPS if necessary
if (endpoint.startsWith('http://')) {
  endpoint = endpoint.replace('http://', 'https://');
}
// Check if the endpoint is using HTTP, and replace it with HTTPS if necessary
if (endpoint.startsWith('http://')) {
  endpoint = endpoint.replace('http://', 'https://');
}
// GET ALL TAGS
const getTags = () => new Promise((resolve, reject) => {
  fetch(`${endpoint}tags`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => resolve(Object.values(data)))
    .catch(reject);
});

// GET TAGS BY POST ID
const getTagsByPostId = (id) => new Promise((resolve, reject) => {
  fetch(`${endpoint}tags?joke_id=${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => resolve(Object.values(data)))
    .catch(reject);
});

// GET ALL TAGS MADE BY A SINGLE USER
const getTagsForSingleUser = (uid) => new Promise((resolve, reject) => {
  fetch(`${endpoint}tags?uid=${uid}"`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => resolve(Object.values(data)))
    .catch(reject);
});

// GET A SINGLE TAG
const getSingleTag = (id) => new Promise((resolve, reject) => {
  fetch(`${endpoint}tags/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => resolve(Object.values(data)))
    .catch(reject);
});

// CREATE TAG
const createTag = (payload) => new Promise((resolve, reject) => {
  fetch(`${endpoint}tags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      label: payload,
    }),
  })
    .then((response) => response.json())
    .then((data) => resolve(data))
    .catch(reject);
});

// UPDATE TAG
const updateTag = (payload) => new Promise((resolve, reject) => {
  fetch(`${endpoint}tags/${payload.id}`, {
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

// DELETE TAG
const deleteTag = (id) => new Promise((resolve, reject) => {
  fetch(`${endpoint}tags/${id}`, {
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
  getTags, getTagsByPostId, getTagsForSingleUser, getSingleTag, createTag, updateTag, deleteTag,
};
