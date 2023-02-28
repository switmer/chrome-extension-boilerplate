document.addEventListener("DOMContentLoaded", function() {
  var extractImagesButton = document.getElementById("extract-images-button");
  extractImagesButton.addEventListener("click", function() {
    chrome.runtime.sendMessage({ message: "extractImages" });
  });
});
