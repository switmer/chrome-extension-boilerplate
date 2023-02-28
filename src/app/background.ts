// Listen for the user to click on the extension icon
chrome.browserAction.onClicked.addListener(() => {
    // Loop through all open tabs
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        // Check if tab contains an image
        if (tab.url.match(/\\.(jpeg|jpg|gif|png)$/) !== null) {
          // Extract image and save as data URL or file
          chrome.tabs.captureVisibleTab({ format: "png" }, (image) => {
            // Authenticate with Figma API to get access token
            // Replace "YOUR_ACCESS_TOKEN" with your own access token
            const accessToken = "YOUR_ACCESS_TOKEN";
            fetch("<https://www.figma.com/api/oauth/token>", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: `grant_type=authorization_code&code=${accessToken}`,
            })
              .then((response) => response.json())
              .then((data) => {
                // Create new Figma file
                // Replace "YOUR_FILE_ID" with the ID of the file you want to use
                const fileId = "YOUR_FILE_ID";
                fetch(`https://api.figma.com/v1/files/${fileId}`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "X-Figma-Token": data.access_token,
                  },
                  body: JSON.stringify({ name: "New File" }),
                })
                  .then((response) => response.json())
                  .then((data) => {
                    // Upload image to Figma file
                    fetch(`https://api.figma.com/v1/images/${data.key}`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "X-Figma-Token": data.access_token,
                      },
                      body: JSON.stringify({
                        format: "png",
                        svg_include_id: false,
                        images: [{ bytes: image }],
                      }),
                    })
                      .then((response) => response.json())
                      .then((data) => {
                        // Log the URL of the uploaded image to the console
                        console.log(data.images[0].url);
                        // Use the image URL to add the image to a Figma design
                      });
                  });
              });
          });
        }
      }
    });
  });
  