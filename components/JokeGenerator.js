import React, { useState } from 'react';
import { Button, Form, Card, Spinner } from 'react-bootstrap';
import CreatableSelect from 'react-select/creatable';
import { useAuth } from '../utils/context/authContext';
import { createJoke } from '../api/jokeData';
import { createTag } from '../api/tagData';
import CustomModal from './CustomModal';

export default function JokeGenerator() {
  const { user } = useAuth();
  const [generatedJoke, setGeneratedJoke] = useState('');
  const [jokeTitle, setJokeTitle] = useState('');
  const [jokeCategory, setJokeCategory] = useState('Any');
  const [jokeType, setJokeType] = useState('any');
  const [jokeFlags, setJokeFlags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});

  const jokeCategories = [
    'Any', 'Misc', 'Programming', 'Dark', 'Pun', 'Spooky', 'Christmas'
  ];

  const jokeTypes = [
    { value: 'any', label: 'Any Type' },
    { value: 'single', label: 'Single (One-liner)' },
    { value: 'twopart', label: 'Two-part (Setup & Delivery)' }
  ];

  const availableFlags = [
    { value: 'nsfw', label: 'NSFW' },
    { value: 'religious', label: 'Religious' },
    { value: 'political', label: 'Political' },
    { value: 'racist', label: 'Racist' },
    { value: 'sexist', label: 'Sexist' },
    { value: 'explicit', label: 'Explicit' }
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

    try {
      // Build API URL
      let url = 'https://v2.jokeapi.dev/joke/';
      
      // Add category
      url += jokeCategory === 'Any' ? 'Any' : jokeCategory;
      
      // Add parameters
      const params = [];
      
      // Add type filter
      if (jokeType !== 'any') {
        params.push(`type=${jokeType}`);
      }
      
      // Add content filtering
      if (jokeFlags.length > 0) {
        const allFlags = ['nsfw', 'religious', 'political', 'racist', 'sexist', 'explicit'];
        const flagsToBlacklist = allFlags.filter(flag => !jokeFlags.includes(flag));
        if (flagsToBlacklist.length > 0) {
          params.push(`blacklistFlags=${flagsToBlacklist.join(',')}`);
        }
      } else {
        // If no flags selected, use safe mode
        params.push('safe-mode');
      }
      
      if (params.length > 0) {
        url += '?' + params.join('&');
      }

      console.log('Fetching joke from:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || 'Failed to fetch joke');
      }

      // Handle different joke types
      let jokeContent = '';
      let autoTitle = '';

      if (data.type === 'single') {
        jokeContent = data.joke;
        autoTitle = `${data.category} Joke`;
      } else if (data.type === 'twopart') {
        jokeContent = `${data.setup}\n\n${data.delivery}`;
        autoTitle = `${data.category} Two-Part Joke`;
      } else {
        throw new Error('Unknown joke format received');
      }

      setGeneratedJoke(jokeContent);
      setJokeTitle(autoTitle);
      
    } catch (error) {
      console.error('Error generating joke:', error);
      setError(error.message || 'Failed to generate joke. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostJoke = async () => {
    console.log('=== JOKE GENERATOR POST ===');
    console.log('Current user:', user);
    console.log('User UID:', user?.uid);
    console.log('Generated joke:', generatedJoke);

    if (!generatedJoke.trim()) {
      showInfoModal('No Joke Selected', 'Please generate a joke first before posting!', 'warning');
      return;
    }

    if (!user?.uid) {
      console.error('=== NO USER UID IN GENERATOR ===');
      showInfoModal('Sign In Required', 'Please sign in to post jokes!', 'warning');
      return;
    }

    setIsLoading(true);

    try {
      // Create any new tags first
      const createdTags = [];
      for (const flag of jokeFlags) {
        try {
          await createTag({ label: flag });
          createdTags.push(flag);
        } catch (error) {
          console.log(`Tag ${flag} might already exist:`, error);
          createdTags.push(flag); // Add anyway
        }
      }

      const payload = {
        title: jokeTitle || 'Generated Joke',
        content: generatedJoke,
        uid: user.uid,
        authorName: user.displayName || user.email || 'Unknown User',
        tags: [...createdTags, jokeCategory !== 'Any' ? jokeCategory : ''].filter(Boolean),
        upvotes: 0,
        upvoters: [],
        dateCreated: new Date().toISOString(),
      };

      console.log('=== GENERATOR JOKE PAYLOAD ===');
      console.log('Final payload:', payload);
      console.log('UID being set:', payload.uid);
      console.log('Author name being set:', payload.authorName);

      const result = await createJoke(payload);
      console.log('=== GENERATOR JOKE CREATED ===');
      console.log('Create result:', result);
      
      showInfoModal('Success', '🎉 Joke posted successfully to your collection!', 'success');
      
      // Reset form
      setGeneratedJoke('');
      setJokeTitle('');
      setJokeCategory('Any');
      setJokeType('any');
      setJokeFlags([]);
      
    } catch (error) {
      console.error('=== ERROR POSTING GENERATOR JOKE ===');
      console.error('Error details:', error);
      showInfoModal('Error', `Failed to post joke: ${error.message}`, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  console.log('=== JOKE GENERATOR RENDER ===');
  console.log('Current user:', user);
  console.log('User UID:', user?.uid);

  return (
    <>
      <div className="container mt-4">
        <h2 className="text-center mb-4">🎭 Joke Generator</h2>

        {/* Debug info */}
        <div style={{ background: '#f8f9fa', padding: '10px', margin: '10px 0', fontSize: '12px', color: 'black' }}>
          <strong>Debug Info:</strong><br/>
          User UID: {user?.uid}<br/>
          User Display Name: {user?.displayName}<br/>
          User Email: {user?.email}<br/>
          User Signed In: {user ? 'Yes' : 'No'}<br/>
        </div>

        <Card className="mb-4">
          <Card.Body>
            <h5>Customize Your Joke</h5>
            
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select 
                value={jokeCategory} 
                onChange={(e) => setJokeCategory(e.target.value)}
                style={{ color: 'black' }}
              >
                {jokeCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Joke Type</Form.Label>
              <Form.Select 
                value={jokeType} 
                onChange={(e) => setJokeType(e.target.value)}
                style={{ color: 'black' }}
              >
                {jokeTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Content Flags (Include these types)</Form.Label>
              <CreatableSelect
                isMulti
                value={jokeFlags.map(flag => ({ value: flag, label: flag }))}
                options={availableFlags}
                onChange={(selected) => setJokeFlags(selected.map(item => item.value))}
                placeholder="Select content types to include..."
                className="text-dark"
              />
              <Form.Text className="text-muted">
                Select content types you want to include. Leave empty for safe content only.
              </Form.Text>
            </Form.Group>

            <Button 
              variant="primary" 
              onClick={generateJoke}
              disabled={isLoading}
              className="w-100"
            >
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Generating...
                </>
              ) : (
                '🎲 Generate Joke'
              )}
            </Button>
          </Card.Body>
        </Card>

        {error && (
          <div className="alert alert-danger">
            <strong>Error:</strong> {error}
          </div>
        )}

        {generatedJoke && (
          <Card className="mb-4">
            <Card.Body>
              <h5>Generated Joke</h5>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={jokeTitle}
                  onChange={(e) => setJokeTitle(e.target.value)}
                  placeholder="Enter a title for your joke"
                  style={{ color: 'black' }}
                />
              </Form.Group>
              
              <Card.Text 
                style={{ 
                  fontSize: '18px', 
                  whiteSpace: 'pre-wrap',
                  backgroundColor: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '5px',
                  border: '1px solid #dee2e6'
                }}
              >
                {generatedJoke}
              </Card.Text>
              
              <div className="d-flex gap-2 justify-content-center">
                <Button 
                  variant="success" 
                  onClick={handlePostJoke}
                  disabled={isLoading}
                >
                  {isLoading ? 'Posting...' : '📝 Post This Joke'}
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={generateJoke}
                  disabled={isLoading}
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
