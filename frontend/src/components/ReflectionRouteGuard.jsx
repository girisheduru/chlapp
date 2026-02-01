import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Reflection from '../pages/Reflection';

/**
 * Renders Reflection only when the user arrived via a habit tile (state.fromHabitTile and state.habit).
 * Otherwise redirects to Home.
 */
export function ReflectionRouteGuard() {
  const location = useLocation();
  const navigate = useNavigate();
  const allowed = location.state?.fromHabitTile === true && location.state?.habit != null;

  useEffect(() => {
    if (!allowed) {
      navigate('/', { replace: true });
    }
  }, [allowed, navigate]);

  if (!allowed) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        color: '#6B5D4D',
      }}>
        Redirecting to Home…
      </div>
    );
  }

  return <Reflection />;
}

export default ReflectionRouteGuard;
