import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { Accordion, Button } from 'react-bootstrap';
import Link from 'next/link';
import { deleteJoke, getSingleJoke } from '../../api/jokeData';
import { getComments } from '../../api/commentData';
import CommentCard from '../../components/CommentCard';
import CommentForm from '../../components/Forms/CommentForm';
import { useAuth } from '../../utils/context/authContext';
import { getUserByUid } from '../../api/userData';

const initialState = {
  content: '',
};

export default function ViewJoke() {
  const router = useRouter();
  const { id } = router.query; // This is the firebaseKey
  const [jokeDetails, setJokeDetails] = useState({});
  const [comments, setComments] = useState([]);
  const [jokeAuthor, setJokeAuthor] = useState(null);
  const { user } = useAuth();

  const getTheJoke = () => {
    if (id) {
      getSingleJoke(id).then((joke) => {
        setJokeDetails(joke);
        // Fetch author information
        if (joke?.uid) {
          getUserByUid(joke.uid).then(setJokeAuthor);
        }
      });
    }
  };

  const getJokeComments = () => {
    if (id) {
      getComments(id).then((commentsData) => {
        setComments(commentsData || []);
      });
    }
  };

  useEffect(() => {
    getTheJoke();
    getJokeComments();
  }, [id]);

  const deleteThisJoke = () => {
    if (window.confirm(`Delete "${jokeDetails.title || jokeDetails.content}"?`)) {
      deleteJoke(id).then(() => {
        router.push('/'); // Redirect to home after deletion
      });
    }
  };

  const formatTags = (tags) => {
    if (!tags || !Array.isArray(tags) || tags.length === 0) return 'None';
    return tags.map((tag, index) => {
      const tagLabel = typeof tag === 'string' ? tag : tag.label;
      return index === tags.length - 1 ? tagLabel : `${tagLabel}, `;
    }).join('');
  };

  return (
    <div className="postcontainer">
      <div className="buttonscontainer">
        {user?.uid === jokeDetails.uid && (
          <Link href={`/joke/edit/${id}`} passHref>
            <span className="postbuttons">
              <Button
                className="post-card-button"
                style={{ marginBottom: '15px', bottom: '10px' }}
              >
                Edit Joke
              </Button>
            </span>
          </Link>
        )}
        {user?.uid === jokeDetails.uid && (
          <span className="postbuttons">
            <Button
              onClick={deleteThisJoke}
              className="post-card-button delete-button"
            >
              Delete Joke
            </Button>
          </span>
        )}
      </div>
      <div className="postcontents" style={{ width: '400px' }}>
        {jokeDetails.title && (
          <h3 style={{ marginBottom: '10px' }}>{jokeDetails.title}</h3>
        )}
        <p>Posted by: {jokeAuthor?.displayName || 'Unknown User'}</p>
        <p id="content">{jokeDetails.content}</p>
        <p>Tags: {formatTags(jokeDetails.tags)}</p>
        <p>Upvotes: {jokeDetails.upvotes || 0}</p>
        {jokeDetails.dateCreated && (
          <p>Created: {new Date(jokeDetails.dateCreated).toLocaleDateString()}</p>
        )}

        <div className="commentslist">
          <p>Comments:</p>
          {comments.map((comment) => (
            <CommentCard
              key={comment.firebaseKey || Math.random()}
              commentObj={comment}
              jokeFirebaseKey={id}
              onUpdate={getJokeComments}
            />
          ))}
          <Accordion className="commentscontainer">
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                <h5 style={{ color: 'black' }}>Leave a Comment</h5>
              </Accordion.Header>
              <Accordion.Body>
                <CommentForm
                  jokeFirebaseKey={id}
                  onSubmit={getJokeComments}
                />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
      </div>
    </div>
  );
}

ViewJoke.propTypes = {
  jokeDetails: PropTypes.shape({
    firebaseKey: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.string,
    uid: PropTypes.string,
    upvotes: PropTypes.number,
    tags: PropTypes.array,
    dateCreated: PropTypes.string,
  }),
};

ViewJoke.defaultProps = {
  jokeDetails: initialState,
};
