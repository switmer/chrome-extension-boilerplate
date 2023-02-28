import * as React from 'react';
import * as ReactDOM from 'react-dom';
import "../styles/popup.css"

interface PopupProps {}

interface PopupState {}

class Popup extends React.Component<PopupProps, PopupState> {
  constructor(props: PopupProps) {
    super(props);
    this.extractImages = this.extractImages.bind(this);
  }

  extractImages() {
    chrome.runtime.sendMessage({ message: "extractImages" });
  }

  render() {
    return (
      <div>
        <h1>Welcome to My Extension!</h1>
        <p>Click the button below to extract images from open tabs and upload them to Figma:</p>
        <button onClick={this.extractImages}>Extract Images</button>
      </div>
    );
  }
}

ReactDOM.render(<Popup />, document.getElementById('popup'));
