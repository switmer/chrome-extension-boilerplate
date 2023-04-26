async function getOpenTabsWithImages() {
    const imageExtensions = ["jpg", "jpeg", "png", "gif"];
    const imageFormats = ["format=jpg", "format=png", "format=gif", "name=medium"];
  
    return new Promise(resolve => {
      chrome.tabs.query({ currentWindow: true }, tabs => {
        const imageTabs = tabs.filter(tab => {
          const url = new URL(tab.url);
          const extension = url.pathname.split('.').pop().toLowerCase();
          const searchParams = url.searchParams.toString();
  
          if (imageExtensions.includes(extension)) {
            return true;
          }
  
          for (const format of imageFormats) {
            if (searchParams.includes(format)) {
              return true;
            }
          }
  
          return false;
        });
  
        resolve(imageTabs);
      });
    });
  }
  
  async function updateBadgeCount() {
    const imageTabs = await getOpenTabsWithImages();
    const imageTabsCount = imageTabs.length;
    
    // Only set the badge text and color if there are one or more image tabs
    if (imageTabsCount > 0) {
      if (chrome.action) {
        chrome.action.setBadgeBackgroundColor({color: [237, 108, 75, 255]});
        chrome.action.setBadgeText({text: imageTabsCount.toString()});
      } else {
        console.error('Error: chrome.action is undefined.');
      }
    } else {
      // If there are no image tabs, remove the badge
      chrome.action.setBadgeText({text: ''});
    }
  }
  
  
  
  
  
  chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
    await updateBadgeCount();
  });
  
  chrome.tabs.onCreated.addListener(async function(tab) {
    await updateBadgeCount();
  });
  
  chrome.tabs.onRemoved.addListener(async function(tabId, removeInfo) {
    await updateBadgeCount();
  });
  
  chrome.windows.onFocusChanged.addListener(async function(windowId) {
    if (windowId !== chrome.windows.WINDOW_ID_NONE) {
      await updateBadgeCount();
    }
  });
  