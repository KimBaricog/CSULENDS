function CSULends_Logo() {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          color: "var(--primary-font-color)",
        }}
        className="logo_container"
      >
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "10px",
            backgroundColor: "var(--accent-color)",
          }}
          className="yellow-box"
        ></div>
        <p style={{ fontSize: "20px", fontWeight: "bold" }}>CSULends</p>
      </div>
    </>
  );
}

export default CSULends_Logo;
