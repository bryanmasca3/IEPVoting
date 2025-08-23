import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './../../AuthContext';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  Box
} from '@mui/material';
interface PrivateRouteProps {
  allowedRoles?: number[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
  const { user, loading  } = useAuth();
  if (loading) {   
    return <Box display={"flex"} height={"100vh"} justifyContent={"center"} alignItems={"center"}
     sx={{
        '& svg': {
          animation: 'spin 1.5s linear infinite',
          fontSize: 50,
        },
        '@keyframes spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      }}><RestartAltIcon/></Box>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.type)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
