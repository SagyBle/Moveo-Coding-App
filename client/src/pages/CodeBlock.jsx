import React from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import TextEditor from "../components/TextEditor";

function CodeBlock() {
  const { blockId } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <div>
        <TextEditor />
      </div>
      <button onClick={() => navigate("/")}>Back to Lobby</button>
    </div>
  );
}

export default CodeBlock;
