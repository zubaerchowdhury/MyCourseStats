import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X, Search } from "lucide-react";
import SearchableDropdown from "./SearchableDropdown";
import {
  SearchFilters,
  useSearch,
  getSearchFiltersStrings,
} from "../context/SearchContext";

interface SearchFormProps {
  onSearch?: (params: URLSearchParams) => void;
  showSearchButton?: boolean;
  showClearButton?: boolean;
  className?: string;
}

const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  showSearchButton = true,
  showClearButton = true,
  className = "",
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { filters, setFilters, setSubjectOptions } = useSearch();

  // Initialize filters from URL params if they exist
  useEffect(() => {
    if (searchParams.size === 0) return;

    // Map URL parameters to filters
    let searchFilters: SearchFilters = {
      semester: "",
      year: undefined,
      subjectCode: "",
    };
    searchParams.forEach((value, key) => {
      // Get keyof SearchFilters from key
      const filterKey = key as keyof SearchFilters;
      if (key === "year") {
        searchFilters = {
          ...filters,
          [filterKey]: parseInt(value),
        };
      } else if (key === "days") {
        searchFilters = {
          ...filters,
          [filterKey]: value.split(","),
        };
      } else if (key === "startDate" || key === "endDate") {
        searchFilters = {
          ...filters,
          [filterKey]: new Date(value),
        };
      } else {
        searchFilters = {
          ...filters,
          [filterKey]: value,
        };
      }
    });

    // Set filters state variable
    setFilters(searchFilters);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validation
    if (!filters.name && !filters.semester) {
      alert("Please enter a course name or select a semester");
      return;
    }
    if (!filters.name && !filters.semester && !filters.subjectCode) {
      alert("Please select a subject");
      return;
    }
    if (filters.semester === "Fall-2025") {
      alert("Work in progress: Please select another semester");
      return;
    }

    const params = new URLSearchParams(getSearchFiltersStrings(filters));
    setSearchParams(params);

    if (onSearch) {
      onSearch(params);
    } else {
      navigate(`/search?${params.toString()}`);
    }
  };

  const clearFilters = () => {
    setFilters({
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
      setFilters({
        ...filters,
        semester: semester,
        year: parseInt(year),
        subjectCode: "",
      });
      return;
    }
    setFilters({
      ...filters,
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
            value={filters.name || ""}
            onChange={(e) => setField("name", e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Search by class name..."
          />
          {filters.name && (
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
          <div className="relative flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
              Semester <span className="text-red-400">*</span>
            </label>
            <select
              value={`${filters.semester}-${filters.year}` || ""}
              onChange={(e) => setField("semester", e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-1"
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
            required
            value={filters.subjectCode || ""}
            onChange={(value) => setField("subjectCode", value)}
            placeholder="Select or search for a subject"
            className="flex-1"
          />

          <div className="relative flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
              Catalog Number
            </label>
            <input
              type="text"
              value={filters.catalogNumber || ""}
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

        {showClearButton && Object.values(filters).some((v) => v) && (
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
