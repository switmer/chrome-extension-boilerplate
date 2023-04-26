let tabs = [];
let copiedTabs = [];

const loadingTimeout = 1050;
const iconPath = './icons.svg';
const svgCacheKey = 'svgCache';

function addSkeletonLoaders(imageList, count) {
  for (let i = 0; i < count; i++) {
    const listItem = document.createElement('li');
    listItem.textContent = '';
    listItem.classList.add('skeleton');
    imageList.appendChild(listItem);
  }
}

function truncateUrl(url, maxLength) {
  if (url.length <= maxLength) {
    return url;
  }

  const protocolRegex = /^https?:\/\//;
  const wwwRegex = /^www\./;
  let truncatedUrl = url.replace(protocolRegex, '').replace(wwwRegex, '');
  if (truncatedUrl.length > maxLength) {
    const middleIndex = Math.floor(maxLength / 2);
    const firstHalf = truncatedUrl.slice(0, middleIndex);
    const secondHalf = truncatedUrl.slice(-middleIndex);
    truncatedUrl = `${firstHalf}...${secondHalf}`;
  }
  return truncatedUrl;
}



function removeSkeletonLoaders() {
  const skeletonLoaders = document.querySelectorAll('.skeleton');
  skeletonLoaders.forEach(loader => {
    loader.remove();
  });
}

function createListItem(tab, imageList, useSkeleton = true) {
  const listItem = document.createElement('li');
  const truncatedUrl = truncateUrl(tab.url, 48); // adjust the maxLength (50) as needed
  listItem.textContent = truncatedUrl;

  if (useSkeleton) {
    listItem.classList.add('skeleton');
  } else {
    listItem.classList.remove('skeleton');
  }

  imageList.appendChild(listItem);
  return listItem;
}


// function createListItem(tab, imageList, useSkeleton = true) {
//   const listItem = document.createElement('li');
//   listItem.textContent = tab.url;

//   if (useSkeleton) {
//     listItem.classList.add('skeleton');
//   } else {
//     listItem.classList.remove('skeleton');
//   }

//   imageList.appendChild(listItem);
//   return listItem;
// }




// Retrieve SVG contents from localStorage if available
let svgText = localStorage.getItem(svgCacheKey);
if (svgText) {
  const svgContainer = document.createElement('div');
  svgContainer.style.display = 'none';
  svgContainer.innerHTML = svgText;
  document.body.appendChild(svgContainer);
} else {
  // Fetch SVG contents and cache them in localStorage
  fetch(iconPath)
    .then(response => response.text())
    .then(svgText => {
      localStorage.setItem(svgCacheKey, svgText);
      const svgContainer = document.createElement('div');
      svgContainer.innerHTML = svgText;
      document.body.appendChild(svgContainer);
    });
}

// SVG Code pulled from icons.svg
const getSvgMarkupById = (iconId) => {
  const svgIcon = document.querySelector(`#${iconId}`);
  return svgIcon ? svgIcon.outerHTML : '';
};

// Get Open Tabs with Images
async function getOpenTabsWithImages() {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
  const imageFormats = ["format=jpg", "format=png", "format=gif", "format=webp", "name=medium"];

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

function copyImageUrlsToClipboard(imageUrls) {
  const urlsToCopy = imageUrls.join('\n');
  navigator.clipboard.writeText(urlsToCopy).then(() => {
    console.log('Image URLs copied to clipboard');
    copiedTabs = tabs.slice(); // Add the tabs to copiedTabs
  });
}
async function reload() {
 
  const imageList = document.getElementById('imageList');
  const existingItems = imageList.querySelectorAll('li');
  existingItems.forEach(item => item.classList.add('skeleton'));
    // // Add skeleton loaders to the image list
    // addSkeletonLoaders(imageList, tabs.length);

  // Show the spinner
  document.getElementById('loadingContainer').style.display = 'block';

  // Change the status text to indicate that tabs are being checked again
  document.getElementById('status').textContent = 'Checking tabs again...';

  // Clear the copiedTabs array
  copiedTabs = [];

  // Hide the close button
  document.getElementById('closeTabs').style.display = 'none';

// Change the status text to indicate that tabs are being checked again
document.getElementById('status').textContent = 'Checking tabs again...';


  // Wait for the minimum timeout
  await new Promise(resolve => setTimeout(resolve, 500));

  // Update the image list
  await updateImageList();

  // Hide the spinner
  document.getElementById('loadingContainer').style.display = 'none';
}



async function updateImageList() {
  const tabsPromise = getOpenTabsWithImages();
  const timeoutPromise = new Promise(resolve => setTimeout(resolve, 800));

  tabs = await tabsPromise;
  document.getElementById('loadingContainer').style.display = 'block';

  // Wait for the minimum timeout
  await timeoutPromise;

  if (tabs.length === 0) {
    document.getElementById('status').innerHTML = getSvgMarkupById('NoImagesFound') + 'No images found in open tabs.';
    document.getElementById('copyButton').disabled = true;
    document.getElementById('imageListContainer').style.display = 'none';
    document.getElementById('loadingContainer').style.display = 'none';

    return;
  } else {
    document.getElementById('status').innerHTML = `<span id="badge">${tabs.length}</span> image tabs found`;
    document.getElementById('copyButton').disabled = false;
  }

  const imageList = document.getElementById('imageList');
  // Clear the existing list items
  while (imageList.firstChild) {
    imageList.firstChild.remove();
  }

  // Add skeleton loaders for each tab
  addSkeletonLoaders(imageList, tabs.length);

  // Populate the list with new items
  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i];
    createListItem(tab, imageList, false);
  }
  
  // Remove the skeleton loaders
  removeSkeletonLoaders();

  // Show the image list container
  document.getElementById('imageListContainer').style.display = 'block';

  // Hide the spinner
  document.getElementById('loadingContainer').style.display = 'none';
}



document.addEventListener('DOMContentLoaded', async () => {

  // Initialize the skeleton loader animation
  const skeletonElements = document.querySelectorAll('.skeleton');
  skeletonElements.forEach(element => {
    element.innerHTML = '<div class="skeleton-animation"></div>';
  });

  // closeTabs event listener
  document.getElementById('closeTabs').addEventListener('click', async () => {
    document.getElementById('closeTabs').disabled = true;

    // Close the copied tabs
    for (const tab of copiedTabs) {
      chrome.tabs.remove(tab.id);
    }

    chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
      // hide the imageListContainer element
      document.getElementById("imageListContainer").style.display = "none";
    });

    document.getElementById('status').innerHTML = getSvgMarkupById('CloseTabs') + 'Copied tabs closed';
    document.getElementById('closeTabs').disabled = false;

    // Clear tabs and copiedTabs arrays
    tabs = [];
    copiedTabs = [];

    // Clear image URL list
    const imageList = document.getElementById('imageList');
    while (imageList.firstChild) {
      imageList.firstChild.remove();
    }

    // Hide close button
    document.getElementById('closeTabs').style.display = 'none';
  });

    
  // Get the open tabs with images
  tabs = await getOpenTabsWithImages();

  // Show the loading container
  document.getElementById('loadingContainer').style.display = 'block';

  // Call updateImageList after a short delay
  setTimeout(async () => {
    await updateImageList();

    // // Update the status text to show the number of images found in open tabs
    // document.getElementById('status').innerHTML = `<span id="badge">${tabs.length}</span> image tabs found`;

    // Hide the loading container
    const loadingContainer = document.getElementById('loadingContainer');
    loadingContainer.style.display = 'none';

  }, loadingTimeout);
       
  // Create a new unordered list element to display the image URLs
  const imageList = document.createElement('ul');
  imageList.id = 'imageList';

  tabs.forEach(tab => {
    const listItem = document.createElement('li');
    listItem.textContent = tab.url;
    listItem.className = 'skeleton'; // add the skeleton class to the <li> element
    imageList.appendChild(listItem);
  });
  

  

  // Add the image list to the imageListContainer element on the page
  document.getElementById('imageListContainer').appendChild(imageList);

  // Add a click event listener to the copyButton
  document.getElementById('copyButton').addEventListener('click', async () => {
    // Disable the copyButton to prevent multiple clicks
    document.getElementById('copyButton').disabled = true;
    // Set the status text to show that the image URLs are being copied to the clipboard
    document.getElementById('status').textContent = 'Copying image URLs to clipboard...';

    // Create an array of image URLs from the tabs
    const imageUrls = tabs.map(tab => tab.url);
    // Copy the image URLs to the clipboard
    await copyImageUrlsToClipboard(imageUrls);

    // Update the status text and icon to show that the image URLs have been copied to the clipboard
    document.getElementById('status').innerHTML = `${getSvgMarkupById('URLSCopied')} Copied to clipboard`;
    // Enable the copyButton again
    document.getElementById('copyButton').disabled = false;

    // Update the button text and icon
    const importText = document.getElementById('importText');
    const importIcon = document.getElementById('importIcon');
    importText.textContent = 'Copied';
    importIcon.innerHTML = '<path d="M20 6.5L9 17.5L4 12.5" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';

    // Revert the button text and icon back to their original state after 5 seconds
    setTimeout(() => {
      importText.textContent = 'Copy to clipboard';
      importIcon.innerHTML = '<rect x="21" y="17" width="14" height="14" rx="3" transform="rotate(180 21 17)" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 20C16.3604 20.6413 15.4915 21.0012 14.5857 21H6C4.34315 21 3 19.6569 3 18V9.41431C2.99879 8.50854 3.35869 7.63964 4 7" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
    }, loadingTimeout);

    // Update the tabs variable with the latest open tabs with images
    tabs = await getOpenTabsWithImages();

    // Show the close button
    document.getElementById('closeTabs').style.display = 'block';
  });
  
  document.getElementById('reloadButton').addEventListener('click', async () => {
    await reload();
  });
});