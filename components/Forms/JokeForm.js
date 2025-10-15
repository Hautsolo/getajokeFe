import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Button, FloatingLabel, Form } from 'react-bootstrap';
import CreatableSelect from 'react-select/creatable';
import { useAuth } from '../../utils/context/authContext';
import { createJoke, updateJoke } from '../../api/jokeData';
import { getTags, createTag } from '../../api/tagData';

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
    if (obj?.firebaseKey) {
      if (obj.tags && Array.isArray(obj.tags)) {
        obj.tags.forEach((tag) => {
          if (typeof tag === 'string') {
            prevTags.push({ value: tag, label: tag });
          } else if (tag.firebaseKey) {
            prevTags.push({ value: tag.firebaseKey, label: tag.label });
          }
        });
      }
      setSelectedTags(prevTags);
      setFormInput({
        title: obj.title || '',
        content: obj.content || '',
        tags: obj.tags || [],
      });
    }
  }, [obj, user]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.uid) {
      alert('You must be signed in to create a joke!');
      return;
    }

    const createdNewTags = [];
    
    const createTagPromises = newTags.map(async (newTag) => {
      try {
        await createTag({ label: newTag.label });
        return newTag.label;
      } catch (error) {
        console.error('Error creating tag:', error);
        return null;
      }
    });

    const results = await Promise.all(createTagPromises);
    createdNewTags.push(...results.filter(Boolean));

    const allTagLabels = [
      ...selectedTags.map((tag) => tag.label),
      ...createdNewTags,
    ];

    const payload = {
      ...formInput,
      uid: user.uid,
      authorName: user.displayName || user.email || 'Unknown User',
      tags: allTagLabels,
      upvotes: obj?.upvotes || 0,
      upvoters: obj?.upvoters || [],
      dateCreated: obj?.dateCreated || new Date().toISOString(),
    };

    try {
      if (obj?.firebaseKey) {
        payload.firebaseKey = obj.firebaseKey;
        await updateJoke(payload);
      } else {
        await createJoke(payload);
      }
      router.push('/');
    } catch (error) {
      alert(`Failed to save joke: ${error.message}`);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h2 className="text-white mt-5">{obj?.firebaseKey ? 'Update' : 'Create'} Joke</h2>

      <FloatingLabel controlId="floatingInput1" label="Title" className="mb-3">
        <Form.Control
          type="text"
          placeholder="Enter a title"
          name="title"
          value={formInput.title}
          onChange={handleChange}
          required
        />
      </FloatingLabel>

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

      <CreatableSelect
        aria-label="tags"
        name="tags"
        className="mb-3"
        value={[...selectedTags, ...newTags]}
        isMulti
        onChange={handleTagChange}
        options={
          tags.map((tag) => ({
            value: tag.firebaseKey || tag.label,
            label: tag.label,
          }))
        }
        placeholder="Select or create tags..."
      />

      <Button type="submit">{obj?.firebaseKey ? 'Update' : 'Create'} Joke</Button>
    </Form>
  );
}

JokeForm.propTypes = {
  obj: PropTypes.shape({
    firebaseKey: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.string,
    uid: PropTypes.string,
    upvotes: PropTypes.number,
    tags: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
    dateCreated: PropTypes.string,
  }),
};

JokeForm.defaultProps = {
  obj: {
    firebaseKey: null,
    title: '',
    content: '',
    uid: '',
    upvotes: 0,
    tags: [],
    dateCreated: null,
  },
};
