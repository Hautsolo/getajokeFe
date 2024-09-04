import { clientCredentials } from '../utils/client';

const endpoint = clientCredentials.databaseURL.replace(/"/g, '');

// GET ALL COMMENTS
const getComments = () => new Promise((resolve, reject) => {
  fetch(`${endpoint}comments`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => resolve(Object.values(data)))
    .catch(reject);
});

// GET COMMENTS BY POST ID
const getCommentsByPostId = (id) => new Promise((resolve, reject) => {
  fetch(`${endpoint}comments?joke_id=${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => resolve(Object.values(data)))
    .catch(reject);
});

// GET ALL COMMENTS MADE BY A SINGLE USER
const getCommentsForSingleUser = (uid) => new Promise((resolve, reject) => {
  fetch(`${endpoint}comments?uid=${uid}"`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => resolve(Object.values(data)))
    .catch(reject);
});

// GET A SINGLE COMMENT
const getSingleComment = (id) => new Promise((resolve, reject) => {
  fetch(`${endpoint}comments/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => resolve(Object.values(data)))
    .catch(reject);
});

// CREATE COMMENT
const createComment = (userId, id, comment) => new Promise((resolve, reject) => {
  fetch(`${endpoint}comments?joke_id=${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      content: comment.content,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => resolve(data))
    .catch(reject);
});
// UPDATE COMMENT
const updateComment = (payload) => new Promise((resolve, reject) => {
  fetch(`${endpoint}comments/${payload.id}`, {
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

// DELETE COMMENT
const deleteComment = (id) => new Promise((resolve, reject) => {
  fetch(`${endpoint}comments/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response)
    .then((data) => resolve(data))
    .catch(reject);
});

export {
  getComments, getCommentsByPostId, getCommentsForSingleUser, getSingleComment, createComment, updateComment, deleteComment,
};
