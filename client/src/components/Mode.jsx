import React from "react";

function Mode({ isFirst }) {
  return (
    <div>
      {isFirst ? (
        <span>Mentor mode - Read Only</span>
      ) : (
        <span>Student mode - Read and Write</span>
      )}
    </div>
  );
}

export default Mode;
