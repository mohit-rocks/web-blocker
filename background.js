// background.js
chrome.runtime.onInstalled.addListener(() => {
  // Initialize default settings
  chrome.storage.sync.get(['blockedSites', 'isEnabled'], function(data) {
    if (!data.blockedSites) {
      chrome.storage.sync.set({ blockedSites: [] });
    }
    
    if (data.isEnabled === undefined) {
      chrome.storage.sync.set({ isEnabled: false });
    }
  });
});

// Listen for tab updates to catch and block sites
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only run when the page is loading and has a URL
  if (changeInfo.status === 'loading' && tab.url) {
    checkIfBlocked(tabId, tab.url);
  }
});

// Check if a URL is blocked and redirect if needed
function checkIfBlocked(tabId, url) {
  // Ignore chrome:// URLs and extension pages
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
    return;
  }
  
  chrome.storage.sync.get(['blockedSites', 'isEnabled'], function(data) {
    // Exit if blocking is disabled
    if (!data.isEnabled || !data.blockedSites || data.blockedSites.length === 0) {
      return;
    }
    
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
      // Check if the site is in the blocked list
      const isBlocked = data.blockedSites.some(site => {
        // Clean up site entry (remove http://, https://, www., etc.)
        let cleanSite = site.trim().toLowerCase();
        cleanSite = cleanSite.replace(/^https?:\/\//, '');
        cleanSite = cleanSite.replace(/^www\./, '');
        
        // Clean up the current hostname for comparison
        let cleanHostname = hostname.toLowerCase().replace(/^www\./, '');
        
        // Check for exact match or subdomain
        return cleanHostname === cleanSite || 
               cleanHostname.endsWith('.' + cleanSite);
      });
      
      // Redirect to blocked page if site is blocked
      if (isBlocked) {
        console.log("Blocking site:", url);
        chrome.tabs.update(tabId, {
          url: chrome.runtime.getURL('blocked.html')
        });
      }
    } catch (e) {
      console.error("Error checking URL:", e);
    }
  });
}

// Also check when a new tab is created
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.url) {
    checkIfBlocked(tab.id, tab.url);
  }
});

// For good measure, also listen to webNavigation events
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  // Only check main frame navigation (not iframes, etc.)
  if (details.frameId === 0) {
    checkIfBlocked(details.tabId, details.url);
  }
});