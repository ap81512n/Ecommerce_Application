// give me code for loader component in react with bootstrap spinner
import React from "react";
const Loader = () => {
  return (
    <div className="d-flex justify--center align-items-center" style={{ height: "100vh" }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}


export default Loader;