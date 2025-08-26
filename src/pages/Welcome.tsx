import logoImage from './../assets/logo.png';
import { Box,Button,useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const handleClick = () => {
    navigate("/votes"); 
  };
  
  return (
    <div className="flex flex-col md:flex-row ">
      {/* Izquierda */}
      <div className="w-full flex flex-col items-center justify-center p-10 gap-6">
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
        <Button type="submit" variant="contained" 
              sx={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                backgroundColor:theme.palette.secondary.main,
                color:"#000"
                
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
