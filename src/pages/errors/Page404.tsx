import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logoImage from './../../assets/logo.png';

const Page404 = () => {
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate('/login'); // Puedes cambiar "/login" por la ruta que prefieras
  };
  return (
    <div className="flex flex-col md:flex-row">
      {/* Izquierda */}
      <div className="w-full flex flex-col items-center justify-center p-10 gap-4">
        <h1 className="text-2xl font-bold mb-4"> Iglesia Evangelica Peruana</h1>
        <Box
          component="img"
          alt="profile"
          src={logoImage}
          height="150px"
          width="150px"
          borderRadius="50%"
          sx={{ objectFit: 'cover' }}
        />
        <h5 className="text-3xl font-bold mb-4 text-center">
          PAGINA NO ENCONTRADA
          <br></br>ERROR 404
        </h5>
        <Button variant="contained" color="secondary" onClick={handleGoBack}>
          Volver al login
        </Button>
      </div>
    </div>
  );
};

export default Page404;
