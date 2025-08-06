import React, { useState, useEffect } from 'react';
import {
  TextField,
  MenuItem,
  Button,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  Box,
  TableHead,
  TableRow,
  TableContainer,
  useTheme,
} from '@mui/material';
import { Alert, AlertColor } from '@mui/material';

import { getUsers, createUsers } from './../services/supabaseService';
import { MailOutline, LockOutlined, BadgeOutlined, Padding } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useAuth } from './../context/AuthContext';
import { useNavigate } from 'react-router-dom';
const Voters = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    dni: '',
    password: '',
    sede: '',
    email: '',
  });
  const [users, setUsers] = useState([]);
  const [voters, setVoters] = useState([]);
  const [message, setMessage] = useState<{ type: AlertColor; text: string } | null>(null);

  const { user, logout } = useAuth(); // Usuario y método de
  //
  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
      console.log(data);
    } catch (error) {
      console.error('Error al obtener candidatos:', error);
    }
  };
  useEffect(() => {
    // Si no hay usuario autenticado, redirige a login
    /*     if (!user) {
      navigate('/login');
      return;
    }
 */
    loadUsers();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    // Simular guardado (puedes reemplazar con Supabase, backend, etc.)
    try {
      const result = await createUsers(formData);
      setFormData({
        first_name: '',
        last_name: '',
        dni: '',
        password: '',
        sede: '',
        email: '',
      });
      console.log('Votante creado:', result);
      await loadUsers();
      setMessage({ type: 'success', text: 'Votante creado correctamente.' });
    } catch (error) {
      console.error('Error al crear votante:', error);
      setMessage({ type: 'error', text: 'Ocurrió un error al crear el votante.' });
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const columns: GridColDef[] = [
    { field: 'first_name', headerName: 'Nombre' },
    { field: 'last_name', headerName: 'Apellido' },
    { field: 'dni', headerName: 'DNI' },
    { field: 'sede', headerName: 'Sede' },
  ];
  return (
    <div className="p-4">
      {message && (
        <Alert
          severity={message.type}
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}
          onClose={() => setMessage(null)} // Permite cerrar el mensaje manualmente
        >
          {message.text}
        </Alert>
      )}
      <Box className="flex flex-col gap-4">
        <Box sx={{ backgroundColor: theme.palette.background.alt, padding: '1rem' }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <TextField
                fullWidth
                label="Nombre"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Apellido"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
            <div className="flex gap-4">
              <TextField
                fullWidth
                label="DNI"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeOutlined />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                select
                fullWidth
                label="Sede"
                name="sede"
                value={formData.sede}
                onChange={handleChange}
              >
                <MenuItem value="San Martin">San Martin</MenuItem>
                <MenuItem value="Alto Cayma">Alto Cayma</MenuItem>
                <MenuItem value="Buenos Aires">Buenos Aires</MenuItem>
              </TextField>
            </div>

            <Button variant="contained" color="primary" fullWidth type="submit">
              Guardar Votante
            </Button>
          </form>
        </Box>
        {/* TABLA DE VOTANTES */}
        <Box
          sx={{
            backgroundColor: theme.palette.background.alt,
            padding: '1rem',
            height: 500, // puedes ajustar este alto según tu diseño
            width: '100%', // asegura que no se desborde
            maxWidth: '100%',
            overflowX: 'auto', // agrega scroll si hay desborde horizontal
          }}
        >
          <DataGrid rows={users || []} columns={columns} pageSize={5} />
        </Box>
      </Box>
    </div>
  );
};

export default Voters;
