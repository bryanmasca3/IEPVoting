import { useEffect } from 'react';
import logoImage from './../assets/logo.png';
import { useAuth } from './../AuthContext';
import { Box,Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
const Welcome = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Usuario y método de
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, []);

  const handleClick = () => {
    navigate("/votes"); 
  };
  return (
    <div className="flex flex-col md:flex-row">
      {/* Izquierda */}
      <div className="w-full flex flex-col items-center justify-center p-10 gap-4">
        <h1 className="text-3xl font-bold mb-4"> Iglesia Evangelica Peruana</h1>
        <Box
          component="img"
          alt="profile"
          src={logoImage}
          height="150px"
          width="150px"
          borderRadius="50%"
          sx={{ objectFit: 'cover' }}
        />
        <h3 className="text-5xl font-bold mb-4 text-center">
          ELECCIONES <br></br>GENERALES <br></br>2025
        </h3>

        <Box>
        <Button type="submit" variant="contained" color="primary" sx={{
                fontSize: '1.4rem',
                fontWeight: 'bold',
              }} 
              onClick={handleClick}
              >
                VOTAR
              </Button>
        </Box>
      </div>
    </div>
  );
};

export default Welcome;
