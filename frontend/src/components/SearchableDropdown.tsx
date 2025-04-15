import React, { useState, useEffect, useRef } from "react";
import { useSearch, getSearchFiltersStrings } from "../context/SearchContext";

interface SearchableDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

interface subject {
  name: string;
  code: string;
  semester: string;
  year: number;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  label,
  required = false,
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    filters,
    subjectOptions,
    setSubjectOptions,
    isSubjectLoading,
    setIsSubjectLoading,
  } = useSearch();

  // Fetch options from API or use prop options
  useEffect(() => {
    if (subjectOptions && subjectOptions.length > 0) {
      setSubjectOptions(subjectOptions);
      return;
    }

    // If semester is not selected, don't fetch options
    if (!filters.semester) return;

    const fetchOptions = async () => {
      setIsSubjectLoading(true);
      setError(null);
      const params = new URLSearchParams(getSearchFiltersStrings(filters));
      try {
        const response = await fetch(
          `http://localhost:5184/api/Courses/subjects?${params.toString()}`
        );
        if (!response.ok) {
          if (response.status === 404) {
            setError("No options found for this semester");
            return;
          } else if (response.status >= 500) {
            setError("Server error, please try again later");
            return;
          }
          throw new Error("Failed to fetch options");
        }
        const data = await response.json();

        // Transform data into the expected format
        const transformedData = data.map((item: subject) => ({
          value: item.code,
          label: `${item.name}`,
        }));

        setSubjectOptions(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        console.error("Error fetching options:", err);
      } finally {
        setIsSubjectLoading(false);
      }
    };

    fetchOptions();
  }, [filters.semester]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter options based on search term
  const filteredOptions = subjectOptions.filter(
    (option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get the display value (label) for the selected value
  const selectedOption = subjectOptions.find(
    (option) => option.value === value
  );

  // Determine what to display in the input field
  const getDisplayValue = () => {
    if (isFocused) {
      return searchTerm;
    } else if (selectedOption) {
      return selectedOption.label;
    } else {
      return searchTerm;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      <div className={`relative ${className}`}>
        <input
          type="text"
          value={getDisplayValue()}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            setIsOpen(true);
            // When focusing, initialize searchTerm to empty to allow new search
            setSearchTerm("");
          }}
          onBlur={() => {
            // Don't set isFocused to false immediately to allow click on dropdown items
            if (!isOpen) {
              setIsFocused(false);
              // If user didn't select anything, restore original value
              if (!selectedOption && searchTerm) {
                setSearchTerm("");
              }
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-10 pl-1"
        />
        <div
          className="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer"
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
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

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
          {isSubjectLoading ? (
            <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
          ) : error ? (
            <div className="px-4 py-2 text-sm text-red-500">{error}</div>
          ) : filteredOptions.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              No options found
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-100 ${
                  option.value === value
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-900"
                }`}
                onClick={() => {
                  onChange(option.value);
                  setSearchTerm("");
                  setIsOpen(false);
                  setIsFocused(false);
                }}
              >
                {option.label}
                {option.value === value && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
