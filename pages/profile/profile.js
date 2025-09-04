import { Button, Card } from 'react-bootstrap';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../utils/context/authContext';
import PostCard from '../../components/PostCard';
import { getJokesForSingleUser, getJokes } from '../../api/jokeData';
import { getUserByUid } from '../../api/userData';

export default function Profile() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fallbackFetchByAuthorName = useCallback(() => {
    if (!user) return Promise.resolve();
    const fallbackNames = [
      user.displayName,
      user.email ? user.email.split('@')[0] : null,
    ].filter(Boolean);

    return getJokes().then((all) => {
      const byAuthor = all.filter((j) => fallbackNames.includes(j.authorName));
      setPosts(byAuthor);
    });
  }, [user]);

  const getUserPosts = useCallback(() => {
    if (user?.uid) {
      getJokesForSingleUser(user.uid)
        .then((jokes) => {
          if (jokes && jokes.length > 0) {
            setPosts(jokes);
          } else {
            return fallbackFetchByAuthorName();
          }
          return null;
        })
        .catch(() => fallbackFetchByAuthorName());
    }
  }, [user, fallbackFetchByAuthorName]);

  const getTheUser = useCallback(() => {
    if (user?.uid) {
      getUserByUid(user.uid)
        .then((theUser) => {
          if (theUser) {
            setUserDetails(theUser);
          } else {
            const fallbackUser = {
              uid: user.uid,
              displayName: user.displayName || user.email?.split('@')[0] || 'User',
              email: user.email,
              photoURL: user.photoURL,
              bio: '',
            };
            setUserDetails(fallbackUser);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      getTheUser();
      getUserPosts();
    } else {
      setIsLoading(false);
    }
  }, [user, getTheUser, getUserPosts]);

  const getDisplayName = () => userDetails?.displayName || user?.displayName || userDetails?.email?.split('@')[0] || user?.email?.split('@')[0] || 'Unknown User';

  if (isLoading) return <div className="text-center mt-5">Loading profile...</div>;
  if (!user) return <div className="text-center mt-5">Please sign in to view your profile.</div>;

  return (
    <>
      <Card style={{ width: '15rem', marginTop: '20px' }}>
        <Card.Body>
          <Card.Title>{getDisplayName()}</Card.Title>
          {(userDetails?.email || user?.email) && (
            <p className="text-muted">{userDetails?.email || user?.email}</p>
          )}
          {userDetails?.bio && <p className="card-text">{userDetails.bio}</p>}
          <div style={{ display: 'flex', justifyContent: 'right' }}>
            <Link href={`/profile/edit/${user.uid}`} passHref>
              <Button variant="secondary">Edit Profile</Button>
            </Link>
          </div>
        </Card.Body>
      </Card>

      <h5 style={{ marginTop: '30px' }}>Your Jokes ({posts.length}):</h5>

      <div className="d-flex flex-wrap" style={{ width: '100%', gap: '20px' }}>
        {posts.length === 0 ? (
          <div className="text-center w-100">
            <p>You haven&apos;t posted any jokes yet...</p>
            <Link href="/joke/edit/new" passHref>
              <Button variant="primary">Create Your First Joke</Button>
            </Link>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.firebaseKey} postObj={post} onUpdate={getUserPosts} />
          ))
        )}
      </div>
    </>
  );
}
