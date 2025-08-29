const BIO_SELECTOR = '.BreakWord';
let lastBio = '';

function scrapeProfile() {
  const bioElement = document.querySelector(BIO_SELECTOR);

  if (bioElement) {
    const bioText = (bioElement as HTMLElement).innerText;
    // Only send message if the bio has changed
    if (bioText !== lastBio) {
      lastBio = bioText;
      chrome.runtime.sendMessage({ type: 'bioData', bio: bioText });
    }
  } else {
    // If the bio element is not found, send a message to clear the score
    chrome.runtime.sendMessage({ type: 'bioData', bio: '' });
  }
}

// Listen for requests from the popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === 'requestBio') {
    scrapeProfile();
    sendResponse({ status: 'scraped' });
  }
});

// Use a MutationObserver to detect changes in the DOM
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    // Check if the nodes that were added or removed contain the bio element
    const addedNodes = Array.from(mutation.addedNodes);
    const removedNodes = Array.from(mutation.removedNodes);

    const hasBioChanged = [...addedNodes, ...removedNodes].some(node => 
      node.nodeType === Node.ELEMENT_NODE && (node as Element).querySelector(BIO_SELECTOR)
    );

    if (hasBioChanged) {
      scrapeProfile();
      break; // No need to check other mutations
    }
  }
});

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });

// Initial scrape
scrapeProfile();
