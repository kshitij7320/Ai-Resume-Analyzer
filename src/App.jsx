import React from "react";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import { Routes, Route } from "react-router-dom";
import About from "./Pages/About";
import Projects from "./Pages/Projects";
import FileUpload from "./Components/Uploadfile";

const App = () => {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<FileUpload />} />
        {/* <Route path="/about" element={<About />} /> */}
        <Route path="/analyze" element={<FileUpload />} />
        {/* <Route path="/projects" element={<Projects />} /> */}
      </Routes>
    </div>
  );
};

export default App;
