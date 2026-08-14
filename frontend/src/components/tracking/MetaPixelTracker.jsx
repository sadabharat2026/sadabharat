import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackMetaPageView } from '../../utils/metaPixel';

/**
 * Fires Meta Pixel PageView on React Router navigations (SPA).
 * Skips the first load because index.html already sends the initial PageView.
 * Skips /admin and /vendor routes.
 */
const MetaPixelTracker = () => {
  const location = useLocation();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      // Still skip admin/vendor if user landed directly there
      return;
    }

    trackMetaPageView(location.pathname);
  }, [location.pathname, location.search]);

  return null;
};

export default MetaPixelTracker;
