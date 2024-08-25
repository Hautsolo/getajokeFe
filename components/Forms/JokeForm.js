import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Button, FloatingLabel, Form } from 'react-bootstrap';
import CreatableSelect from 'react-select/creatable';
import { useAuth } from '../../utils/context/authContext';
import { createJoke, updateJoke } from '../../api/jokeData';
import { getTags } from '../../api/tagData';

const initialState = {
  title: '',
  content: '',
  tags: [],
};

export default function JokeForm({ obj }) {
  const [formInput, setFormInput] = useState(initialState);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTags, setNewTags] = useState([]);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const prevTags = [];
    if (obj?.id) {
      obj.tags.forEach((tag) => {
        prevTags.push({ value: tag.id, label: tag.label });
      });
      setSelectedTags(prevTags);
      setFormInput({
        title: obj.title || '',
        content: obj.content || '',
        tags: obj.tags || [],
      });
    }
  }, [obj]);

  useEffect(() => {
    getTags().then(setTags);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormInput((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleTagChange = (selectedOption) => {
    const newTagArray = [];
    const tagArray = [];
    selectedOption.forEach((option) => {
      if (option.__isNew__) {
        newTagArray.push({ value: option.value, label: option.label });
      } else {
        tagArray.push({ value: option.value, label: option.label });
      }
    });
    setSelectedTags(tagArray);
    setNewTags(newTagArray);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const tagIds = selectedTags.map((tag) => tag.value);
    const newTagLabels = newTags.map((tag) => tag.value);

    const payload = {
      ...formInput,
      uid: user.uid,
      tags: tagIds,
      newTags: newTagLabels,
    };

    if (obj?.id) {
      updateJoke(payload).then(() => router.push('/'));
    } else {
      createJoke(payload).then(() => router.push('/'));
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h2 className="text-white mt-5">{obj.id ? 'Update' : 'Create'} Post</h2>

      {/* TITLE INPUT */}
      <FloatingLabel controlId="floatingInput1" label="Post Title" className="mb-3">
        <Form.Control
          type="text"
          placeholder="Enter a title"
          name="title"
          value={formInput.title}
          onChange={handleChange}
          required
        />
      </FloatingLabel>

      {/* DESCRIPTION TEXTAREA */}
      <FloatingLabel controlId="floatingTextarea" label="Content" className="mb-3">
        <Form.Control
          as="textarea"
          placeholder="Content"
          style={{ height: '100px' }}
          name="content"
          value={formInput.content}
          onChange={handleChange}
          required
        />
      </FloatingLabel>

      {/* TAG SELECT */}
      <CreatableSelect
        aria-label="tags"
        name="tags"
        className="mb-3"
        value={[...selectedTags, ...newTags]}
        isMulti
        onChange={handleTagChange}
        options={
          tags.map((tag) => (
            {
              value: parseInt(tag.id, 10), label: tag.label,
            }
          ))
        }
      />

      {/* SUBMIT BUTTON */}
      <Button type="submit">{obj.id ? 'Update' : 'Create'} Post</Button>
    </Form>
  );
}

JokeForm.propTypes = {
  obj: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    content: PropTypes.string,
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
  }),
};

JokeForm.defaultProps = {
  obj: initialState,
};
