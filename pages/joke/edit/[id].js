import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getSingleJoke } from '../../../api/jokeData';
import JokeForm from '../../../components/Forms/JokeForm';

export default function EditPost() {
  const [editItem, setEditItem] = useState({});
  const router = useRouter();
  // TODO: grab the post ID
  const { id } = router.query;

  // TODO: make a call to the API to get the Post data
  useEffect(() => {
    getSingleJoke(id).then(setEditItem);
  }, [id]);
  // TODO: pass object to form
  return (<JokeForm obj={editItem} />);
}
