import React, { useState, useEffect } from 'react';
import { TextField, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './../AuthContext';
import logoImage from './../assets/logo.png';
import { Alert } from '@mui/material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate(); // Hook para redirigir
  const { user, login } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await login(email, password); // Ejecuta el login desde el contexto
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    // Si el login es exitoso, el contexto actualizará el estado global y useEffect redirigirá
    navigate('/');
  };

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Izquierda */}
      <div className="md:w-1/2 w-full flex flex-col gap-4 items-center justify-center p-10">
        <h1 className="text-2xl font-bold mb-4"> Iglesia Evangelica Peruana</h1>
        <Box
          component="img"
          alt="profile"
          src={logoImage}
          height="80px"
          width="80px"
          borderRadius="50%"
          sx={{ objectFit: 'cover' }}
        />
        <h3 className="text-4xl font-bold mb-4 text-center">
          ELECCIONES <br></br>GENERALES <br></br>2025
        </h3>
        <p className="text-lg text-center">
          Elegimos con fe y responsabilidad a quienes guiarán<br></br> el rumbo de nuestra iglesia.
        </p>
      </div>

      {/* Derecha */}
      <div className="md:w-1/2 w-full flex items-center justify-center p-10">
        <div className=" bg-white text-black shadow-md rounded px-8 pt-6 pb-8  w-full max-w-md">
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">Iniciar sesión</h3>
            <p>Ingresa tus datos para iniciar sesión.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                type="text"
                label="DNI"
                variant="standard"
                InputProps={{ style: { color: '#000' } }}
                InputLabelProps={{ style: { color: '#000' } }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <TextField
                type="password"
                label="Contraseña"
                InputProps={{ style: { color: '#000' } }}
                InputLabelProps={{ style: { color: '#000' } }}
                variant="standard"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {errorMessage && (
                <Alert severity="error" className="mb-4 bg-red-600">
                  {errorMessage}
                </Alert>
              )}
              <Button type="submit" variant="contained" color="primary">
                Ingresar
              </Button>
            </Box>
          </form>

          <div className="mt-4 text-sm">
            <p className="mt-2 text-gray-500 text-center">Versión 1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
