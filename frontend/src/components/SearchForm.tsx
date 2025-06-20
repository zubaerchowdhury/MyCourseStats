import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { X, Search, Filter } from "lucide-react";
import SearchableDropdown from "./SearchableDropdown";
import {
  SearchFilters,
  useSearch,
  getSearchFiltersStrings,
} from "../context/SearchContext";
import MultiSelectDropdown from "./MultiSelectDropdown";

interface SearchFormProps {
  onSearch?: (params: URLSearchParams) => void;
  showSearchButton?: boolean;
  showClearButton?: boolean;
  className?: string;
}

interface AdvancedSearchFilters {
  days?: string[];
  instructor?: string;
  startDate?: Date;
  endDate?: Date;
  classNumber?: number;
}

const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  showSearchButton = true,
  showClearButton = true,
  className = "",
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setSubjectOptions } = useSearch();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedSearchFilters>(
    {}
  );
	const [searchFilters, setSearchFilters] = useState<SearchFilters>({
		semester: "",
		year: undefined,
		subjectCode: "",
	});

  // Initialize filters from URL params if they exist
  useEffect(() => {
    if (searchParams.size === 0) return;

    // Map URL parameters to filters
    let tempFilters: SearchFilters = {
      semester: "",
      year: undefined,
      subjectCode: "",
    };
    searchParams.forEach((value, key) => {
      // Get keyof SearchFilters from key
      const filterKey = key as keyof SearchFilters;
      if (filterKey === "year") {
        tempFilters = {
          ...tempFilters,
          [filterKey]: parseInt(value),
        };
      } else if (filterKey === "days") {
        tempFilters = {
          ...tempFilters,
          [filterKey]: value.split(","),
        };
      } else if (filterKey === "startDate" || filterKey === "endDate") {
        tempFilters = {
          ...tempFilters,
          [filterKey]: new Date(value),
        };
      } else {
        tempFilters = {
          ...tempFilters,
          [filterKey]: value,
        };
      }
    });
    // Set form filters
    setSearchFilters(tempFilters);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validation
    if (!searchFilters.semester) {
      alert("Please select a semester");
      return;
    }
    if (!searchFilters.subjectCode) {
      alert("Please select a subject");
      return;
    }

    const params = new URLSearchParams(getSearchFiltersStrings(searchFilters));
    setSearchParams(params);

    if (onSearch) {
      onSearch(params);
    }
  };

  const clearFilters = () => {
		setSearchFilters({
			semester: "",
			year: undefined,
			subjectCode: "",
		});
    setSubjectOptions([]);
  };

  const setField = (field: keyof SearchFilters, value: any) => {
    if (field === "semester") {
      setSubjectOptions([]);
      const [semester, year] = value.split("-");
      setSearchFilters({
        ...searchFilters,
        semester: semester,
        year: parseInt(year),
        subjectCode: "",
      });
      return;
    }
    setSearchFilters({
      ...searchFilters,
      [field]: value,
    });
  };

  const semesterYearOptions = [
    { value: "", label: "Select semester" },
    { value: "Spring-2025", label: "Spring 2025" },
    { value: "Fall-2025", label: "Fall 2025" },
  ];

  return (
    <div className={className}>
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchFilters.name || ""}
            onChange={(e) => setField("name", e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Search by class name..."
          />
          {searchFilters.name && (
            <button
              type="button"
              onClick={() => setField("name", "")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-grow-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
              Semester <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                value={`${searchFilters.semester}-${searchFilters.year}` || ""}
                onChange={(e) => setField("semester", e.target.value)}
                className={`w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-10 pl-1 appearance-none ${
                  searchFilters.semester ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {semesterYearOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 111.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <SearchableDropdown
            label="Subject"
            required
            value={searchFilters.subjectCode || ""}
            onChange={(value) => setField("subjectCode", value)}
						searchFilters={searchFilters}
            placeholder="Select or search for a subject"
          />

          <div className="relative flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
              Catalog #
            </label>
            <input
              type="text"
              value={searchFilters.catalogNumber || ""}
              onChange={(e) => setField("catalogNumber", e.target.value)}
              placeholder="e.g. 101"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-1"
            />
          </div>

          {showSearchButton && (
            <div className="relative flex-none self-end">
              <button
                type="submit"
                className="h-10 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Search
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
          >
            <Filter className="h-4 w-4 mr-1" />
            {isAdvancedOpen ? "Hide Advanced Search" : "Show Advanced Search"}
          </button>
          {Object.keys(advancedFilters).length > 0 && (
            <button
              type="button"
              onClick={() => setAdvancedFilters({})}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
            ></button>
          )}
        </div>

        {isAdvancedOpen && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
              <MultiSelectDropdown
                value={searchFilters.days || []} // Pass the days array from searchFilters
                onChange={(values) => setField("days", values)} // Receive the full array
              />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                  Instructor
                </label>
                <input
                  type="text"
                  value={searchFilters.instructor || ""}
                  onChange={(e) => setField("instructor", e.target.value)}
                  placeholder="e.g. Lokesh Ramamoorthi"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                    Class Number
                  </label>
                  <input
                    type="text"
                    value={searchFilters.classNumber || ""}
                    onChange={(e) => setField("classNumber", e.target.value)}
                    placeholder="e.g. 8888"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {showClearButton && Object.values(searchFilters).some((v) => v) && (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchForm;
