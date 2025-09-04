import React, { useEffect, useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { useAuth } from '../utils/context/authContext';
import { deleteComment } from '../api/commentData';
import { getUserByUid } from '../api/userData';
import CustomModal from './CustomModal';

export default function CommentCard({ commentObj, jokeFirebaseKey, onUpdate }) {
  const { user } = useAuth();
  const [commentAuthor, setCommentAuthor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});

  useEffect(() => {
    // Fetch comment author details
    if (commentObj.uid && !commentAuthor) {
      getUserByUid(commentObj.uid)
        .then((authorData) => {
          setCommentAuthor(authorData);
        })
        .catch((error) => {
        });
    }
  }, [commentObj.uid, commentAuthor]);

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

  const deleteThisComment = () => {
    console.log('Attempting to delete comment:', commentObj.firebaseKey, 'from joke:', jokeFirebaseKey);

    if (!commentObj.firebaseKey) {
      showInfoModal('Error', 'Cannot delete comment: Missing comment ID', 'danger');
      return;
    }

    showConfirmModal(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      () => {
        deleteComment(jokeFirebaseKey, commentObj.firebaseKey)
          .then(() => {
            console.log('Comment deleted successfully');
            showInfoModal('Success', 'Comment deleted successfully!', 'success');
            onUpdate(); // Refresh the comments
          })
          .catch((error) => {
            console.error('Error deleting comment:', error);
            showInfoModal('Error', `Failed to delete comment: ${error.message}`, 'danger');
          });
      },
      'danger',
    );
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

  const getCommentAuthorName = () => {
    // Try different sources for the author name
    if (commentAuthor?.displayName) return commentAuthor.displayName;
    if (commentAuthor?.email) return commentAuthor.email.split('@')[0];
    if (commentObj.authorName) return commentObj.authorName;
    if (commentObj.author) return commentObj.author;
    return 'Unknown User';
  };

  return (
    <>
      <Card className="mb-3" style={{ backgroundColor: '#f8f9fa' }}>
        <Card.Body>
          <Card.Text style={{ whiteSpace: 'pre-wrap' }}>
            {commentObj.content}
          </Card.Text>

          <div className="comment-meta" style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            <div><strong>By:</strong> {getCommentAuthorName()}</div>
            <div><strong>Date:</strong> {formatDate(commentObj.dateCreated)}</div>
          </div>

          {user?.uid === commentObj.uid && (
            <div className="mt-2">
              <Button
                variant="outline-danger"
                size="sm"
                onClick={deleteThisComment}
              >
                🗑️ Delete
              </Button>
            </div>
          )}
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

CommentCard.propTypes = {
  commentObj: PropTypes.shape({
    uid: PropTypes.string,
    firebaseKey: PropTypes.string,
    content: PropTypes.string,
    authorName: PropTypes.string,
    author: PropTypes.string,
    dateCreated: PropTypes.string,
  }).isRequired,
  jokeFirebaseKey: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
};
