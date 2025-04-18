import React from "react";
import Marcos from "../Assets/Marcos.png";
import Zubaer from "../Assets/Zubaer.png";
import Hannah from "../Assets/Hannah.png";

const About: React.FC = () => {
  return (
    <div className="about-container" style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          flexDirection: "row",
          gap: "20px",
        }}
      >
        <div
          style={{
            flex: 1,
            textAlign: "center",
            padding: "15px",
            borderRadius: "8px",
            backgroundColor: "#f5f5f5",
          }}
        >
          <img
            src={Marcos}
            alt="Marcos"
            style={{ maxWidth: "200px", height: "auto" }}
          />
          <p style={{ marginTop: "10px" }}>placeholderText1</p>
        </div>

        <div
          style={{
            flex: 1,
            textAlign: "center",
            padding: "15px",
            borderRadius: "8px",
            backgroundColor: "#f5f5f5",
          }}
        >
          <img
            src={Zubaer}
            alt="Zubaer"
            style={{ maxWidth: "200px", height: "auto" }}
          />
          <p style={{ marginTop: "10px" }}>placeholderText2</p>
        </div>

        <div
          style={{
            flex: 1,
            textAlign: "center",
            padding: "15px",
            borderRadius: "8px",
            backgroundColor: "#f5f5f5",
          }}
        >
          <img
            src={Hannah}
            alt="Hannah"
            style={{ maxWidth: "200px", height: "auto" }}
          />
          <p style={{ marginTop: "10px" }}>placeholderText3</p>
        </div>
      </div>
    </div>
  );
};

export default About;
