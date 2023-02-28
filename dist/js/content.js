// This script will be injected into the webpage

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'extractImages') {
      // Get all images on the page
      const images = document.querySelectorAll('img');
      // Convert NodeList to Array and map to image sources
      const imageSources = Array.from(images).map((image) => image.src);
      // Send message back to the background script with the image sources
      sendResponse({ images: imageSources });
    }
  });