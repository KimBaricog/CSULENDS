import "./browseskeletal.css";
import { useState } from "react";
function BrowseSkeletal({ BrowserText, BrowserItem }) {
  const { browstext, setbrowstext } = useState(true);
  return (
    <>
      <div className="main-loading-container">
        {BrowserText ? <div className="placeholder text"></div> : ""}
        {BrowserItem ? <div className="placeholder item"></div> : ""}
      </div>
    </>
  );
}
export default BrowseSkeletal;
