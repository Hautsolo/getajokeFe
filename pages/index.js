import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Form } from 'react-bootstrap';
import { ImSearch } from 'react-icons/im';
import { useAuth } from '../utils/context/authContext';
import { getJokes, searchJokes } from '../api/jokeData';
import PostCard from '../components/PostCard';

function Home() {
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState('date'); // New state for sorting
  const { user } = useAuth();

  const getAllThePosts = () => {
    getJokes().then(setPosts);
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
      return new Date(b.created_at) - new Date(a.created_at); // Sort by date
    }
    if (sortBy === 'upvotes') {
      return b.upvotes_count - a.upvotes_count; // Sort by upvotes
    }
    return 0;
  });

  return (
    <>
      <h1 style={{ width: '100%', textAlign: 'center', margin: '20px' }}>
        Hello, {user.name}! Check out these posts!
      </h1>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', marginBottom: '30px', width: '75%' }}>
          <ImSearch style={{ marginTop: '10px', marginRight: '5px' }} />
          <Form style={{ width: '100%' }}>
            <Form.Control
              type="text"
              placeholder="Filter by tags"
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
          <PostCard key={post.id} postObj={post} onUpdate={getAllThePosts} />
        )) : (
          <div style={{ display: 'flex', width: '800px', justifyContent: 'center' }}>
            <h5 style={{ marginRight: '5px' }}>No posts match your search.</h5>
            <Link passHref href="/post/edit/new">
              <h5 className="clickableLink">Create a Post?</h5>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

export default Home;
