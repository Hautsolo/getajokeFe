import { clientCredentials } from '../utils/client';

const endpoint = clientCredentials.databaseURL;

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
        const jokesWithKeys = Object.keys(data).map(key => ({
          ...data[key],
          firebaseKey: key
        }));
        resolve(jokesWithKeys);
      } else {
        resolve([]);
      }
    })
    .catch(reject);
});

const getJokesForSingleUser = (uid) => new Promise((resolve, reject) => {
  if (!uid) {
    resolve([]);
    return;
  }

  const normalized = String(uid);
  console.log('=== getJokesForSingleUser ===');
  console.log('Searching for UID:', normalized);

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
        const jokesWithKeys = Object.keys(data).map(key => ({
          ...data[key],
          firebaseKey: key
        }));
        console.log('Firebase query found jokes:', jokesWithKeys.length);
        resolve(jokesWithKeys);
      } else {
        console.log('Firebase query returned empty, falling back to full fetch');
        return getJokes().then(allJokes => {
          const userJokes = allJokes.filter(joke => joke.uid === normalized);
          console.log('Fallback fetch found jokes:', userJokes.length);
          resolve(userJokes);
        });
      }
    })
    .catch((error) => {
      console.log('Firebase query failed, falling back to full fetch:', error.message);
      getJokes().then(allJokes => {
        const userJokes = allJokes.filter(joke => joke.uid === normalized);
        console.log('Fallback fetch found jokes:', userJokes.length);
        console.log('Sample joke UIDs from all jokes:', allJokes.slice(0, 3).map(j => ({ title: j.title, uid: j.uid })));
        resolve(userJokes);
      }).catch(reject);
    });
});

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
        resolve({ ...data, firebaseKey });
      } else {
        resolve(null);
      }
    })
    .catch(reject);
});

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
      const firebaseKey = data.name;
      resolve({ ...payload, firebaseKey });
    })
    .catch((error) => {
      console.error('Create joke error:', error);
      reject(error);
    });
});

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

const upvoteJoke = (firebaseKey, userId) => new Promise((resolve, reject) => {
  getSingleJoke(firebaseKey).then((joke) => {
    if (!joke) {
      reject(new Error('Joke not found'));
      return;
    }

    const upvoters = joke.upvoters || [];

    if (upvoters.includes(userId)) {
      reject(new Error('You have already upvoted this joke'));
      return;
    }

    const newUpvoters = [...upvoters, userId];
    const newUpvoteCount = newUpvoters.length;

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

const searchJokes = (searchValue) => new Promise((resolve, reject) => {
  getJokes().then((jokes) => {
    const searchTerm = searchValue ? searchValue.toLowerCase() : '';

    const filteredJokes = jokes.filter((joke) => {
      const content = joke.content ? joke.content.toLowerCase() : '';
      const title = joke.title ? joke.title.toLowerCase() : '';

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
