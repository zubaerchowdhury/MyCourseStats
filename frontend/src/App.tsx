import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { SearchProvider } from "./context/SearchContext";
import Home from "./pages/Home";
import About from "./pages/About";
import SearchResults from "./pages/SearchResults";
import CourseDetails from "./pages/CourseDetails";
import MCS_logo2 from "/Assets/MCS_logo2.png";

function App() {
  return (
    <SearchProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-white">
          {/* Navigation */}
          <nav className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="flex items-center">
                  <img
                    src={MCS_logo2}
                    alt="My Logo"
                    style={{ height: "40px" }}
                  />
                  <span className="ml-2 text-xl font-bold text-gray-900">
                    <Link to="/" className="hover:text-gray-900">
                      MyCourseStats
                    </Link>
                  </span>
                </div>
                <div className="hidden md:flex items-center space-x-8">
                  <Link
                    to="/about"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
                  >
                    About
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/course" element={<CourseDetails />} />
          </Routes>

          {/* Footer */}
          <footer className="bg-white border-t py-3 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
              <p className="text-center text-base text-gray-400">
                &copy; 2025 MyCourseStats. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </SearchProvider>
  );
}

export default App;
