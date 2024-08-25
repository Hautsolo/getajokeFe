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
  title: '',
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
    <div className="mt-5 d-flex flex-wrap">
      <div className="d-flex flex-column">
        {user.uid === postDetails.user?.uid ? (
          <Link href={`/joke/edit/${id}`} passHref>
            <Button className="post-card-button" style={{ marginBottom: '15px' }}>Edit Post</Button>
          </Link>
        ) : ''}
        {user.uid === postDetails.user?.uid ? <Button onClick={deleteThisPost} className="post-card-button delete-button">Delete Post</Button> : ''}
      </div>
      <div className="text-white ms-5 details" style={{ width: '400px' }}>
        <h3>{postDetails.title}</h3>
        <p>Written by: {postDetails.user?.name}</p>
        <p>content: {postDetails.description}</p>
        <p>Tags: {postDetails.tags?.map((tag, index) => (
          index === postDetails.tags.length - 1 ? tag.label : `${tag.label}, `
        ))}
        </p>
        <div>
          <p>Comments:</p>
          {comments.map((comment) => (
            <CommentCard key={comment.id} commentObj={comment} onUpdate={getCommentsByPost} />
          ))}
          <Accordion style={{ width: '400px', margin: '15px', backgroundColor: 'black' }} flush>
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
    title: PropTypes.string,
    content: PropTypes.string,
    user: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      uid: PropTypes.string,
      bio: PropTypes.string,
    }),

    upvotes: PropTypes.number,
    tags: PropTypes.arrayOf(PropTypes.string),
  }),
};

ViewPost.defaultProps = {
  postDetails: initialState,
};
