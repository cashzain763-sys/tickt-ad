import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "./Main_Page";
import Login from "./Login";

export const serverRoute = 'http://localhost:8080'
// export const serverRoute = "https://tic-6gfk.onrender.com";
// export const serverRoute = "https://salmh-se2.onrender.com";
export const token = localStorage.getItem("token");
function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route element={<Main />} path="/" />
          <Route element={<Login />} path="/login" />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
