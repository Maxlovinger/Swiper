import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [likes, setLikes] = useState('');
  const [dislikes, setDislikes] = useState('');

  useEffect(() => {
    chrome.storage.sync.get(['likes', 'dislikes'], (result) => {
      if (result.likes) {
        setLikes(result.likes.join(', '));
      }
      if (result.dislikes) {
        setDislikes(result.dislikes.join(', '));
      }
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const likesArray = likes.split(',').map(s => s.trim()).filter(Boolean);
    const dislikesArray = dislikes.split(',').map(s => s.trim()).filter(Boolean);
    chrome.storage.sync.set({ likes: likesArray, dislikes: dislikesArray }, () => {
      console.log('Preferences saved');
    });
  };

  return (
    <div className="App">
      <h1>IntelliSwipe Advisor</h1>
      <h2>Preferences</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="likes">Likes (comma-separated):</label>
        <br />
        <input
          type="text"
          id="likes"
          name="likes"
          value={likes}
          onChange={(e) => setLikes(e.target.value)}
        />
        <br />
        <br />
        <label htmlFor="dislikes">Dislikes (comma-separated):</label>
        <br />
        <input
          type="text"
          id="dislikes"
          name="dislikes"
          value={dislikes}
          onChange={(e) => setDislikes(e.target.value)}
        />
        <br />
        <br />
        <button type="submit">Save</button>
      </form>
    </div>
  );
}

export default App;
