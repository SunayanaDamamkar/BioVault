import React from 'react';
import BioVaultApp from './BlinkDetector'; // Grabs the new code from your file

function App() {
  return (
    <div className="App">
      {/*We use BioVaultApp here because that is what is exported from BlinkDetector.jsx*/}
      <BioVaultApp /> {/* <-- Update this tag to match */}
    </div>
  );
}

export default App;