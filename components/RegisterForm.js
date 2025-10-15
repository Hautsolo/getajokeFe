import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useRouter } from 'next/router';
import { createUser, updateUserProfile } from '../api/userData';
import CustomModal from './CustomModal';

function RegisterForm({ obj, user, updateUser, isEditMode = false }) {
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const router = useRouter();

  useEffect(() => {
    if (user && !obj?.firebaseKey && !isEditMode) {
      setFormData({
        uid: user.uid,
        displayName: user.displayName || '',
        email: user.email || '',
        bio: '',
      });
    } else {
      setFormData({
        uid: obj?.uid || user?.uid || '',
        displayName: obj?.displayName || user?.displayName || '',
        email: obj?.email || user?.email || '',
        bio: obj?.bio || '',
        firebaseKey: obj?.firebaseKey || '',
      });
    }
  }, [obj, user, isEditMode]);

  const showInfoModal = (title, message, type = 'info', onConfirm = null) => {
    setModalConfig({
      title,
      message,
      type,
      showCancel: false,
      onConfirm,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!obj?.firebaseKey && !isEditMode) {
        console.log('Creating new user:', formData);
        await createUser(formData);
        showInfoModal('Success', 'Profile created successfully!', 'success', () => {
          if (updateUser) updateUser(user.uid);
          router.push('/');
        });
      } else {
        console.log('Updating user:', formData);
        const updateData = {
          ...formData,
          firebaseKey: obj?.firebaseKey || formData.firebaseKey
        };

        if (!updateData.firebaseKey) {
          throw new Error('No firebaseKey found for user update');
        }

        await updateUserProfile(updateData);
        showInfoModal('Success', 'Profile updated successfully!', 'success', () => {
          if (updateUser) updateUser();
          router.push('/profile/profile');
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showInfoModal('Error', error.message || 'Failed to save profile. Please try again.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center mt-5">Please sign in to continue.</div>;
  }

  return (
    <>
      <div className="container" style={{ maxWidth: '500px' }}>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="displayName">
            <Form.Label>Display Name *</Form.Label>
            <Form.Control
              name="displayName"
              required
              placeholder="Enter your display name"
              onChange={handleChange}
              value={formData.displayName || ''}
              style={{ color: 'black' }}
            />
            <Form.Text className="text-muted">
              This is how your name will appear on jokes and comments.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              name="email"
              type="email"
              placeholder="Enter your email"
              onChange={handleChange}
              value={formData.email || ''}
              style={{ color: 'black' }}
              disabled
            />
            <Form.Text className="text-muted">
              Email is managed by your Google account and cannot be changed here.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="bio">
            <Form.Label>Bio</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="bio"
              placeholder="Tell us a bit about yourself (optional)"
              onChange={handleChange}
              value={formData.bio || ''}
              style={{ color: 'black' }}
              maxLength={500}
            />
            <Form.Text className="text-muted">
              {formData.bio ? formData.bio.length : 0}/500 characters
            </Form.Text>
          </Form.Group>

          <div className="d-flex gap-2">
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (isEditMode ? 'Update Profile' : 'Create Profile')}
            </Button>

            {isEditMode && (
              <Button
                variant="secondary"
                onClick={() => router.push('/profile/profile')}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </Form>
      </div>

      <CustomModal
        show={showModal}
        onHide={() => setShowModal(false)}
        {...modalConfig}
      />
    </>
  );
}

RegisterForm.propTypes = {
  user: PropTypes.shape({
    uid: PropTypes.string.isRequired,
    displayName: PropTypes.string,
    email: PropTypes.string,
  }),
  updateUser: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool,
  obj: PropTypes.shape({
    firebaseKey: PropTypes.string,
    displayName: PropTypes.string,
    uid: PropTypes.string,
    email: PropTypes.string,
    bio: PropTypes.string,
  }),
};

RegisterForm.defaultProps = {
  obj: {
    displayName: '',
    uid: '',
    email: '',
    bio: '',
  },
  user: null,
  isEditMode: false,
};

export default RegisterForm;
