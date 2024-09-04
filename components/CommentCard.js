import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { deleteComment, updateComment } from '../api/commentData';
import CommentForm from './Forms/CommentForm';
import { useAuth } from '../utils/context/authContext';
import { getSingleUser } from '../api/userData';

function CommentCard({ commentObj, onUpdate }) {
  const [cardText, setCardText] = useState(<Card.Text>{commentObj.content}</Card.Text>);
  const [commentUser, setCommentUser] = useState({});
  const [edit, setEdit] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    getSingleUser(user.uid).then((obj) => {
      setCommentUser(obj);
    });
  }, [user.uid]);

  const deleteThisComment = () => {
    if (window.confirm('Delete this comment?')) {
      deleteComment(commentObj.id).then(() => onUpdate());
    }
  };

  const handleSubmit = (obj) => {
    updateComment(obj).then((updatedCommentObj) => {
      setCardText(<Card.Text>{updatedCommentObj.content}</Card.Text>);
      onUpdate();
    });
    setEdit(false);
  };

  const handleCancel = () => {
    setCardText(<Card.Text>{commentObj.content}</Card.Text>);
    setEdit(false);
  };

  const editThisComment = () => {
    setCardText(<CommentForm obj={commentObj} commentPostId={commentObj.post} onSubmit={handleSubmit} onCancel={handleCancel} />);
    setEdit(true);
  };

  return (
    <Card style={{
      width: '400px',
      margin: '15px',
      background: 'none',
      display: 'flex',
      border: '1px solid #F6F6F6',
      borderRadius: '5px',
      padding: '5px',
      color: 'black',
      position: 'relative',
    }}
    >
      <Card.Body style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px',
      }}
      >
        {cardText}
        {commentObj.user === commentUser.id && !edit && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            marginLeft: 'auto',
          }}
          >
            <Button variant="secondary" size="sm" onClick={editThisComment} style={{ marginBottom: '5px' }}>
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={deleteThisComment}>
              Delete
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

CommentCard.propTypes = {
  commentObj: PropTypes.shape({
    id: PropTypes.number,
    content: PropTypes.string,
    uid: PropTypes.string,
    user: PropTypes.string,
    post: PropTypes.number,
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default CommentCard;
