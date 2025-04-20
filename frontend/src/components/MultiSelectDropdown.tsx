import React, { useEffect, useState, useRef } from "react";

interface DropdownMultipleSelectProps {
  value?: string[];
  onChange: (value: string[]) => void;
}
interface Option {
  value: string;
  label: string;
}

const daysOfWeek: Option[] = [
  { value: "Monday", label: " Monday" },
  { value: "Tuesday", label: " Tuesday" },
  { value: "Wednesday", label: " Wednesday" },
  { value: "Thursday", label: " Thursday" },
  { value: "Friday", label: " Friday" },
  { value: "Saturday", label: " Saturday" },
  { value: "Sunday", label: " Sunday" },
];

const DropdownMultipleSelect: React.FC<DropdownMultipleSelectProps> = ({
  value = [],
  onChange,
}) => {
  const [selectedDays, setSelectedDays] = useState<string[]>(value);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    setSelectedDays(value);
  }, [value]);

  const handleOptionClick = (day: string) => {
    let newSelectedDays: string[];
    if (selectedDays.includes(day)) {
      newSelectedDays = selectedDays.filter((d) => d !== day);
    } else {
      newSelectedDays = [...selectedDays, day];
    }
    setSelectedDays(newSelectedDays);
    onChange(newSelectedDays); // Call onChange with full array
  };

  // Update handleSelectAll too
  const handleSelectAll = () => {
    let newSelectedDays: string[];
    if (selectedDays.length === daysOfWeek.length) {
      newSelectedDays = [];
    } else {
      newSelectedDays = daysOfWeek.map((day) => day.value);
    }
    setSelectedDays(newSelectedDays);
    onChange(newSelectedDays); // Call onChange with full array
  };

  const allDaysSelected = selectedDays.length === daysOfWeek.length;

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

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
        Days
      </label>
      <div
        className="flex items-center justify-between w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-1 appearance-none"
        onClick={toggleDropdown}
      >
        <span
          className={
            selectedDays.length === 0 ? "text-gray-400" : "text-gray-900"
          }
        >
          {selectedDays.length === 0
            ? "Select days"
            : selectedDays.length === daysOfWeek.length
            ? "All days selected"
            : selectedDays
                .map((day) =>
                  daysOfWeek
                    .find((option) => option.value === day)
                    ?.label.substring(0, 3)
                )
                .join(", ")}
        </span>
        <svg
          className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0"
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
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
          <ul className="dropdown-list px-4 py-2 text-sm text-gray-500">
            <li
              className={`dropdown-option ${allDaysSelected ? "selected" : ""}`}
              onClick={handleSelectAll}
            >
              <input type="checkbox" checked={allDaysSelected} readOnly />
              <span className="font-medium"> Select All</span>
            </li>

            {daysOfWeek.map((day) => (
              <li
                key={day.value}
                className={`dropdown-option ${
                  selectedDays.includes(day.value) ? "selected" : ""
                }`}
                onClick={() => {
                  handleOptionClick(day.value);
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedDays.includes(day.value)}
                  readOnly
                />
                {day.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropdownMultipleSelect;
