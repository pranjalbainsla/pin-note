import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { ErrorBoundary } from "react-error-boundary";

import {
  LoginPage,
  RegisterPage,
} from "./pages/authPages";
import HomePage from "./pages/HomePage";
import Editor from "./pages/notesPages/Editor";
import ErrorFallback from "./components/errors/ErrorFallback";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Routes>
            <Route path="/" element={<LoginPage />} />

            <Route path="/register" element={<RegisterPage />} />
            <Route path='/home' element={<HomePage />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editor/:noteId"
              element={
                <ProtectedRoute>
                  <Editor />
                </ProtectedRoute>
              }
            />

          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
