import React from "react";

interface RecycleBinProps {
  // Add props as needed
}

const RecycleBin: React.FC<RecycleBinProps> = () => {
  return (
    <div className="your-files">
      <h2>Recycle Bin</h2>
      <p>Files will be displayed here</p>
    </div>
  );
};

export default RecycleBin;
