import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Button, FloatingLabel, Form } from 'react-bootstrap';
import { useAuth } from '../../utils/context/authContext';
import { createTag, getTags, updateTag } from '../../api/tagData';

const initialState = {
  id: '',
  label: '',
  joke: '',
  user: '',
  created_on: '',
};

export default function TagForm({ obj, tagPostId, onSubmit }) {
  const [formInput, setFormInput] = useState(initialState);
  const [tags, setTags] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (obj.id) {
      setFormInput(obj);
    } else {
      initialState.joke = tagPostId;
      setFormInput(initialState);
    }
  }, [obj, tagPostId]);

  useEffect(() => {
    getTags(setTags);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormInput((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (obj.id) {
      const updatedTag = {
        id: obj.id,
        user: obj.user,
        label: formInput.label,
        created_on: obj.created_on,
        joke: obj.joke,
      };
      updateTag(updatedTag).then(onSubmit);
    } else {
      const payload = {
        user: user.id,
        label: formInput.label,
        joke: tagPostId,
      };
      createTag(user.id, tagPostId, payload).then(() => {
        setFormInput(initialState);
        onSubmit();
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h4 className="text-white mt-5">{obj.id ? 'Update' : 'Add'} Tag</h4>
      <p>{tags}</p>
      <FloatingLabel controlId="floatingTextarea" label="Create a new tag" className="mb-3">
        <Form.Control
          as="textarea"
          placeholder="Create a new tag"
          style={{ height: '200px', width: '400px' }}
          name="label"
          value={formInput.label}
          onChange={handleChange}
          required
        />

        <Button type="submit">{obj.id ? 'Update' : 'Add'} Tag</Button>
      </FloatingLabel>

    </Form>
  );
}

TagForm.propTypes = {
  obj: PropTypes.shape({
    id: PropTypes.number,
    user: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      uid: PropTypes.string,
      bio: PropTypes.string,
    }),
    label: PropTypes.string,
    joke: PropTypes.string,
    created_on: PropTypes.string,
  }),
  tagPostId: PropTypes.number.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

TagForm.defaultProps = {
  obj: initialState,
};
