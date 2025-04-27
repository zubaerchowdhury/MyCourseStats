import React from "react";
import Zubaer from "/Assets/Zubaer.png"; 
import Hannah from "/Assets/Hannah.png";
import Marcos from "/Assets/Marcos.png";

const About: React.FC = () => {
  return (
    <div className="about-container p-5">
      <div className="flex justify-around gap-5">
        <div className="flex-1 flex flex-col items-center p-4 rounded-lg">
          <img
            src={Marcos}
            alt="Marcos Morales"
            className="w-48 h-auto object-contain"
          />
          <p className="mt-3 text-center">
            <p className="text-center">
              B.S. Computer Engineering – Software Option
            </p>
            <p className="text-center">
              Dual Major in Computer Science – Flexible
            </p>
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center p-4 rounded-lg">
          <img
            src={Zubaer}
            alt="Zubaer Chowdhury"
            className="w-48 h-auto object-contain"
          />
          <p className="mt-3 text-center">
            <p className="text-center">
              B.S. Computer Engineering – Software Option
            </p>
            <p className="text-center">
              Dual Major in Computer Science – Comprehensive
            </p>
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center p-4 rounded-lg">
          <img
            src={Hannah}
            alt="Hannah Penano"
            className="w-48 h-auto object-contain"
          />
          <div className="mt-3 text-center">
            <p className="text-center">B.S. Electrical Engineering</p>
            <p className="text-center">Dual Major in Biomedical Engineering</p>
          </div>
        </div>
      </div>
      {/* Add description section */}
      <div className="mt-8 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-semibold mb-4">About Us</h2>
        <p className="text-gray-600">
          We are a team of Electrical and Computer Engineering students from
          University of Miami's Class of 2025. Our goal is to help students make
          informed decisions about their course selections by providing
          historical enrollment data and trends in an intuitive and easily
          digestable format.
        </p>
      </div>
    </div>
  );
};

export default About;
