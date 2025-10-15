import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Button, FloatingLabel, Form } from 'react-bootstrap';
import { useAuth } from '../../utils/context/authContext';
import { createComment, updateComment } from '../../api/commentData';

const initialState = {
  content: '',
  uid: '',
  author: '',
  dateCreated: '',
};

export default function CommentForm({
  obj, jokeFirebaseKey, onSubmit,
}) {
  const [formInput, setFormInput] = useState(initialState);
  const { user } = useAuth();

  useEffect(() => {
    if (obj?.firebaseKey) {
      setFormInput(obj);
    } else {
      setFormInput({
        ...initialState,
        uid: user?.uid || '',
        author: user?.displayName || '',
      });
    }
  }, [obj, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormInput((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (obj?.firebaseKey) {
      const updatedComment = {
        ...formInput,
        firebaseKey: obj.firebaseKey,
      };
      updateComment(jokeFirebaseKey, obj.firebaseKey, updatedComment).then(() => {
        onSubmit();
      });
    } else {
      const payload = {
        content: formInput.content,
        uid: user.uid,
        authorName: user.displayName || user.email || 'Unknown User',
        dateCreated: new Date().toISOString(),
      };

      createComment(jokeFirebaseKey, payload).then(() => {
        setFormInput({
          ...initialState,
          uid: user?.uid || '',
          author: user?.displayName || '',
        });
        onSubmit();
      });
    }
  };

  return (
    <Form
      style={{
        width: '400px',
        display: 'flex',
      }}
      onSubmit={handleSubmit}
    >
      <FloatingLabel
        controlId="floatingTextarea"
        label={obj?.firebaseKey ? 'Update your comment' : 'Enter your comment'}
        className="mb-3"
      >
        <Form.Control
          as="textarea"
          placeholder={obj?.firebaseKey ? 'Update your comment' : 'Enter your comment'}
          style={{ height: '100px', width: '360px' }}
          name="content"
          value={formInput.content}
          onChange={handleChange}
          required
        />

        <Button
          style={{ marginTop: '10px' }}
          type="submit"
        >
          {obj?.firebaseKey ? 'Update' : 'Add'} Comment
        </Button>
      </FloatingLabel>
    </Form>
  );
}

CommentForm.propTypes = {
  obj: PropTypes.shape({
    firebaseKey: PropTypes.string,
    content: PropTypes.string,
    uid: PropTypes.string,
    author: PropTypes.string,
    dateCreated: PropTypes.string,
  }),
  jokeFirebaseKey: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

CommentForm.defaultProps = {
  obj: initialState,
};
