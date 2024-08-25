import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Link from 'next/link';
import { ButtonGroup } from 'react-bootstrap';
import { deleteJoke } from '../api/jokeData';
import { useAuth } from '../utils/context/authContext';

function PostCard({ postObj, onUpdate }) {
  const deleteThisPost = () => {
    if (window.confirm(`Delete ${postObj.title}?`)) {
      deleteJoke(postObj.id).then(() => onUpdate());
    }
  };
  const { user } = useAuth();

  return (
    <Card className="post-card" style={{ width: '300px' }}>
      <Card.Body style={{ padding: '10px', color: '#F6F6F6', paddingBottom: '5px' }}>
        <Card.Title>{postObj.title}</Card.Title>

        <div style={{ minHeight: '24px', marginBottom: '16px', fontSize: '14px' }}>
          {/* {<p>Likes: {postObj.upvotes}} */}
          {postObj.tags.length > 0 ? (
            <p className="post-card-list-group">Tags: {postObj.tags?.map((tag) => (
              tag.label
            )).join(', ')}
            </p>
          ) : ''}
        </div>
        <ButtonGroup style={{ width: '100%', display: 'flex', alignItems: 'bottom' }}>
          <Link href={`/joke/${postObj.id}`} passHref>
            <Button className="post-card-button">View</Button>
          </Link>
          {user.uid === postObj.user.uid ? (
            <Link href={`/joke/edit/${postObj.id}`} passHref>
              <Button className="post-card-button">Edit</Button>
            </Link>
          ) : ''}
          {user.uid === postObj.user.uid ? <Button className="delete-button post-card-button" onClick={deleteThisPost}>Delete</Button> : ''}
        </ButtonGroup>
        <Card.Footer style={{
          fontSize: '12px', textAlign: 'right', padding: '0', marginTop: '5px',
        }}
        >Posted by <Link href={`/profile/${postObj.user?.uid}`}>{postObj.user?.username}</Link>
        </Card.Footer>
      </Card.Body>
    </Card>
  );
}

PostCard.propTypes = {
  postObj: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    postDate: PropTypes.string,
    description: PropTypes.string,
    user: PropTypes.shape({
      id: PropTypes.number,
      username: PropTypes.string,
      uid: PropTypes.string,
      bio: PropTypes.string,
    }),
    upvotes: PropTypes.number,
    tags: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      label: PropTypes.string,
    })),
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default PostCard;
