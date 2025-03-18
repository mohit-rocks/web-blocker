document.addEventListener('DOMContentLoaded', function() {
  const blockingToggle = document.getElementById('blocking-toggle');
  const statusText = document.getElementById('status-text');
  const blockedSitesTextarea = document.getElementById('blocked-sites');
  const saveButton = document.getElementById('save-button');
  const statusDiv = document.getElementById('status');
  
  // Load saved settings
  chrome.storage.sync.get(['blockedSites', 'isEnabled'], function(data) {
    if (data.blockedSites) {
      blockedSitesTextarea.value = data.blockedSites.join('\n');
    }
    
    if (data.isEnabled) {
      blockingToggle.checked = data.isEnabled;
      statusText.textContent = data.isEnabled ? 'ON' : 'OFF';
    }
  });
  
  // Toggle blocking on/off
  blockingToggle.addEventListener('change', function() {
    const isEnabled = blockingToggle.checked;
    statusText.textContent = isEnabled ? 'ON' : 'OFF';
    
    chrome.storage.sync.set({ isEnabled: isEnabled }, function() {
      statusDiv.textContent = `Blocking ${isEnabled ? 'enabled' : 'disabled'}`;
      setTimeout(() => { statusDiv.textContent = ''; }, 2000);
    });
  });
  
  // Save blocked sites
  saveButton.addEventListener('click', function() {
    const sites = blockedSitesTextarea.value.split('\n')
      .map(site => site.trim())
      .filter(site => site !== '');
    
    chrome.storage.sync.set({ blockedSites: sites }, function() {
      statusDiv.textContent = 'Sites saved successfully!';
      setTimeout(() => { statusDiv.textContent = ''; }, 2000);
    });
  });
});
