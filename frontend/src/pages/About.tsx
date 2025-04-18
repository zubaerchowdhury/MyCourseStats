import React from "react";

const About: React.FC = () => {
  return (
    <div className="about-container p-5">
      <div className="flex justify-around gap-5">
        <div className="flex-1 flex flex-col items-center p-4 rounded-lg bg-[#f5f5f5]">
          <img
            src={"/Assets/Marcos.png"}
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

        <div className="flex-1 flex flex-col items-center p-4 rounded-lg bg-[#f5f5f5]">
          <img
            src={"/Assets/Zubaer.png"}
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

        <div className="flex-1 flex flex-col items-center p-4 rounded-lg bg-[#f5f5f5]">
          <img
            src={"/Assets/Hannah.png"}
            alt="Hannah Penano"
            className="w-48 h-auto object-contain"
          />
          <div className="mt-3 text-center">
            <p className="text-center">B.S. Electrical Engineering</p>
            <p className="text-center">Dual Major in Biomedical Engineering</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
