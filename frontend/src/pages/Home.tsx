import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, X, Filter } from 'lucide-react';
import Select from 'react';

type SearchCategory = 'class_name' | 'class_code' | 'department' | 'instructor';

interface AdvancedSearchFilters {
  subject?: [string, string];
  catalogNum?: number;
  name?: string;
  days?: string[];
  timeStart?: Date;
  timeEnd?: Date;
  instructor?: string[];
  semester?: string[];
}

function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchCategory, setSearchCategory] = useState<SearchCategory>('class_name');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedSearchFilters>({});
  const navigate = useNavigate();

  const searchCategories: { value: SearchCategory; label: string; placeholder?: string }[] = [
    { value: 'class_name', label: 'Class Name', placeholder: 'Search by class name...' },
    { value: 'class_code', label: 'Class Code', placeholder: 'Enter class code (e.g., CS101)...' },
    { value: 'department', label: 'Department', placeholder: 'Search by department...' },
    { value: 'instructor', label: 'Instructor', placeholder: 'Search by instructor name...' },
  ];

  const daysOptions = [
    { value: 'Mon', label: 'Monday' },
    { value: 'Tue', label: 'Tuesday' },
    { value: 'Wed', label: 'Wednesday' },
    { value: 'Thu', label: 'Thursday' },
    { value: 'Fri', label: 'Friday' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Convert all values to strings for URLSearchParams
      const params: Record<string, string> = {
        q: searchQuery,
        category: searchCategory,
      };

      if (isAdvancedOpen) {
        if (advancedFilters.subject?.length) {
          params.subject = advancedFilters.subject.join(',');
        }
        if (advancedFilters.catalogNum !== undefined) {
          params.catalogNum = advancedFilters.catalogNum.toString();
        }
        if (advancedFilters.name) {
          params.name = advancedFilters.name;
        }
        if (advancedFilters.days?.length) {
          params.days = advancedFilters.days.join(',');
        }
        if (advancedFilters.timeStart) {
          params.timeStart = advancedFilters.timeStart.toString();
        }
        if (advancedFilters.timeEnd) {
          params.timeEnd = advancedFilters.timeEnd.toString();
        }
        if (advancedFilters.instructor?.length) {
          params.instructor = advancedFilters.instructor.join(',');
        }
        if (advancedFilters.semester?.length) {
          params.daysOfWeek = advancedFilters.semester.join(',');
        }
        params.advanced = 'true';
      }

      const queryParams = new URLSearchParams(params);
      navigate(`/search?${queryParams.toString()}`);
    }
  };

  const handleAdvancedFilterChange = (key: keyof AdvancedSearchFilters, value: any) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const currentCategory = searchCategories.find(cat => cat.value === searchCategory);

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
                        <input
                          type="text"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent shadow-sm text-base placeholder-gray-500"
                          placeholder={currentCategory?.placeholder || 'Search...'}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button 
                          type="submit"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
                        >
                          <Search className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="relative">
                        <select
                          value={searchCategory}
                          onChange={(e) => setSearchCategory(e.target.value as SearchCategory)}
                          className="h-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent shadow-sm text-base bg-white appearance-none pr-10"
                        >
                          {searchCategories.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                        className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        <Filter className="h-4 w-4 mr-1" />
                        {isAdvancedOpen ? 'Hide Advanced Search' : 'Show Advanced Search'}
                      </button>
                      {Object.keys(advancedFilters).length > 0 && (
                        <button
                          type="button"
                          onClick={() => setAdvancedFilters({})}
                          className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Clear Filters
                        </button>
                      )}
                    </div>

                    {isAdvancedOpen && (
                      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Subject
                            </label>
                            <select
                              value={advancedFilters.subject || ''}
                              onChange={(e) => handleAdvancedFilterChange('subject', e.target.value)}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                              <option value="">Any</option>
                              <option value="ECE">Electrical and Computer Engineering</option>
                              <option value="BME">Biomedical Engineering</option>
                              <option value="MTH">Mathematics</option>
                              <option value="CHM">Chemistry</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Catalog Number
                            </label>
                            <input
                              type="number"
                              value={advancedFilters.catalogNum || ''}
                              onChange={(e) => 
                                handleAdvancedFilterChange('catalogNum', e.target.value ? Number(e.target.value) : undefined)}
                              placeholder="e.g. 101"
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Keyword
                            </label>
                            <input
                              type="string"
                              value={advancedFilters.catalogNum || ''}
                              onChange={(e) => 
                                handleAdvancedFilterChange('name', e.target.value || undefined)}
                              placeholder="e.g. Calculus"
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Days
                            </label>
                            <Select
                              isMulti
                              name="days"
                              options={daysOptions}
                              value={daysOptions.filter(option =>
                                (advancedFilters.days || []).includes(option.value)
                              )}
                              onChange={(e) => 
                                handleAdvancedFilterChange('days', 
                                  e.map((option) => option.value)
                                )
                              }
                              className="basic-multi-select"
                              classNamePrefix="select"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Time of Day
                            </label>
                            <select
                              value={advancedFilters.timeOfDay || ''}
                              onChange={(e) => handleAdvancedFilterChange('timeOfDay', e.target.value)}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                              <option value="">Any</option>
                              <option value="morning">Morning (8AM - 12PM)</option>
                              <option value="afternoon">Afternoon (12PM - 4PM)</option>
                              <option value="evening">Evening (4PM - 8PM)</option>
                            </select>
                          </div>
                          
                          
                        </div>
                      </div>
                    )}
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