import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const messageListener = (message: any) => {
      if (message.type === 'bioData') {
        setBio(message.bio);
        setError(''); // Clear any previous errors
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // Request bio data from content script when popup opens
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab && activeTab.id) {
        // Check if we are on a Tinder page before sending the message
        if (activeTab.url && activeTab.url.includes('tinder.com')) {
          chrome.tabs.sendMessage(activeTab.id, { type: 'requestBio' }, (response) => {
            if (chrome.runtime.lastError) {
              // This error occurs if the content script is not yet injected
              setError('Could not connect to the page. Please refresh the Tinder page and try again.');
            }
          });
        } else {
          setError('This extension only works on Tinder.com.');
        }
      } else {
        setError('Could not connect to the active tab.');
      }
    });

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>IntelliSwipe Advisor</h1>
      </header>

      <main>
        <h2>Extracted Bio:</h2>
        <div className="bio-container">
          {error ? (
            <p className="error-message">{error}</p>
          ) : bio ? (
            <p>{bio}</p>
          ) : (
            <p className="loading-message">No bio found on this profile. Swipe to the next person to load their bio.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
