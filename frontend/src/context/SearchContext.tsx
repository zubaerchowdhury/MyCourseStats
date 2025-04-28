import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of our search filters
export interface SearchFilters {
  semester: string;
	year: number | undefined;
	subjectCode: string;
  catalogNumber?: string;
	name?: string;
	days?: string[];
	instructor?: string;
	startDate?: Date;
	endDate?: Date;
  classNumber?: number;
}

export const getSearchFiltersStrings = (filters: SearchFilters) => {
	let result = {}
	Object.entries(filters).forEach(([key, value]) => {
		if (value && value.toString() !== "") {
			result = {
				...result,
				[key]: value.toString()};
		}
	});
	return result;
}

// Define the shape of our subject options
export interface SubjectOption {
  value: string;
  label: string;
}

interface SearchContextType {
  subjectOptions: SubjectOption[];
  setSubjectOptions: (options: SubjectOption[]) => void;
}

// Create the context
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Create a provider component
export const SearchProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // States to be shared
  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([]);

  // Value object to be passed to provider
  const providerValue = {
    subjectOptions, 
    setSubjectOptions,
  };

  return (
    <SearchContext.Provider value={providerValue}>
      {children}
    </SearchContext.Provider>
  );
};

// Custom hook to use the search context
export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};