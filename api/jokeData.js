import { clientCredentials } from '../utils/client';

const endpoint = clientCredentials.databaseURL;

// GET ALL JOKES
const getJokes = () => new Promise((resolve, reject) => {
  fetch(`${endpoint}/jokes.json`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        // Convert Firebase object to array while preserving keys
        const jokesWithKeys = Object.keys(data).map(key => ({
          ...data[key],
          firebaseKey: key // Add the Firebase key to each joke
        }));
        resolve(jokesWithKeys);
      } else {
        resolve([]);
      }
    })
    .catch(reject);
});

// GET ALL JOKES MADE BY A SINGLE USER
const getJokesForSingleUser = (uid) => new Promise((resolve, reject) => {
  if (!uid) {
    resolve([]);
    return;
  }
  
  const normalized = String(uid);
  console.log('=== getJokesForSingleUser ===');
  console.log('Searching for UID:', normalized);
  
  // Try Firebase query first
  fetch(`${endpoint}/jokes.json?orderBy="uid"&equalTo="${normalized}"`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      console.log('Firebase query response status:', response.status);
      if (!response.ok) {
        throw new Error(`Query failed with status ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log('Firebase query data:', data);
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        // Convert Firebase object to array while preserving keys
        const jokesWithKeys = Object.keys(data).map(key => ({
          ...data[key],
          firebaseKey: key
        }));
        console.log('Firebase query found jokes:', jokesWithKeys.length);
        resolve(jokesWithKeys);
      } else {
        console.log('Firebase query returned empty, falling back to full fetch');
        // Fallback: fetch all jokes and filter by UID
        return getJokes().then(allJokes => {
          const userJokes = allJokes.filter(joke => joke.uid === normalized);
          console.log('Fallback fetch found jokes:', userJokes.length);
          resolve(userJokes);
        });
      }
    })
    .catch((error) => {
      console.log('Firebase query failed, falling back to full fetch:', error.message);
      // Fallback: fetch all jokes and filter by UID
      getJokes().then(allJokes => {
        const userJokes = allJokes.filter(joke => joke.uid === normalized);
        console.log('Fallback fetch found jokes:', userJokes.length);
        console.log('Sample joke UIDs from all jokes:', allJokes.slice(0, 3).map(j => ({ title: j.title, uid: j.uid })));
        resolve(userJokes);
      }).catch(reject);
    });
});

// GET A SINGLE JOKE
const getSingleJoke = (firebaseKey) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/jokes/${firebaseKey}.json`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        // Add the firebaseKey to the returned joke
        resolve({ ...data, firebaseKey });
      } else {
        resolve(null);
      }
    })
    .catch(reject);
});

// CREATE JOKE
const createJoke = (payload) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/jokes.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`Failed to create joke: ${response.status} ${response.statusText} - ${text}`);
        });
      }
      return response.json();
    })
    .then((data) => {
      // Firebase returns { "name": "firebaseKey" }
      const firebaseKey = data.name;
      // Return the complete joke object with the firebaseKey
      resolve({ ...payload, firebaseKey });
    })
    .catch((error) => {
      console.error('Create joke error:', error);
      reject(error);
    });
});

// UPDATE JOKE
const updateJoke = (payload) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/jokes/${payload.firebaseKey}.json`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to update joke');
      }
      return response.json();
    })
    .then((data) => resolve(data))
    .catch(reject);
});

// DELETE JOKE
const deleteJoke = (firebaseKey) => new Promise((resolve, reject) => {
  fetch(`${endpoint}/jokes/${firebaseKey}.json`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => resolve(data))
    .catch(reject);
});

// UPVOTE JOKE
const upvoteJoke = (firebaseKey, userId) => new Promise((resolve, reject) => {
  // First, get the current joke data to check existing upvotes
  getSingleJoke(firebaseKey).then((joke) => {
    if (!joke) {
      reject(new Error('Joke not found'));
      return;
    }
    
    // Initialize upvoters array if it doesn't exist
    const upvoters = joke.upvoters || [];
    
    // Check if user has already upvoted
    if (upvoters.includes(userId)) {
      reject(new Error('You have already upvoted this joke'));
      return;
    }
    
    // Add user to upvoters list
    const newUpvoters = [...upvoters, userId];
    const newUpvoteCount = newUpvoters.length;
    
    // Update the joke with new upvote data
    fetch(`${endpoint}/jokes/${firebaseKey}.json`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        upvotes: newUpvoteCount,
        upvoters: newUpvoters 
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to upvote joke');
        }
        return response.json();
      })
      .then((data) => resolve({ upvotes: newUpvoteCount, upvoters: newUpvoters }))
      .catch(reject);
  }).catch(reject);
});

// SEARCH JOKES
const searchJokes = (searchValue) => new Promise((resolve, reject) => {
  getJokes().then((jokes) => {
    const searchTerm = searchValue ? searchValue.toLowerCase() : '';

    const filteredJokes = jokes.filter((joke) => {
      // Ensure joke properties are defined and are strings
      const content = joke.content ? joke.content.toLowerCase() : '';
      const title = joke.title ? joke.title.toLowerCase() : '';

      // Ensure tags are defined and handle the case where tag.label might be undefined
      const tagsMatch = joke.tags && joke.tags.some((tag) => {
        if (typeof tag === 'string') {
          return tag.toLowerCase().includes(searchTerm);
        }
        return tag.label ? tag.label.toLowerCase().includes(searchTerm) : false;
      });

      return (
        content.includes(searchTerm)
        || title.includes(searchTerm)
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
  upvoteJoke,
  searchJokes,
};
