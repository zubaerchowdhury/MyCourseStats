import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import SearchableDropdown from "../components/SearchableDropdown";

interface searchFilters {
  subjectCode?: string;
  catalogNum?: string;
  semester?: string;
  year?: number;
}

function Home() {
  const navigate = useNavigate();
  const [searchFilters, setsearchFilters] = useState<searchFilters>({
    subjectCode: "",
    catalogNum: "",
    semester: "",
    year: undefined,
  });

  const semesterYearOptions = [
    { value: "", label: "" },
    { value: "Spring-2025", label: "Spring 2025" },
    { value: "Fall-2025", label: "Fall 2025" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (!searchFilters.semester) {
      alert("Please select a semester");
      return;
    }
    if (!searchFilters.subjectCode) {
      alert("Please select a subject");
      return;
    }
    const [semester, year] = searchFilters.semester.split("-");
    params.append("semester", semester);
    params.append("year", year);
    params.append("subjectCode", searchFilters.subjectCode);
    if (searchFilters.catalogNum)
      params.append("catalogNum", searchFilters.catalogNum);

    console.log("Search Params:", params.toString());
    navigate(`/search?${params.toString()}`);
  };

  const setField = (key: keyof searchFilters, value: any) => {
    setsearchFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const params = new URLSearchParams();
  if (searchFilters.semester) {
    const [semester, year] = searchFilters.semester.split("-");
    params.append("semester", semester);
    params.append("year", year);
  }
  const subjectApiUrl = `http://localhost:5184/api/Courses/subjects?${params.toString()}`;

  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Schedule smarter</span>
                <span className="block text-indigo-600"></span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                We help students gauge the popularity of their ideal class
                schedule.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="w-full max-w-2xl">
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Semester <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={searchFilters.semester || ""}
                          onChange={(e) => setField("semester", e.target.value)}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          {semesterYearOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <SearchableDropdown
                        label="Subject"
                        apiUrl={subjectApiUrl}
                        required
                        value={searchFilters.subjectCode || ""}
                        onChange={(value) => setField("subjectCode", value)}
                        placeholder="Select or search for a subject"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <div className="relative flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Catalog Number
                        </label>

                        <input
                          type="text"
                          value={searchFilters.catalogNum || ""}
                          placeholder="e.g. 101"
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="relative flex-1">
                        <button
                          type="submit"
                          className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          Search
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {Object.keys(searchFilters).length > 0 && (
                        <button
                          type="button"
                          onClick={() => setsearchFilters({})}
                          className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src="/Assets/windows-SwHvzwEzCfA-unsplash.jpg"
          alt="Course planning"
        />
      </div>
    </div>
  );
}

export default Home;
