import React, { useState, useEffect } from 'react';
import { Button, Form, FloatingLabel } from 'react-bootstrap';
import CreatableSelect from 'react-select/creatable';
import { useAuth } from '../utils/context/authContext';
import { createJoke } from '../api/jokeData';
import { getTags } from '../api/tagData';

const JokeGenerator = () => {
  const [jokeType, setJokeType] = useState('');
  const [joke, setJoke] = useState('');
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTags, setNewTags] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    getTags().then(setTags);
  }, []);

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

  const handlePostJoke = async () => {
    const tagIds = selectedTags.map((tag) => tag.value);
    const newTagLabels = newTags.map((tag) => tag.label);

    const payload = {
      content: joke,
      uid: user.uid,
      tags: tagIds,
      newTags: newTagLabels,
    };

    try {
      await createJoke(payload);
      setJoke(''); // Clear the joke
      setSelectedTags([]);
      setNewTags([]);
    } catch (error) {
      console.error('Failed to post joke:', error);
    }
  };

  return (
    <div className="container text-center mt-5">
      <h1>AI Joke Generator</h1>
      <Form>
        <FloatingLabel controlId="floatingJokeType" label="Joke Type" className="mb-3">
          <Form.Control
            type="text"
            placeholder="Enter joke type (e.g., Programming, Misc, Dark, Pun, Spooky, Christmas)"
            value={jokeType}
            onChange={(e) => setJokeType(e.target.value)}
          />
        </FloatingLabel>

        <Button className="btnjoke mb-3" onClick={generateJoke}>
          Generate Joke
        </Button>

        <FloatingLabel controlId="floatingJokeContent" label="Generated Joke" className="mb-3">
          <Form.Control
            as="textarea"
            placeholder="Generated joke"
            style={{ height: '100px' }}
            value={joke}
            readOnly
          />
        </FloatingLabel>

        <CreatableSelect
          aria-label="tags"
          name="tags"
          className="mb-3"
          value={[...selectedTags, ...newTags]}
          isMulti
          onChange={handleTagChange}
          options={tags.map((tag) => ({
            value: tag.id, label: tag.label,
          }))}
        />

        <Button className="btn-post-joke" onClick={handlePostJoke}>
          Post Joke
        </Button>
      </Form>
    </div>
  );
};

export default JokeGenerator;

// import React, { useState } from 'react';
// import { Button, Form, FloatingLabel } from 'react-bootstrap';
// // import CreatableSelect from 'react-select/creatable';
// // import { useAuth } from '../utils/context/authContext';
// // import { createJoke } from '../api/jokeData';
// // import { getTags } from '../api/tagData';

// const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
// const API_KEY = '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'; // Replace with your actual API key

// const AIJokeGenerator = () => {
//   const [topic, setTopic] = useState('');
//   const [joke, setJoke] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');

//   const generateJoke = async () => {
//     setIsLoading(true);
//     setError('');
//     setJoke('');

//     try {
//       const response = await fetch(API_ENDPOINT, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${API_KEY}`,
//         },
//         body: JSON.stringify({
//           model: 'gpt-3.5-turbo',
//           messages: [
//             { role: 'system', content: 'You are a funny joke generator. Generate a short, clever joke based on the given topic.' },
//             { role: 'user', content: `Generate a joke about ${topic}` },
//           ],
//           max_tokens: 100,
//         }),
//       });

//       if (response.status === 429) {
//         throw new Error('Rate limit exceeded. Please try again in a few moments.');
//       }

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       if (data.choices && data.choices.length > 0) {
//         setJoke(data.choices[0].message.content.trim());
//       } else {
//         throw new Error('No joke was generated. Please try again.');
//       }
//     } catch (error) {
//       if (error.message.includes('Rate limit exceeded')) {
//         setError('Oops! Were generating too many jokes too quickly. Please wait a moment and try again.');
//       } else {
//         setError(error.message || 'An error occurred while generating the joke. Please try again.');
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="container max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
//       <h1 className="text-2xl font-bold mb-4 text-center">AI Joke Generator</h1>
//       <Form onSubmit={(e) => { e.preventDefault(); generateJoke(); }}>
//         <FloatingLabel controlId="floatingTopic" label="Joke Topic" className="mb-3">
//           <Form.Control
//             type="text"
//             placeholder="Enter a topic for the joke"
//             value={topic}
//             onChange={(e) => setTopic(e.target.value)}
//             className="w-full p-2 border rounded"
//           />
//         </FloatingLabel>

//         <Button
//           type="submit"
//           className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-300"
//           disabled={isLoading || !topic.trim()}
//         >
//           {isLoading ? 'Generating...' : 'Generate Joke'}
//         </Button>
//       </Form>

//       {error && (
//         <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
//           <p>{error}</p>
//         </div>
//       )}

//       {joke && (
//         <div className="mt-4 p-4 bg-gray-100 rounded">
//           <h2 className="text-xl font-semibold mb-2">Generated Joke:</h2>
//           <p>{joke}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AIJokeGenerator;

// import React, { useState } from 'react';
// import { Button, Form, FloatingLabel } from 'react-bootstrap';

// const API_ENDPOINT = 'https://api-inference.huggingface.co/models/bigscience/bloomz';
// const API_TOKEN = process.env.NEXT_PUBLIC_HUGGINGFACE_API_TOKEN;

// const AIJokeGenerator = () => {
//   const [topic, setTopic] = useState('');
//   const [joke, setJoke] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');

//   const generateJoke = async () => {
//     setIsLoading(true);
//     setError('');
//     setJoke('');

//     try {
//       if (!API_TOKEN) {
//         throw new Error('API token is not set. Please check your environment variables.');
//       }

//       const response = await fetch(API_ENDPOINT, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${API_TOKEN}`,
//         },
//         body: JSON.stringify({
//           inputs: `Generate a short, funny, and family-friendly joke about ${topic}. The joke should be no more than two sentences long:`,
//           parameters: {
//             max_new_tokens: 50,
//             temperature: 0.7,
//             top_p: 0.95,
//             do_sample: true,
//           },
//         }),
//       });

//       if (!response.ok) {
//         if (response.status === 401) {
//           throw new Error('Invalid API token. Please check your Hugging Face API token.');
//         }
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       if (data && data[0] && data[0].generated_text) {
//         const generatedJoke = data[0].generated_text.trim();
//         if (isAppropriate(generatedJoke)) {
//           setJoke(generatedJoke);
//         } else {
//           throw new Error('The generated content was not appropriate. Please try again with a different topic.');
//         }
//       } else {
//         throw new Error('No joke was generated. Please try again.');
//       }
//     } catch (error) {
//       setError(error.message || 'An error occurred while generating the joke. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const isAppropriate = (text) => {
//     const inappropriateWords = ['nsfw', 'explicit', 'adult', 'offensive'];
//     return !inappropriateWords.some(word => text.toLowerCase().includes(word));
//   };

//   return (
//     <div className="container max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
//       <h1 className="text-2xl font-bold mb-4 text-center">AI Joke Generator</h1>
//       <Form onSubmit={(e) => { e.preventDefault(); generateJoke(); }}>
//         <FloatingLabel controlId="floatingTopic" label="Joke Topic" className="mb-3">
//           <Form.Control
//             type="text"
//             placeholder="Enter a family-friendly topic for the joke"
//             value={topic}
//             onChange={(e) => setTopic(e.target.value)}
//             className="w-full p-2 border rounded"
//           />
//         </FloatingLabel>

//         <Button
//           type="submit"
//           className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-300"
//           disabled={isLoading || !topic.trim()}
//         >
//           {isLoading ? 'Generating...' : 'Generate Joke'}
//         </Button>
//       </Form>

//       {error && (
//         <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
//           <p>{error}</p>
//         </div>
//       )}

//       {joke && (
//         <div className="mt-4 p-4 bg-gray-100 rounded">
//           <h2 className="text-xl font-semibold mb-2">Generated Joke:</h2>
//           <p>{joke}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AIJokeGenerator;
