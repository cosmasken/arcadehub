import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center text-sm text-gray-400 mb-6">
      {/* <Link to="/" className="hover:text-white transition-colors">
        Home
      </Link> */}
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = name.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');

        return (
          <div key={name} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-2 text-gray-500" />
            {isLast ? (
              <span className="text-white">{displayName}</span>
            ) : (
              <Link to={routeTo} className="hover:text-white transition-colors">
                {displayName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
