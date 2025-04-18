import React, { useState } from 'react';

interface Option {
  value: string;
  label: string;
}

const daysOfWeek: Option[] = [
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' }
];

const DropdownMultipleSelect: React.FC = () => {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (value: string) => {
    if (selectedDays.includes(value)) {
      setSelectedDays(selectedDays.filter((day) => day !== value));
    } else {
      setSelectedDays([...selectedDays, value]);
    }
  };

  return (
    <div className="dropdown-container">
      <div className="dropdown-header" onClick={toggleDropdown}>
        {selectedDays.length === 0
          ? 'Select days'
          : selectedDays.map((day) => daysOfWeek.find((d) => d.value === day)?.label).join(', ')}
        <span className={`arrow ${isOpen ? 'open' : ''}`}></span>
      </div>
      {isOpen && (
        <ul className="dropdown-list">
          {daysOfWeek.map((day) => (
            <li
              key={day.value}
              className={`dropdown-option ${selectedDays.includes(day.value) ? 'selected' : ''}`}
              onClick={() => handleOptionClick(day.value)}
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
      )}
    </div>
  );
};

export default DropdownMultipleSelect;