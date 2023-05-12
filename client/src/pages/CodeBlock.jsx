import React from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import TextEditor from "../components/TextEditor";

function CodeBlock() {
  const { blockId } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <span>blockid: {blockId}</span>
      <div>
        <TextEditor />
      </div>
      <button onClick={() => navigate("/")}>Back to Lobby</button>
      <span>current online users:</span>
    </div>
  );
}

export default CodeBlock;
