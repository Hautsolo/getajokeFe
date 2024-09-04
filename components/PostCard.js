import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Link from 'next/link';
import { ButtonGroup } from 'react-bootstrap';
import { useState } from 'react';
import { deleteJoke, upvoteJoke } from '../api/jokeData'; // Import upvoteJoke function
import { useAuth } from '../utils/context/authContext';

function PostCard({ postObj, onUpdate }) {
  const { user } = useAuth();
  const [upvotes, setUpvotes] = useState(postObj.upvotes_count); // Manage upvotes locally

  const deleteThisPost = () => {
    if (window.confirm(`Delete ${postObj.content}?`)) {
      deleteJoke(postObj.id).then(() => onUpdate());
    }
  };

  const handleUpvote = () => {
    upvoteJoke(postObj.id).then((updatedPost) => {
      setUpvotes(updatedPost.upvotes_count); // Update local state with new upvotes count
      onUpdate(); // Optionally call onUpdate to refresh the post list
    }).catch((error) => {
      console.error('Failed to upvote joke:', error);
    });
  };

  return (
    <Card className="post-card" style={{ width: '600px' }}>
      <Card.Body style={{ padding: '10px', color: 'black', paddingBottom: '5px' }}>
        <Card.Title id="jokcontent">{postObj.content}</Card.Title>

        <div style={{ minHeight: '24px', marginBottom: '16px', fontSize: '14px' }}>
          {postObj.tags.length > 0 ? (
            <p className="post-card-list-group">
              Tags: {postObj.tags?.map((tag) => tag.label).join(', ')}
            </p>
          ) : ''}
          <p>Upvotes: {upvotes}</p> {/* Display upvotes */}
          <p>Created at: {new Date(postObj.created_at).toLocaleDateString()}</p> {/* Display created_at */}
        </div>

        <ButtonGroup style={{ width: '100%', display: 'flex', alignItems: 'bottom' }}>
          <Link href={`/joke/${postObj.id}`} passHref>
            <Button className="post-card-button">View</Button>
          </Link>
          {user && user.uid === postObj.user.uid ? (
            <Link href={`/joke/edit/${postObj.id}`} passHref>
              <Button className="post-card-button">Edit</Button>
            </Link>
          ) : null}
          {user && user.uid === postObj.user.uid ? (
            <Button className="delete-button post-card-button" onClick={deleteThisPost}>
              Delete
            </Button>
          ) : null}
          <Button className="post-card-button" onClick={handleUpvote}>Upvote</Button> {/* Add upvote button */}
        </ButtonGroup>

        <Card.Title style={{
          fontSize: '20px', textAlign: 'right', padding: '0', marginTop: '5px',
        }}
        >
          Posted by <Link href={`/profile/${postObj.user?.uid}`}>{postObj.user?.username}</Link>
        </Card.Title>
      </Card.Body>
    </Card>
  );
}

PostCard.propTypes = {
  postObj: PropTypes.shape({
    id: PropTypes.number.isRequired,
    content: PropTypes.string.isRequired,
    postDate: PropTypes.string,
    description: PropTypes.string,
    user: PropTypes.shape({
      id: PropTypes.number,
      username: PropTypes.string.isRequired,
      uid: PropTypes.string.isRequired,
      bio: PropTypes.string,
    }).isRequired,
    upvotes_count: PropTypes.number.isRequired,
    tags: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      label: PropTypes.string,
    })).isRequired,
    created_at: PropTypes.string.isRequired, // Add this line
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default PostCard;
