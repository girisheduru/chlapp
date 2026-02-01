import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DailyCheckIn from '../pages/DailyCheckIn';

/**
 * Renders Daily Check-In only when the user arrived via a habit tile (state.fromHabitTile).
 * Otherwise redirects to Home so check-in is not accessible from the nav or direct URL.
 */
export function CheckInRouteGuard() {
  const location = useLocation();
  const navigate = useNavigate();
  const allowed = location.state?.fromHabitTile === true;

  useEffect(() => {
    if (!allowed) {
      navigate('/', { replace: true });
    }
  }, [allowed, navigate]);

  if (!allowed) {
    return null;
  }

  return <DailyCheckIn />;
}

export default CheckInRouteGuard;
