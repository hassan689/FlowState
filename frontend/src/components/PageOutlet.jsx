import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

export default function PageOutlet() {
  const location = useLocation();

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const main = document.querySelector('.main-content');
    if (!main) return;
    main.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [location.pathname]);

  return (
    <div className="page-transition-shell" key={location.pathname}>
      <Outlet />
    </div>
  );
}
