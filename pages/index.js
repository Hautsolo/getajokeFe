import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Form } from 'react-bootstrap';
import { ImSearch } from 'react-icons/im';
import { useAuth } from '../utils/context/authContext';
import { getJokes, searchJokes } from '../api/jokeData';
import PostCard from '../components/PostCard';

function Home() {
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const { user } = useAuth();

  const getAllThePosts = () => {
    getJokes().then((jokes) => {
      setPosts(jokes);
    });
  };

  useEffect(() => {
    getAllThePosts();
  }, []);

  const searchForPosts = (e) => {
    searchJokes(e.target.value).then((filteredPosts) => {
      if (filteredPosts.length === 0 && !e.target.value) {
        getAllThePosts();
      } else {
        setPosts(filteredPosts);
      }
    });
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Sort posts based on selected criteria
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.dateCreated || 0);
      const dateB = new Date(b.dateCreated || 0);
      return dateB - dateA; // Sort by date (newest first)
    }
    if (sortBy === 'upvotes') {
      const upvotesA = a.upvotes || 0;
      const upvotesB = b.upvotes || 0;
      return upvotesB - upvotesA; // Sort by upvotes (highest first)
    }
    return 0;
  });

  return (
    <>
      <h1 style={{ width: '100%', textAlign: 'center', margin: '20px' }}>
        Hello, {user?.displayName || 'User'}! Check out these jokes!
      </h1>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', marginBottom: '30px', width: '75%' }}>
          <ImSearch style={{ marginTop: '10px', marginRight: '5px' }} />
          <Form style={{ width: '100%' }}>
            <Form.Control
              type="text"
              placeholder="Filter by content or tags"
              name="search"
              onChange={searchForPosts}
              required
            />
          </Form>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <Form.Select value={sortBy} onChange={handleSortChange} style={{ width: '200px' }}>
          <option value="date">Sort by Date</option>
          <option value="upvotes">Sort by Upvotes</option>
        </Form.Select>
      </div>
      <div
        className="d-flex flex-wrap"
        style={{
          width: '100%', height: '100%', gap: '20px', justifyContent: 'space-evenly', paddingBottom: '20px',
        }}
      >
        {(sortedPosts.length > 0) ? sortedPosts.map((post) => (
          <PostCard key={post.firebaseKey} postObj={post} onUpdate={getAllThePosts} />
        )) : (
          <div style={{ display: 'flex', width: '800px', justifyContent: 'center' }}>
            <h5 style={{ marginRight: '5px' }}>No jokes match your search.</h5>
            <Link passHref href="/joke/edit/new">
              <h5 className="clickableLink">Create a Joke?</h5>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

export default Home;
