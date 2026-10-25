import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Browse from "./pages/Browse";
import ProtectedRoute from "./components/ProtectedRoute";

// Temporary page for routes you have not built yet.
// Replace each one with the real page when it is ready.
function ComingSoon({ title }) {
  return (
    <div style={{ padding: "80px 24px", textAlign: "center" }}>
      <h1>{title}</h1>
      <p>This page is coming soon.</p>
      <Link to="/">Back to home</Link>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/forgot-password"
          element={<ComingSoon title="Forgot password" />}
        />
        <Route element={<ProtectedRoute />}>
          <Route path="/browse" element={<Browse />} />
          <Route
            path="/requests"
            element={<ComingSoon title="My requests" />}
          />
          <Route path="/lend" element={<ComingSoon title="Lend an item" />} />
        </Route>
        <Route path="*" element={<ComingSoon title="Page not found" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
