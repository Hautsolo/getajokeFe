import { Button, Card } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../utils/context/authContext';
import PostCard from '../../components/PostCard';
import { getJokesForSingleUser } from '../../api/jokeData';
import { getSingleUser } from '../../api/userData';

export default function Profile() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [userDetails, setUserDetails] = useState({});

  const getUserPosts = () => {
    getJokesForSingleUser(user.uid).then(setPosts);
  };

  const getTheUser = () => {
    getSingleUser(user.uid).then((theUser) => {
      setUserDetails(theUser);
    });
  };

  useEffect(() => {
    getTheUser();
    getUserPosts();
  }, [user.uid]);

  return (
    <>
      <Card style={{ width: '15rem', marginTop: '20px' }}>
        <Card.Body>
          <Card.Title>{userDetails.name}</Card.Title>
          <div style={{ display: 'flex', justifyContent: 'right' }}>
            {userDetails.uid === user.uid && (
              <Link href={`/profile/edit/${user.uid}`} passHref>
                <Button variant="secondary">Edit</Button>
              </Link>
            )}
          </div>
        </Card.Body>
      </Card>
      <h5 style={{ marginTop: '30px' }}>Posts by {userDetails.name || user.name}:</h5>
      <div className="d-flex flex-wrap" style={{ width: '100%', gap: '20px' }}>
        {posts.length === 0 ? (
          'You have not posted yet...'
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} postObj={post} onUpdate={getUserPosts} />
          ))
        )}
      </div>
    </>
  );
}
