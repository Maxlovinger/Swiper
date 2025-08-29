let lastBio = '';

function scrapeProfile() {
  // Find the user's name, which is usually in an h1 element
  const nameElement = document.querySelector('h1');
  let bioText = '';

  if (nameElement) {
    // The bio is typically in a div that is a sibling of the name element's container
    const profileContainer = nameElement.closest('.react-swipeable-view-container > div > div');
    if (profileContainer) {
      const bioElement = profileContainer.querySelector(':scope > div:nth-child(2) > div > div');
      if (bioElement) {
        bioText = (bioElement as HTMLElement).innerText;
      }
    }
  }

  // Fallback to the old selector if the new one fails
  if (!bioText) {
    const bioElement = document.querySelector('.BreakWord');
    if (bioElement) {
      bioText = (bioElement as HTMLElement).innerText;
    }
  }

  // Only send message if the bio has changed
  if (bioText !== lastBio) {
    lastBio = bioText;
    chrome.runtime.sendMessage({ type: 'bioData', bio: bioText });
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
    const addedNodes = Array.from(mutation.addedNodes);
    const removedNodes = Array.from(mutation.removedNodes);

    const hasProfileChanged = [...addedNodes, ...removedNodes].some(node => 
      node.nodeType === Node.ELEMENT_NODE && (node as Element).querySelector('h1')
    );

    if (hasProfileChanged) {
      scrapeProfile();
      break; 
    }
  }
});

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });

// Initial scrape
scrapeProfile();