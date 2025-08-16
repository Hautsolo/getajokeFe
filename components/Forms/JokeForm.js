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
    console.log('=== JOKE FORM MOUNTED ===');
    console.log('Current user:', user);
    console.log('Joke object:', obj);
    
    const prevTags = [];
    if (obj?.firebaseKey) {
      if (obj.tags && Array.isArray(obj.tags)) {
        obj.tags.forEach((tag) => {
          if (typeof tag === 'string') {
            // If tags are stored as strings
            prevTags.push({ value: tag, label: tag });
          } else if (tag.firebaseKey) {
            // If tags are objects with firebaseKey
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

    console.log('=== JOKE FORM SUBMIT ===');
    console.log('Current user:', user);
    console.log('User UID:', user?.uid);
    console.log('Form input:', formInput);

    if (!user?.uid) {
      console.error('=== NO USER UID AVAILABLE ===');
      alert('You must be signed in to create a joke!');
      return;
    }

    // Create new tags first
    const createdNewTags = [];
    for (const newTag of newTags) {
      try {
        const tagResponse = await createTag({ label: newTag.label });
        createdNewTags.push(newTag.label); // Store as string for simplicity
      } catch (error) {
        console.error('Error creating tag:', error);
      }
    }

    // Combine existing tag labels with new tag labels
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

    console.log('=== JOKE PAYLOAD ===');
    console.log('Final payload:', payload);
    console.log('UID being set:', payload.uid);
    console.log('Author name being set:', payload.authorName);

    try {
      if (obj?.firebaseKey) {
        payload.firebaseKey = obj.firebaseKey;
        console.log('=== UPDATING EXISTING JOKE ===');
        console.log('Firebase key:', payload.firebaseKey);
        await updateJoke(payload);
      } else {
        console.log('=== CREATING NEW JOKE ===');
        const result = await createJoke(payload);
        console.log('=== JOKE CREATED SUCCESSFULLY ===');
        console.log('Create result:', result);
      }
      router.push('/');
    } catch (error) {
      console.error('=== ERROR SAVING JOKE ===');
      console.error('Error details:', error);
      alert(`Failed to save joke: ${error.message}`);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h2 className="text-white mt-5">{obj?.firebaseKey ? 'Update' : 'Create'} Joke</h2>

      {/* Debug info */}
      <div style={{ background: '#f8f9fa', padding: '10px', margin: '10px 0', fontSize: '12px', color: 'black' }}>
        <strong>Debug Info:</strong><br/>
        User UID: {user?.uid}<br/>
        User Display Name: {user?.displayName}<br/>
        User Email: {user?.email}<br/>
        Is Edit Mode: {obj?.firebaseKey ? 'Yes' : 'No'}<br/>
        Firebase Key: {obj?.firebaseKey || 'N/A'}
      </div>

      {/* TITLE INPUT */}
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

      {/* CONTENT TEXTAREA */}
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
          tags.map((tag) => ({
            value: tag.firebaseKey || tag.label, 
            label: tag.label,
          }))
        }
        placeholder="Select or create tags..."
      />

      {/* SUBMIT BUTTON */}
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
    tags: PropTypes.array,
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
