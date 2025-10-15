import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from 'react-bootstrap';
import Link from 'next/link';
import RegisterForm from '../../../components/RegisterForm';
import { getUserByUid } from '../../../api/userData';
import { useAuth } from '../../../utils/context/authContext';

export default function EditProfile() {
  const router = useRouter();
  const { id } = router.query; // This is the UID of the user to edit
  const { user } = useAuth(); // Current logged-in user
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      if (user?.uid !== id) {
        setError('You can only edit your own profile');
        setIsLoading(false);
        return;
      }

      getUserByUid(id)
        .then((data) => {
          if (data) {
            setUserDetails(data);
          } else {
            setUserDetails({
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
            });
          }
        })
        .catch((err) => {
          console.error('Error fetching user details:', err);
          setUserDetails({
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id, user]);

  const handleUpdateUser = () => {
    if (id) {
      getUserByUid(id).then((data) => {
        setUserDetails(data);
      });
    }
  };

  if (isLoading) {
    return <div className="text-center mt-5">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="text-center mt-5">
        <h3>Access Denied</h3>
        <p>{error}</p>
        <Link href="/profile/profile" passHref>
          <Button variant="primary">Go to Your Profile</Button>
        </Link>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="text-center mt-5">
        <h3>User Not Found</h3>
        <p>Could not load user details for editing.</p>
        <Link href="/profile/profile" passHref>
          <Button variant="primary">Go to Your Profile</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1>Edit Profile</h1>
      <RegisterForm
        obj={userDetails}
        user={userDetails}
        updateUser={handleUpdateUser}
        isEditMode
      />
    </div>
  );
}
