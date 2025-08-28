// This is a placeholder. The actual selectors will need to be determined by inspecting the Tinder website.
const BIO_SELECTOR = '.some-class-for-bio';
const PROFILE_CONTAINER_SELECTOR = '.some-class-for-profile';

function analyzeProfile() {
  chrome.storage.sync.get(['likes', 'dislikes'], (prefs) => {
    const likes = prefs.likes || [];
    const dislikes = prefs.dislikes || [];

    const bioElement = document.querySelector(BIO_SELECTOR);
    if (!bioElement) {
      return;
    }

    const bioText = (bioElement as HTMLElement).innerText.toLowerCase();
    let score = 50; // Start with a neutral score
    const reasons: string[] = [];

    likes.forEach((like: string) => {
      if (bioText.includes(like.toLowerCase())) {
        score += 10;
        reasons.push(`+ Found "${like}"`);
      }
    });

    dislikes.forEach((dislike: string) => {
      if (bioText.includes(dislike.toLowerCase())) {
        score -= 15;
        reasons.push(`- Found "${dislike}"`);
      }
    });

    score = Math.max(0, Math.min(100, score)); // Clamp score between 0 and 100

    displayScore(score, reasons);
  });
}

function displayScore(score: number, reasons: string[]) {
  const profileContainer = document.querySelector(PROFILE_CONTAINER_SELECTOR);
  if (!profileContainer) {
    return;
  }

  let overlay = document.getElementById('intelliswipe-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'intelliswipe-overlay';
    profileContainer.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="intelliswipe-score">
      <h2>Match Score: ${score}%</h2>
      <ul>
        ${reasons.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>
  `;
}

// Since Tinder is a single-page app, we need to re-run the analysis when the user navigates to a new profile.
// We can use a MutationObserver to detect changes in the DOM.
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      // A simple check to see if a new profile might have been loaded.
      // This will need to be made more robust.
      if (document.querySelector(BIO_SELECTOR) && !document.getElementById('intelliswipe-overlay')) {
        analyzeProfile();
        break;
      }
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial run
analyzeProfile();
