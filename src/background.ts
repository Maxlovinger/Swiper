const attachedTabs = new Set<number>();
const requestMap = new Map<string, string>();
let lastScrapedBios: string[] = [];

function attachDebugger(tabId: number) {
  if (attachedTabs.has(tabId)) {
    return;
  }
  chrome.debugger.attach({ tabId }, '1.3', () => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
      return;
    }
    attachedTabs.add(tabId);
    chrome.debugger.sendCommand({ tabId }, 'Network.enable');
  });
}

function detachDebugger(tabId: number) {
  if (attachedTabs.has(tabId)) {
    chrome.debugger.detach({ tabId });
    attachedTabs.delete(tabId);
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('tinder.com')) {
    attachDebugger(tabId);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  detachDebugger(tabId);
});

chrome.tabs.onReplaced.addListener((_addedTabId, removedTabId) => {
  detachDebugger(removedTabId);
});

chrome.debugger.onEvent.addListener((source, method, params) => {
  const tabId = source.tabId;
  if (!tabId) return;

  if (method === 'Network.responseReceived' && params) {
    const response = params as any;
    if (response.response.url.includes('/v2/recs/core')) {
      requestMap.set(response.requestId, response.response.url);
    }
  } else if (method === 'Network.loadingFinished' && params) {
    const requestId = (params as any).requestId;
    if (requestMap.has(requestId)) {
      chrome.debugger.sendCommand(
        { tabId },
        'Network.getResponseBody',
        { requestId },
        (body) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            return;
          }
          try {
            const profileData = JSON.parse((body as any).body);
            if (profileData.data && profileData.data.results) {
              const bios = profileData.data.results.map((result: any) => result.user.bio).filter(Boolean);
              if (bios.length > 0) {
                lastScrapedBios = bios; // Store the bios
                // Optionally, send a message to the popup if it's open
                chrome.runtime.sendMessage({ type: 'bioDataAvailable' });
              }
            }
          } catch (e) {
            console.error('Error parsing profile data:', e);
          }
        }
      );
      requestMap.delete(requestId);
    }
  }
});

// Handle requests from the popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === 'requestLatestBios') {
    sendResponse({ bios: lastScrapedBios });
  }
});

// Attach to existing Tinder tabs on startup
chrome.runtime.onStartup.addListener(() => {
  chrome.tabs.query({ url: '*://tinder.com/*' }, (tabs) => {
    for (const tab of tabs) {
      if (tab.id) {
        attachDebugger(tab.id);
      }
    }
  });
});