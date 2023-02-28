document.addEventListener("DOMContentLoaded", () => {
    const extractImagesButton = document.getElementById("extract-images-button");
    extractImagesButton.addEventListener("click", () => {
      chrome.runtime.sendMessage({ message: "extractImages" });
    });
  });
  