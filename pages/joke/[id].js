import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { Accordion, Button } from 'react-bootstrap';
import Link from 'next/link';
import { deleteJoke, getSingleJoke } from '../../api/jokeData';
import { getCommentsByPostId } from '../../api/commentData';
import CommentCard from '../../components/CommentCard';
import CommentForm from '../../components/Forms/CommentForm';
import { useAuth } from '../../utils/context/authContext';

const initialState = {
  content: '',
};
export default function ViewPost() {
  const router = useRouter();
  const { id } = router.query;
  const [postDetails, setPostDetails] = useState({});
  const [comments, setComments] = useState([]);

  const { user } = useAuth();

  const postId = Number(id);

  const getTheJoke = () => {
    getSingleJoke(id).then(setPostDetails);
  };

  const getCommentsByPost = () => {
    getCommentsByPostId(id).then(setComments);
  };

  useEffect(() => {
    getTheJoke();
    getCommentsByPost();
  }, []);

  const deleteThisPost = () => {
    if (window.confirm(`Delete ${postDetails.title}?`)) {
      deleteJoke(id).then(() => getTheJoke());
    }
  };

  return (
    <div className="postcontainer">
      <div className="buttonscontainer">
        {user.uid === postDetails.user?.uid ? (
          <Link href={`/joke/edit/${id}`} passHref>
            <span className="postbuttons"><Button className="post-card-button" style={{ marginBottom: '15px', bottom: '10px' }}>Edit Post</Button></span>
          </Link>
        ) : ''}
        {user.uid === postDetails.user?.uid ? <span className="postbuttons"><Button onClick={deleteThisPost} className="post-card-button delete-button">Delete Post</Button></span> : ''}
      </div>
      <div className="postcontents" style={{ width: '400px' }}>
        <p>posted by: {postDetails.user?.name}</p>
        <p id="content">{postDetails.content}</p>
        <p>Tags: {postDetails.tags?.map((tag, index) => (
          index === postDetails.tags.length - 1 ? tag.label : `${tag.label}, `
        ))}
        </p>
        <div className="commentslist">
          <p>Comments:</p>
          {comments.map((comment) => (
            <CommentCard key={comment.id} commentObj={comment} onUpdate={getCommentsByPost} />
          ))}
          <Accordion className="commentscontainer">
            <Accordion.Item eventKey="0">
              <Accordion.Header><h5 style={{ color: 'black' }}>Leave a Comment</h5></Accordion.Header>
              <Accordion.Body>
                <CommentForm commentPostId={postId} onSubmit={getCommentsByPost} />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
      </div>
    </div>
  );
}

ViewPost.propTypes = {
  postDetails: PropTypes.shape({
    id: PropTypes.number,
    content: PropTypes.string,
    user: PropTypes.string,

    upvotes: PropTypes.number,
    tags: PropTypes.arrayOf(PropTypes.string),
  }),
};

ViewPost.defaultProps = {
  postDetails: initialState,
};
