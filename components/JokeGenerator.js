import React, { useState } from 'react';
import {
  Button, Form, Card, Spinner, Badge,
} from 'react-bootstrap';
import { useAuth } from '../utils/context/authContext';
import { createJoke } from '../api/jokeData';
import { createTag } from '../api/tagData';
import CustomModal from './CustomModal';

export default function JokeGenerator() {
  const { user } = useAuth();
  const [generatedJoke, setGeneratedJoke] = useState('');
  const [jokeTitle, setJokeTitle] = useState('');
  const [jokeCategory, setJokeCategory] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [jokeSource, setJokeSource] = useState('');

  const jokeCategories = [
    { value: 'general', label: '😄 General', description: 'Clean, family-friendly jokes' },
    { value: 'programming', label: '💻 Programming', description: 'Tech and coding humor' },
    { value: 'pun', label: '🎭 Puns', description: 'Wordplay and puns' },
    { value: 'dad', label: '👨 Dad Jokes', description: 'Classic dad humor' },
    { value: 'knock-knock', label: '🚪 Knock Knock', description: 'Traditional knock-knock jokes' },
    { value: 'one-liner', label: '⚡ One-liners', description: 'Quick witty jokes' },
  ];

  const showInfoModal = (title, message, type = 'info') => {
    setModalConfig({
      title,
      message,
      type,
      showCancel: false,
    });
    setShowModal(true);
  };

  const generateJoke = async () => {
    setIsLoading(true);
    setError('');
    setGeneratedJoke('');
    setJokeSource('');

    try {
      let jokeContent = '';
      let autoTitle = '';
      let source = '';

      // Use different APIs based on category for better, cleaner jokes
      if (jokeCategory === 'dad') {
        // Dad jokes API
        const response = await fetch('https://icanhazdadjoke.com/', {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'Joke Generator App',
          },
        });

        if (!response.ok) throw new Error('Dad joke API failed');

        const data = await response.json();
        jokeContent = data.joke;
        autoTitle = '👨 Dad Joke';
        source = 'icanhazdadjoke.com';
      } else if (jokeCategory === 'programming') {
        // Programming jokes from JokeAPI (safe mode only)
        const response = await fetch('https://v2.jokeapi.dev/joke/Programming?safe-mode');

        if (!response.ok) throw new Error('Programming joke API failed');

        const data = await response.json();
        if (data.error) throw new Error(data.message);

        if (data.type === 'single') {
          jokeContent = data.joke;
        } else {
          jokeContent = `${data.setup}\n\n${data.delivery}`;
        }
        autoTitle = '💻 Programming Joke';
        source = 'jokeapi.dev';
      } else if (jokeCategory === 'pun') {
        // Pun jokes from JokeAPI (safe mode only)
        const response = await fetch('https://v2.jokeapi.dev/joke/Pun?safe-mode');

        if (!response.ok) throw new Error('Pun joke API failed');

        const data = await response.json();
        if (data.error) throw new Error(data.message);

        if (data.type === 'single') {
          jokeContent = data.joke;
        } else {
          jokeContent = `${data.setup}\n\n${data.delivery}`;
        }
        autoTitle = '🎭 Pun Joke';
        source = 'jokeapi.dev';
      } else if (jokeCategory === 'knock-knock') {
        // Curated knock-knock jokes
        const knockKnockJokes = [
          'Knock knock!\nWho\'s there?\nInterrupting cow.\nInterrupting cow w—\nMOO!',
          'Knock knock!\nWho\'s there?\nBoo.\nBoo who?\nDon\'t cry, it\'s just a joke!',
          'Knock knock!\nWho\'s there?\nLettuce.\nLettuce who?\nLettuce in, it\'s cold out here!',
          'Knock knock!\nWho\'s there?\nOrange.\nOrange who?\nOrange you glad I didn\'t say banana?',
          'Knock knock!\nWho\'s there?\nTank.\nTank who?\nYou\'re welcome!',
          'Knock knock!\nWho\'s there?\nCanoe.\nCanoe who?\nCanoe help me with my homework?',
          'Knock knock!\nWho\'s there?\nDonut.\nDonut who?\nDonut ask me that question!',
          'Knock knock!\nWho\'s there?\nCows go.\nCows go who?\nNo, cows go moo!',
          'Knock knock!\nWho\'s there?\nHatch.\nHatch who?\nBless you!',
          'Knock knock!\nWho\'s there?\nWho.\nWho who?\nAre you an owl?',
        ];

        jokeContent = knockKnockJokes[Math.floor(Math.random() * knockKnockJokes.length)];
        autoTitle = '🚪 Knock Knock Joke';
        source = 'curated collection';
      } else if (jokeCategory === 'one-liner') {
        // One-liner jokes
        const oneLinerJokes = [
          'I told my wife she was drawing her eyebrows too high. She looked surprised.',
          'I\'m reading a book about anti-gravity. It\'s impossible to put down!',
          'Did you hear about the mathematician who\'s afraid of negative numbers? He\'ll stop at nothing to avoid them.',
          'I used to hate facial hair, but then it grew on me.',
          'Why don\'t scientists trust atoms? Because they make up everything!',
          'I\'m terrified of elevators, so I\'m going to start taking steps to avoid them.',
          'What do you call a fake noodle? An impasta!',
          'I only know 25 letters of the alphabet. I don\'t know y.',
          'What\'s the best thing about Switzerland? I don\'t know, but the flag is a big plus.',
          'I invented a new word: Plagiarism!',
          'Why did the scarecrow win an award? He was outstanding in his field!',
          'Parallel lines have so much in common. It\'s a shame they\'ll never meet.',
        ];

        jokeContent = oneLinerJokes[Math.floor(Math.random() * oneLinerJokes.length)];
        autoTitle = '⚡ One-liner Joke';
        source = 'curated collection';
      } else {
        // General clean jokes from JokeAPI (safe mode only)
        const response = await fetch('https://v2.jokeapi.dev/joke/Misc?safe-mode');

        if (!response.ok) throw new Error('General joke API failed');

        const data = await response.json();
        if (data.error) throw new Error(data.message);

        if (data.type === 'single') {
          jokeContent = data.joke;
        } else {
          jokeContent = `${data.setup}\n\n${data.delivery}`;
        }
        autoTitle = '😄 General Joke';
        source = 'jokeapi.dev';
      }

      setGeneratedJoke(jokeContent);
      setJokeTitle(autoTitle);
      setJokeSource(source);
    } catch (err) {
      setError(err.message || 'Failed to generate joke. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostJoke = async () => {
    if (!generatedJoke.trim()) {
      showInfoModal('No Joke Selected', 'Please generate a joke first before posting!', 'warning');
      return;
    }

    if (!user?.uid) {
      showInfoModal('Sign In Required', 'Please sign in to post jokes!', 'warning');
      return;
    }

    setIsLoading(true);

    try {
      // Create category tag
      const categoryLabel = jokeCategories.find((cat) => cat.value === jokeCategory)?.label || jokeCategory;

      try {
        await createTag({ label: categoryLabel });
      } catch (err) {
        // Tag might already exist, that's fine
      }

      const payload = {
        title: jokeTitle || 'Generated Joke',
        content: generatedJoke,
        uid: user.uid,
        authorName: user.displayName || user.email || 'Unknown User',
        tags: [categoryLabel],
        upvotes: 0,
        upvoters: [],
        dateCreated: new Date().toISOString(),
      };

      await createJoke(payload);
      showInfoModal('Success', '🎉 Joke posted successfully to your collection!', 'success');

      // Reset form
      setGeneratedJoke('');
      setJokeTitle('');
      setJokeCategory('general');
      setJokeSource('');
    } catch (err) {
      showInfoModal('Error', `Failed to post joke: ${err.message}`, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="container mt-4">
        <h2 className="text-center mb-4">🎭 Clean Joke Generator</h2>
        <p className="text-center text-muted mb-4">
          Generate family-friendly, clean jokes from various categories
        </p>

        <Card className="mb-4">
          <Card.Body>
            <h5 className="mb-4">Choose Your Joke Style</h5>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Category</Form.Label>
              <Form.Select
                value={jokeCategory}
                onChange={(e) => setJokeCategory(e.target.value)}
                style={{ color: 'black' }}
                className="mb-2"
              >
                {jokeCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                {jokeCategories.find((cat) => cat.value === jokeCategory)?.description}
              </Form.Text>
            </Form.Group>

            <div className="d-grid">
              <Button
                variant="primary"
                size="lg"
                onClick={generateJoke}
                disabled={isLoading}
                className="py-3"
              >
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Generating your joke...
                  </>
                ) : (
                  '🎲 Generate Clean Joke'
                )}
              </Button>
            </div>
          </Card.Body>
        </Card>

        {error && (
          <div className="alert alert-danger mb-4">
            <strong>Oops!</strong>
            {' '}
            {error}
          </div>
        )}

        {generatedJoke && (
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">🎉 Your Generated Joke</h5>
                {jokeSource && (
                  <Badge bg="secondary" className="ms-2">
                    Source:
                    {' '}
                    {jokeSource}
                  </Badge>
                )}
              </div>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Title</Form.Label>
                <Form.Control
                  type="text"
                  value={jokeTitle}
                  onChange={(e) => setJokeTitle(e.target.value)}
                  placeholder="Give your joke a title"
                  style={{ color: 'black' }}
                />
              </Form.Group>

              <Card className="mb-4">
                <Card.Body
                  style={{
                    fontSize: '18px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    backgroundColor: '#f8f9fa',
                    minHeight: '100px',
                  }}
                >
                  {generatedJoke}
                </Card.Body>
              </Card>

              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Button
                  variant="success"
                  size="lg"
                  onClick={handlePostJoke}
                  disabled={isLoading}
                  className="px-4"
                >
                  {isLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Posting...
                    </>
                  ) : (
                    '📝 Post Joke'
                  )}
                </Button>
                <Button
                  variant="outline-primary"
                  size="lg"
                  onClick={generateJoke}
                  disabled={isLoading}
                  className="px-4"
                >
                  🔄 Generate Another
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}
      </div>

      <CustomModal
        show={showModal}
        onHide={() => setShowModal(false)}
        {...modalConfig}
      />
    </>
  );
}
