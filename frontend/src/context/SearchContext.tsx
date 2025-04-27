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
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  subjectOptions: SubjectOption[];
  setSubjectOptions: (options: SubjectOption[]) => void;
  isSubjectLoading: boolean;
  setIsSubjectLoading: (isLoading: boolean) => void;
}

// Create the context
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Create a provider component
export const SearchProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // States to be shared
  const [filters, setFilters] = useState<SearchFilters>({
    semester: "",
		year: undefined,
		subjectCode: "",
    catalogNumber: ""
  });
  
  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([]);
  const [isSubjectLoading, setIsSubjectLoading] = useState(false);

  // Value object to be passed to provider
  const providerValue = {
    filters,
    setFilters,
    subjectOptions, 
    setSubjectOptions,
    isSubjectLoading,
    setIsSubjectLoading,
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