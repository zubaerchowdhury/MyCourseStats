import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import SearchableDropdown from "./SearchableDropdown";
import { SearchFilters, useSearch } from "../context/SearchContext";

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
  const [searchParams] = useSearchParams();

  const { filters, setFilters, setSubjectOptions } = useSearch();

  // Initialize filters from URL params if they exist
  useEffect(() => {
    const subjectCode = searchParams.get("subjectCode");
    const catalogNum = searchParams.get("catalogNum");
    const semester = searchParams.get("semester");
    const year = searchParams.get("year");

    if (subjectCode || catalogNum || semester) {
      setFilters({
        subjectCode: subjectCode || "",
        catalogNum: catalogNum || "",
        semester: semester && year ? `${semester}-${year}` : "",
      });
    }
  }, [searchParams, setFilters]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validation
    if (!filters.semester) {
      alert("Please select a semester");
      return;
    }
    if (!filters.subjectCode) {
      alert("Please select a subject");
      return;
    }

    const params = new URLSearchParams();
    const [semester, year] = filters.semester.split("-");
    params.append("semester", semester);
    params.append("year", year);
    params.append("subjectCode", filters.subjectCode);
    if (filters.catalogNum) params.append("catalogNum", filters.catalogNum);

    if (onSearch) {
      onSearch(params);
    } else {
      navigate(`/search?${params.toString()}`);
    }
  };

  const clearFilters = () => {
    setFilters({
      subjectCode: "",
      catalogNum: "",
      semester: "",
    });
		setSubjectOptions([])
  };

  const setField = (field: keyof SearchFilters, value: any) => {
    if (field === "semester") {
      setSubjectOptions([]);
			setFilters({
				...filters,
				subjectCode: "",
				[field]: value,
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
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
              Semester <span className="text-red-400">*</span>
            </label>
            <select
              value={filters.semester || ""}
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
              value={filters.catalogNum || ""}
              onChange={(e) => setField("catalogNum", e.target.value)}
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
