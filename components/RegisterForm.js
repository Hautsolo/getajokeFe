import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useRouter } from 'next/router';
import { createUser, updateUserProfile } from '../api/userData'; // Ensure these functions are correctly implemented

function RegisterForm({ obj, user, updateUser }) {
  const [formData, setFormData] = useState({});
  const router = useRouter();

  useEffect(() => {
    if (user && !obj.id) {
      setFormData({
        bio: '',
        uid: user.uid,
        name: '',
        username: '',
      });
    } else {
      setFormData({ ...obj });
    }
  }, [obj, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!obj.id) {
        await createUser(formData);
        updateUser(user.uid);
        router.push('/');
      } else {
        await updateUserProfile(formData);
        router.push(`/profile/${obj.uid}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle error, possibly show a user-friendly message
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="name">
        <Form.Label>Name</Form.Label>
        <Form.Control
          name="name"
          required
          placeholder="Enter your Name"
          onChange={handleChange}
          value={formData.name || ''}
          style={{ color: 'black' }} // Ensures text is visible
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="username">
        <Form.Label>Username</Form.Label>
        <Form.Control
          name="username"
          required
          placeholder="Enter your Username"
          onChange={handleChange}
          value={formData.username || ''}
          style={{ color: 'black' }} // Ensures text is visible
        />
      </Form.Group>
      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  );
}

RegisterForm.propTypes = {
  user: PropTypes.shape({
    uid: PropTypes.string.isRequired,
  }),
  updateUser: PropTypes.func.isRequired,
  obj: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    uid: PropTypes.string,
    username: PropTypes.string,
  }),
};

RegisterForm.defaultProps = {
  obj: {
    name: '',
    uid: '',
    username: '',
  },
  user: null,
};

export default RegisterForm;
