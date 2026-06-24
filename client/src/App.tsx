import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";

import {
  LoginPage,
  RegisterPage,
} from "@/pages/authPages";
import { HomePage, MyNotesPage, MyPinsPage } from "@/pages/homePages";
import Editor from "@/pages/notesPages/Editor";

function App() {
  return (
    <BrowserRouter useTransitions={false}>
      <AuthProvider>
        <AppShell>
          <Routes>
            <Route path="/" element={<LoginPage />} />

            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mynotes"
              element={
                <ProtectedRoute>
                  <MyNotesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mypins"
              element={
                <ProtectedRoute>
                  <MyPinsPage />
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
        </AppShell>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
