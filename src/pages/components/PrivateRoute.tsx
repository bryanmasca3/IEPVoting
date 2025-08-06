import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './../../AuthContext';

interface PrivateRouteProps {
  allowedRoles: string[]; // por ejemplo ['admin'], ['cliente'], etc.
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  console.log('--------------------------');
  console.log(user.type);
  console.log(allowedRoles);
  if (!allowedRoles.includes(user.type)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
