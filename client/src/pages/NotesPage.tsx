import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NotesPage() {
    const { logout } = useAuth();
    
  return (
    <div>
      <h1>Notes</h1>
      <p>TODO: implement notes page</p>
      <Link to="/login" style={{ display: "block", marginTop: "10px" }} onClick={logout}>
        Log out
      </Link>
    </div>
  );
}