import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useRouter } from 'next/router';
import { registerUser } from '../utils/auth';
import { updateUserProfile } from '../api/userData';

function RegisterForm({ obj, user, updateUser }) {
  const [formData, setFormData] = useState({});
  const router = useRouter();

  useEffect(() => {
    if (user && !obj.uid) {
      setFormData({
        bio: '',
        uid: user.uid,
        name: '',
        username: '',
      });
    } else {
      setFormData({ ...obj, id: obj.id });
    }
  }, [obj, user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!obj.id) {
      registerUser(formData).then(() => updateUser(user.uid));
    } else {
      updateUserProfile(formData).then(() => router.push(`/profile/${obj.uid}`));
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="name">
        <Form.Label>name</Form.Label>
        <Form.Control
          as="textarea"
          name="name"
          required
          placeholder="Enter your Name"
          onChange={({ target }) => setFormData((prev) => ({ ...prev, [target.name]: target.value }))}
          value={formData.name}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="name">
        <Form.Label>username</Form.Label>
        <Form.Control
          as="textarea"
          name="username"
          required
          placeholder="Enter your username"
          onChange={({ target }) => setFormData((prev) => ({ ...prev, [target.name]: target.value }))}
          value={formData.username}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBio">
        <Form.Label>bio</Form.Label>
        <Form.Control
          as="textarea"
          name="bio"
          required
          placeholder="Enter your Bio"
          onChange={({ target }) => setFormData((prev) => ({ ...prev, [target.name]: target.value }))}
          value={formData.bio}
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
    uid: PropTypes.string,
  }),
  updateUser: PropTypes.func.isRequired,
  obj: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    bio: PropTypes.string,
    uid: PropTypes.string,
    username: PropTypes.string,
  }),
};

RegisterForm.defaultProps = {
  obj: {
    name: '',
    bio: '',
    uid: '',
    username: '',
  },
  user: null, // Set to null if user is not available
};

export default RegisterForm;
