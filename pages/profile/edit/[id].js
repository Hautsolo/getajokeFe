import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import RegisterForm from '../../../components/RegisterForm';
import { getSingleUser } from '../../../api/userData';

export default function EditProfile() {
  const router = useRouter();
  const { id } = router.query; // Get the user ID from the URL
  const [userDetails, setUserDetails] = useState(null); // Initialize as null

  useEffect(() => {
    if (id) {
      getSingleUser(id).then((data) => {
        setUserDetails(data); // Set user details once the data is fetched
      });
    }
  }, [id]);

  // Show a loading state while the data is being fetched
  if (!userDetails) {
    return <div>Loading...</div>;
  }

  // Render the form once the data is available
  return (
    <div>
      <h1>Edit Profile</h1>
      <RegisterForm obj={userDetails} user={userDetails} updateUser={() => { /* Add logic to update the user */ }} />
    </div>
  );
}
