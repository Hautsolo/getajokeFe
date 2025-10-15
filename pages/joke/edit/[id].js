import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getSingleJoke } from '../../../api/jokeData';
import JokeForm from '../../../components/Forms/JokeForm';

export default function EditPost() {
  const [editItem, setEditItem] = useState({});
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    getSingleJoke(id).then(setEditItem);
  }, [id]);

  return (<JokeForm obj={editItem} />);
}
