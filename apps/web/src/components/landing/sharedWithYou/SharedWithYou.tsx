import React from "react";

interface SharedWithYouProps {
  // Add props as needed
}

const SharedWithYou: React.FC<SharedWithYouProps> = () => {
  return (
    <div className="your-files">
      <h2>Shared with you</h2>
      <p>Files will be displayed here</p>
    </div>
  );
};

export default SharedWithYou;
