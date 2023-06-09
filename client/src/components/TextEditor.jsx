import React, { useCallback, useEffect, useState } from "react";
import "quill/dist/quill.snow.css";
import Quill from "quill";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/hljs";

import "../App.css";
import "../styles/TextEditor.css";
import Mode from "./Mode";

function TextEditor() {
  const { blockId } = useParams();
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();

  const [blockTitle, setBlockTitle] = useState("");
  const [isFirst, setIsfirst] = useState(true);
  const [text, setText] = useState("");

  const [showSmiley, setShowSmiley] = useState(false);
  const [rightCode, setRightCode] = useState("");

  // Configure server connection.
  useEffect(() => {
    const s = io("https://web-coding-app-server.onrender.com/");
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  // Configure text-editor.
  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    // Makes sure that editor appears only once each rendering.
    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);

    const q = new Quill(editor, {
      theme: "snow",
      modules: {
        toolbar: false,
      },
      formats: [],
    });
    // Editor is disabled untill initial block will load.
    q.disable();
    q.setText("loading...");
    setQuill(q);
    setText(q.getText());
  }, []);

  // Handle self text change.
  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta, oldDelta, source) => {
      // Emit an event only for others text changes.
      if (source !== "user") return;
      // Send only the spcific text changes, not all doc.
      socket.emit("send-changes", delta);
      setText(quill.getText());
    };

    // "text-change" is quill built-in event.
    quill.on("text-change", handler);
    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);

  // Handle receiving text change.
  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta) => {
      quill.updateContents(delta);
      setText(quill.getText());
    };

    // "text-change" is quill built-in event
    socket.on("receive-changes", handler);
    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, quill]);

  // Check if text is equal to right code.
  // Trim all white spaces from both texts.
  useEffect(() => {
    if (
      text.replace(/\s+/g, " ").trim() === rightCode.replace(/\s+/g, " ").trim()
    ) {
      setShowSmiley(true);
    } else {
      setShowSmiley(false);
    }
  }, [text]);

  // Init code block.
  useEffect(() => {
    if (socket == null || quill == null) return;

    socket.once("load-block", async (block, userCount) => {
      console.log("udefined?", block);
      quill.setText(block.code);
      setText(quill.getText());
      quill.enable();

      setBlockTitle(block.title);
      setRightCode(block.rightCode);

      // Mentor or student decision.
      setIsfirst(userCount === 1);
    });
    socket.emit("get-block", blockId);
  }, [socket, quill, blockId]);

  // Determine whether mentor or student
  useEffect(() => {
    if (socket == null) return;
    socket.emit("is-first");
  }, [socket]);

  // useEffect(() => {
  //   if (socket == null || quill == null) return;

  //   socket.emit("save-block", quill.getContents());
  //   console.log("from client: save the changes!");
  // }, [socket, quill]);

  useEffect(() => {
    if (socket == null) return;
    socket.emit("register-user", socket.id);
    return () => {
      socket.emit("unregister-user", socket.id);
    };
  }, []);

  const updateCode = () => {
    if (quill == null || socket == null) return;
    socket.emit("save-block", quill.getContents().ops[0].insert);
  };

  return (
    <div className="container-block">
      <div className="editor-div">
        <Mode isFirst={isFirst} />
        <h2>{blockTitle}</h2>
        <div
          className={isFirst ? "disp-none" : null}
          id="container"
          ref={wrapperRef}
        ></div>
      </div>
      <button onClick={() => updateCode()}>save code</button>
      {showSmiley && <h1>:)</h1>}
      <SyntaxHighlighter language="javascript" style={dark} tabSize={2}>
        {text}
      </SyntaxHighlighter>
    </div>
  );
}

export default TextEditor;
