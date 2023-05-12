import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Lobby() {
  const navigate = useNavigate();

  const handleClick = (blockId) => {
    navigate(`/codeBlocks/${blockId}`);
  };

  const codeBlocks = [
    { blockId: "codeBlock1" },
    { blockId: "codeBlock2" },
    { blockId: "codeBlock3" },
    { blockId: "codeBlock4" },
  ];

  return (
    <div className="container-c">
      <h1>Choose Code Block</h1>
      <div className="buttons-div">
        {codeBlocks.map((codeBlock) => (
          <button
            onClick={() => handleClick(codeBlock.blockId)}
            key={codeBlock.blockId}
          >
            {codeBlock.blockId}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Lobby;
