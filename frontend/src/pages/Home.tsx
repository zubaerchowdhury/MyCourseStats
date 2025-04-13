import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, X, Filter } from 'lucide-react';
import Select from 'react';
//import { Dropdown } from '../components/Dropdown';

type SearchCategory = 'class_name' | 'class_code' | 'department' | 'instructor';

interface searchFilters {
  subject?: [string, string];
  catalogNum?: number;
  semester?: string;
  year?: number;
}

function Home() {
  //const [searchQuery, setSearchQuery] = useState<string>('');
  //const [searchCategory, setSearchCategory] = useState<SearchCategory>('class_name');
  //const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [searchFilters, setsearchFilters] = useState<searchFilters>({});
  const navigate = useNavigate();
  const searchCategories: { value: SearchCategory; label: string; placeholder?: string }[] = [
    { value: 'class_name', label: 'Class Name', placeholder: 'Search by class name...' },
    { value: 'class_code', label: 'Class Code', placeholder: 'Search class code (e.g., CS101)...' },
    { value: 'department', label: 'Department', placeholder: 'Search by department (e.g., )...' },
    { value: 'instructor', label: 'Instructor', placeholder: 'Search by instructor full name...' },
  ];

  const semesterYearOptions = [
    { value: 'spring-2025', label: 'Spring 2025' },
    { value: 'fall-2025', label: 'Fall 2025' },
  ];

  const handleSearch = () => {
    if (searchFilters.semester && searchFilters.year && searchFilters.subject && searchFilters.catalogNum) {
      navigate(`/results?semester=${searchFilters.semester}&year=${searchFilters.year.toString()}&subject=${searchFilters.subject.join('')}&catalogNum=${searchFilters.catalogNum.toString()}`);
      // Convert all values to strings for URLSearchParams
    }
  };

  const setField = (key: keyof searchFilters, value: any) => {
    setsearchFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  //const currentCategory = searchCategories.find(cat => cat.value === searchCategory);

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
                We help students gauge the popularity of their ideal class schedule.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="w-full max-w-2xl">
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div className="flex gap-2">
                    <div className="relative flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Semester & Year
                      </label>
                      <select
                        value={searchFilters.semester || ''}
                        onChange={(e) => setField('semester', e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">Any</option>
                        {semesterYearOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                      <div className="relative flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subject
                        </label>
                        <select
                          value={searchFilters.subject || ''}
                          onChange={(value) => setsearchFilters({searchFilters, subject: value})}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          <option value="">Any</option>
                          <option value="ECE">ECE</option>
                          <option value="BME">BME</option>
                          <option value="MTH">MTH</option>
                          <option value="CHM">CHM</option>
                        </select>
                      </div>
                      <div className="relative flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Catalog Number
                        </label>
                        
                          <input
                            type="number"
                            value={searchFilters.catalogNum || ''}
                            onChange={(e) => 
                              setField('catalogNum', e.target.value ? Number(e.target.value) : undefined)
                            }
                            placeholder="e.g. 101"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                          <button
                            type="submit"
                            onClick={() => handleSearch}
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
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80"
          alt="Team working on project"
        />
      </div>
    </div>
  );
}

export default Home;