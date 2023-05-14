import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import "../App.css";

function Lobby() {
  const navigate = useNavigate();
  const [socket, setSocket] = useState();
  const [codeBlocks, setCodeBlocks] = useState([]);

  const handleButtonClick = (blockId) => {
    navigate(`/codeBlocks/${blockId}`);
  };

  // Handle self text change.
  useEffect(() => {
    if (socket == null) return;
    socket.emit("get-blocks");
    const handler = (blocks) => {
      setCodeBlocks(blocks);
      console.log(blocks);
    };

    socket.on("receive-blocks", handler);
    return () => {
      socket.off("receive-blocks", handler);
    };
  }, [socket]);

  // Configure server and socket connection.
  useEffect(() => {
    const s = io("https://web-coding-app-server.onrender.com/");
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <div className="container-c">
      <h1>Choose Code Block</h1>
      <div className="buttons-div">
        {codeBlocks.length !== 0 ? (
          codeBlocks.map((codeBlock) => (
            <button
              onClick={() => handleButtonClick(codeBlock.id)}
              key={codeBlock.id}
            >
              {codeBlock.title}
            </button>
          ))
        ) : (
          <span>Loading...</span>
        )}
      </div>
    </div>
  );
}

export default Lobby;
