import "./App.css";
import TextEditor from "./components/TextEditor";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Lobby from "./pages/Lobby";
import CodeBlock from "./pages/CodeBlock";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lobby />}></Route>
      </Routes>
      <Routes>
        <Route path="/codeBlocks/:blockId" element={<CodeBlock />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
