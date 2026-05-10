import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import {
  LoginPage,
  RegisterPage,
} from "./pages/authPages";
import HomePage from "./pages/HomePage";
import Editor from "./pages/notesPages/Editor";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          <Route path="/" element={<LoginPage />} />

          <Route path="/register" element={<RegisterPage />} />
          <Route path='/home' element={<HomePage />} />

          <Route
            path="/editor/:noteId"
            element={
              <ProtectedRoute>
                <Editor />
              </ProtectedRoute>
            }
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
