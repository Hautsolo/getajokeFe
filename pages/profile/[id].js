import { Button, Card } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import PostCard from '../../components/PostCard';
import { getJokesForSingleUser, getJokes } from '../../api/jokeData';
import { getUserByUid } from '../../api/userData';
import { useAuth } from '../../utils/context/authContext';

export default function UserProfile() {
  const router = useRouter();
  const { id } = router.query; // This is the UID of the user to view
  const { user } = useAuth(); // Current logged-in user
  const [posts, setPosts] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState('');

  const fallbackDeriveFromJokes = async () => {
    // If user profile isn't found, we can try to infer displayName from jokes
    const all = await getJokes();
    const theirs = all.filter((j) => j.uid === id);
    setPosts(theirs);
    if (theirs.length > 0) {
      const inferredName = theirs[0].authorName || 'User';
      setUserDetails({ uid: id, displayName: inferredName });
      setError('');
    }
  };

  const getTheUser = () => {
    if (id) {
      getUserByUid(id)
        .then((theUser) => {
          if (theUser) {
            setUserDetails(theUser);
          } else {
            // No profile; try to derive from jokes
            fallbackDeriveFromJokes().finally(() => setIsLoading(false));
          }
        })
        .catch(() => fallbackDeriveFromJokes())
        .finally(() => setIsLoading(false));
    }
  };

  const getUserPosts = () => {
    if (id) {
      console.log('=== FETCHING POSTS FOR USER ID ===', id);
      getJokesForSingleUser(id)
        .then((jokes) => {
          console.log('=== JOKES FOR USER ===', jokes?.length);
          console.log('Found jokes:', jokes?.map((j) => ({
            title: j.title,
            uid: j.uid,
            authorName: j.authorName,
            firebaseKey: j.firebaseKey,
          })));

          if (jokes && jokes.length > 0) {
            setPosts(jokes);
          } else {
            console.log('No jokes found by UID, trying full fetch + filter');
            // fallback using all jokes
            return getJokes().then((all) => {
              const filtered = all.filter((j) => j.uid === id);
              console.log('Full fetch found jokes:', filtered.length);
              setPosts(filtered);
            });
          }
          return null;
        })
        .catch((error) => {
          console.error('Error fetching user posts:', error);
          getJokes().then((all) => {
            const filtered = all.filter((j) => j.uid === id);
            console.log('Fallback fetch found jokes:', filtered.length);
            setPosts(filtered);
          });
        });
    }
  };

  useEffect(() => {
    if (id) {
      getTheUser();
      getUserPosts();
    }
  }, [id]);

  const getDisplayName = () => userDetails?.displayName || userDetails?.email?.split('@')[0] || 'Unknown User';

  if (isLoading) {
    return <div className="text-center mt-5">Loading profile...</div>;
  }

  if (!userDetails) {
    return (
      <div className="text-center mt-5">
        <h3>User Not Found</h3>
        <p>The profile you're looking for doesn't exist.</p>
        <Link href="/" passHref>
          <Button variant="primary">Go Home</Button>
        </Link>
      </div>
    );
  }

  const isOwnProfile = user?.uid === userDetails?.uid;

  return (
    <>
      <Card style={{ width: '15rem', marginTop: '20px' }}>
        <Card.Body>
          <Card.Title>{getDisplayName()}</Card.Title>
          {isOwnProfile && userDetails?.email && (
            <p className="text-muted">{userDetails.email}</p>
          )}
          {userDetails?.bio && (
            <p className="card-text">Bio: {userDetails.bio}</p>
          )}
          <div style={{ display: 'flex', justifyContent: 'right' }}>
            {isOwnProfile && (
              <Link href={`/profile/edit/${id}`} passHref>
                <Button style={{ backgroundColor: '#41B4EE' }}>Edit Profile</Button>
              </Link>
            )}
          </div>
        </Card.Body>
      </Card>

      <h5 style={{ marginTop: '30px' }}>
        Jokes by {getDisplayName()} ({posts.length}):
      </h5>

      <div className="d-flex flex-wrap" style={{ width: '100%', gap: '20px', paddingBottom: '20px' }}>
        {posts.length === 0 ? (
          <div className="text-center w-100">
            <p>
              {isOwnProfile ? "You haven't posted any jokes yet." : `${getDisplayName()} hasn't posted any jokes yet.`}
            </p>
            {isOwnProfile && (
              <Link href="/joke/edit/new" passHref>
                <Button variant="primary">Create Your First Joke</Button>
              </Link>
            )}
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
