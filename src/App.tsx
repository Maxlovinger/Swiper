import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [bios, setBios] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Request bios from background script when popup opens
    chrome.runtime.sendMessage({ type: 'requestLatestBios' }, (response) => {
      if (chrome.runtime.lastError) {
        setError('Error connecting to background script.');
        return;
      }
      if (response && response.bios) {
        setBios(response.bios);
      }
    });

    // Listen for updates from the background script (e.g., when new bios are scraped)
    const messageListener = (message: any) => {
      if (message.type === 'bioDataAvailable') {
        // Request the latest bios again when new data is available
        chrome.runtime.sendMessage({ type: 'requestLatestBios' }, (response) => {
          if (response && response.bios) {
            setBios(response.bios);
          }
        });
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

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
        <h2>Extracted Bios:</h2>
        <div className="bio-container">
          {error ? (
            <p className="error-message">{error}</p>
          ) : bios.length > 0 ? (
            bios.map((bio, index) => <p key={index}>{bio}</p>)
          ) : (
            <p className="loading-message">No bios found yet. Swipe through some profiles to start populating this list.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;