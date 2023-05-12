import React, { useCallback, useEffect, useRef, useState } from "react";
import "quill/dist/quill.snow.css";
import Quill from "quill";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

function TextEditor() {
  const [saveCode, setSaveCode] = useState(false);

  const { blockId } = useParams();
  const [socketId, setSocketId] = useState();
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();

  const [blockTitle, setBlockTitle] = useState("");

  // Configure server connection.
  useEffect(() => {
    const s = io("http://localhost:3001");
    setSocket(s);
    console.log("user", socketId, " connected :)");
    return () => {
      console.log("user disconnected :(");
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
  }, []);

  // Handle self text change.
  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta, oldDelta, source) => {
      // Emit an event only for others text changes.
      if (source !== "user") return;
      // Send only the spcific text changes, not all doc.
      socket.emit("send-changes", delta);
    };

    // "text-change" is quill built-in event
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
    };

    // "text-change" is quill built-in event
    socket.on("receive-changes", handler);
    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, quill]);

  // Init code block.
  useEffect(() => {
    if (socket == null || quill == null) return;

    socket.once("load-block", async (block) => {
      console.log("1", block);
      quill.setText(block.code);
      quill.enable();
      console.log(block.title);
      setBlockTitle(block.title);
    });
    socket.emit("get-block", blockId);
  }, [socket, quill, blockId]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    socket.emit("save-block", quill.getContents());
    console.log("from client: save the changes!");
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null) return;
    socket.emit("register-user", socket.id);
    return () => {
      socket.emit("unregister-user", socket.id);
    };
  }, [socket]);

  const updateCode = () => {
    if (quill == null || socket == null) return;
    socket.emit("save-block", quill.getContents().ops[0].insert);
  };
  const tryfunc = () => {
    // var clients = io.sockets.clients(blockId);
    // console.log(clients);
    console.log(io);
  };

  return (
    <>
      <span>{blockTitle}</span>
      <div>
        <div id="container" ref={wrapperRef}></div>
      </div>
      <button onClick={() => updateCode()}>save code</button>
      <button onClick={() => tryfunc()}>try</button>
    </>
  );
}

export default TextEditor;
