import "./style/Logbtn.css";
import { useNavigate } from "react-router-dom";

function Log_Button() {
  const navigate = useNavigate();

  function handleLogin() {
    // Perform and validate login first.
    navigate("/login");
  }

  return (
    <>
      <div className="Logbtn-container">
        <button id="LoginBtn" onClick={handleLogin}>
          Login
        </button>
        <button id="CreateBtn">Create account</button>
      </div>
    </>
  );
}
export default Log_Button;
