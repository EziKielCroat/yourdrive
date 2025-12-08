import React from "react";

interface RecentlyEditedProps {
  // Add props as needed
}

const RecentlyEdited: React.FC<RecentlyEditedProps> = () => {
  return (
    <div className="your-files">
      <h2>Recently Edited</h2>
      <p>Files will be displayed here</p>
    </div>
  );
};

export default RecentlyEdited;
