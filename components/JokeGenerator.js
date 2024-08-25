import React, { useState } from 'react';
import { Button } from 'react-bootstrap';

const JokeGenerator = () => {
  const [jokeType, setJokeType] = useState('');
  const [joke, setJoke] = useState('');

  const generateJoke = async () => {
    const validCategories = ['Programming', 'Misc', 'Dark', 'Pun', 'Spooky', 'Christmas'];
    const category = validCategories.includes(jokeType) ? jokeType : 'Any';

    try {
      const response = await fetch(`https://v2.jokeapi.dev/joke/${category}?type=single`);
      const data = await response.json();
      setJoke(data.joke || 'No joke found for this type.');
    } catch (error) {
      setJoke('Failed to fetch joke.');
    }
  };

  return (
    <div className="container text-center mt-5">
      <h1>AI Joke Generator</h1>
      <input
        type="text"
        className="form-control my-3"
        placeholder="Enter joke type (e.g., Programming, Misc, Dark, Pun, Spooky, Christmas)"
        value={jokeType}
        onChange={(e) => setJokeType(e.target.value)}
      />
      <Button className="btnjoke" onClick={generateJoke}>
        Generate Joke
      </Button>
      <p className="mt-3">{joke}</p>
    </div>
  );
};

export default JokeGenerator;
