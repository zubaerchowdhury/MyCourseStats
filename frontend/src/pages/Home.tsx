import { useNavigate } from "react-router-dom";
import SearchForm from "../components/SearchForm";

function Home() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-full flex-grow relative overflow-hidden">
      <div className="max-w-7xl mr-auto">
        <div className="relative z-10 pb-8 bg-gray-100 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-100 lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Schedule smarter</span>
                <span className="block text-indigo-600"></span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Discover the popularity of your perfect class schedule
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="w-full max-w-2xl">
                  <SearchForm
                    onSearch={(params: URLSearchParams) =>
                      navigate(`/search?${params.toString()}`)
                    }
                  />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="flex-grow lg:block lg:absolute lg:inset-y-0 lg:right-0 lg:w-[45%]">
        <img
          className="h-full w-full object-cover lg:w-full lg:h-full"
          src="/Assets/windows-SwHvzwEzCfA-unsplash.jpg"
          alt="Course planning"
        />
      </div>
    </div>
  );
}

export default Home;