import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Card } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { deleteJoke, upvoteJoke } from '../api/jokeData';
import { getUserByUid } from '../api/userData';
import { useAuth } from '../utils/context/authContext';
import CustomModal from './CustomModal';

function PostCard({ postObj, onUpdate }) {
  const router = useRouter();
  const { user } = useAuth();
  const [jokeAuthor, setJokeAuthor] = useState(null);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});

  useEffect(() => {
    if (postObj.uid && !jokeAuthor) {
      getUserByUid(postObj.uid)
        .then((authorData) => {
          setJokeAuthor(authorData);
        })
        .catch(() => {
          setJokeAuthor(null);
        });
    }

    if (user?.uid && postObj.upvoters) {
      setHasUpvoted(postObj.upvoters.includes(user.uid));
    }
  }, [postObj, jokeAuthor, user]);

  const showConfirmModal = (title, message, onConfirm, type = 'confirm') => {
    setModalConfig({
      title,
      message,
      type,
      onConfirm,
      showCancel: true,
      confirmText: type === 'danger' ? 'Delete' : 'Yes',
    });
    setShowModal(true);
  };

  const showInfoModal = (title, message, type = 'info') => {
    setModalConfig({
      title,
      message,
      type,
      showCancel: false,
    });
    setShowModal(true);
  };

  const deleteThisPost = () => {
    showConfirmModal(
      'Delete Joke',
      `Are you sure you want to delete "${postObj.title || postObj.content?.substring(0, 50)}..."?`,
      () => {
        deleteJoke(postObj.firebaseKey).then(() => {
          showInfoModal('Success', 'Joke deleted successfully!', 'success');
          onUpdate();
        }).catch((error) => {
          showInfoModal('Error', `Failed to delete joke: ${error.message}`, 'danger');
        });
      },
      'danger'
    );
  };

  const handleUpvote = () => {
    if (!user?.uid) {
      showInfoModal('Sign In Required', 'Please sign in to upvote jokes!', 'warning');
      return;
    }

    if (hasUpvoted) {
      showInfoModal('Already Upvoted', 'You have already upvoted this joke!', 'info');
      return;
    }

    upvoteJoke(postObj.firebaseKey, user.uid)
      .then(() => {
        setHasUpvoted(true);
        showInfoModal('Success', 'Joke upvoted successfully! 🎉', 'success');
        onUpdate();
      })
      .catch((error) => {
        if (error.message.includes('already upvoted')) {
          setHasUpvoted(true);
          showInfoModal('Already Upvoted', 'You have already upvoted this joke!', 'info');
        } else {
          showInfoModal('Error', `Failed to upvote: ${error.message}`, 'danger');
        }
      });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return 'Unknown date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  const formatTags = (tags) => {
    if (!tags || !Array.isArray(tags)) return 'No tags';
    return tags.join(', ');
  };

  const getAuthorName = () => {
    if (jokeAuthor?.displayName) return jokeAuthor.displayName;
    if (jokeAuthor?.email) return jokeAuthor.email.split('@')[0];
    if (postObj.authorName) return postObj.authorName;
    if (postObj.author) return postObj.author;
    if (postObj.uid && user?.uid && postObj.uid === user.uid) {
      return user.displayName || (user.email ? user.email.split('@')[0] : 'Unknown User');
    }

    return 'Unknown User';
  };

  const handleUserClick = () => {
    if (postObj.uid) {
      router.push(`/profile/${postObj.uid}`);
    }
  };

  return (
    <>
      <Card className="post-card" style={{ width: '600px' }}>
        <Card.Body>
          <Card.Title>{postObj.title || 'Untitled Joke'}</Card.Title>
          <Card.Text style={{ fontSize: '18px', minHeight: '100px', whiteSpace: 'pre-wrap' }}>
            {postObj.content}
          </Card.Text>

          <div className="post-meta" style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
            <div>
              <strong>Posted by:</strong>{' '}
              <span
                style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={handleUserClick}
                onKeyPress={handleUserClick}
                role="button"
                tabIndex={0}
              >
                {getAuthorName()}
              </span>
            </div>
            <div><strong>Date:</strong> {formatDate(postObj.dateCreated)}</div>
            <div><strong>Tags:</strong> {formatTags(postObj.tags)}</div>
            <div><strong>Upvotes:</strong> {postObj.upvotes || 0}</div>
          </div>

          <div className="button-group" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button
              variant={hasUpvoted ? 'success' : 'outline-primary'}
              onClick={handleUpvote}
              disabled={hasUpvoted}
              size="sm"
            >
              {hasUpvoted ? '👍 Upvoted ✓' : '👍 Upvote'}
            </Button>

            {user?.uid === postObj.uid && (
              <>
                <Button
                  variant="outline-secondary"
                  onClick={() => router.push(`/joke/edit/${postObj.firebaseKey}`)}
                  size="sm"
                >
                  ✏️ Edit
                </Button>
                <Button
                  variant="outline-danger"
                  onClick={deleteThisPost}
                  size="sm"
                >
                  🗑️ Delete
                </Button>
              </>
            )}

            <Button
              variant="outline-info"
              onClick={() => router.push(`/joke/${postObj.firebaseKey}`)}
              size="sm"
            >
              💬 Comments
            </Button>
          </div>
        </Card.Body>
      </Card>

      <CustomModal
        show={showModal}
        onHide={() => setShowModal(false)}
        {...modalConfig}
      />
    </>
  );
}

PostCard.propTypes = {
  postObj: PropTypes.shape({
    firebaseKey: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.string,
    uid: PropTypes.string,
    authorName: PropTypes.string,
    author: PropTypes.string,
    dateCreated: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    upvotes: PropTypes.number,
    upvoters: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default PostCard;
