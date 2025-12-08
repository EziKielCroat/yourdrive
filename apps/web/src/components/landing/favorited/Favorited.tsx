import React from "react";

interface FavoritedProps {
  // Add props as needed
}

const Favorited: React.FC<FavoritedProps> = () => {
  return (
    <div className="your-files">
      <h2>Favorited</h2>
      <p>Files will be displayed here</p>
    </div>
  );
};

export default Favorited;
