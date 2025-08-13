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
  Typography,
} from '@mui/material';
import { Alert, AlertColor } from '@mui/material';
import { Switch } from '@mui/material';
import CustomModal from './components/ModalCustom';

import { getUsers, createUsers, updateUserState, deleteUsers } from './../services/supabaseService';
import { MailOutline, LockOutlined, BadgeOutlined, Padding } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useAuth } from './../AuthContext';
import { useNavigate } from 'react-router-dom';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
const Voters = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [ToDelete, setToDelete] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    dni: '',
    password: '',
    sede: '',
    email: '',
    type: '0',
  });
  const [users, setUsers] = useState([]);
  const [voters, setVoters] = useState([]);
  const [message, setMessage] = useState<{ type: AlertColor; text: string } | null>(null);

  const { user, logout } = useAuth(); // Usuario y método de
  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setToDelete(null);
  };
  const handleOpenDeleteModal = (candidate) => {
    setToDelete(candidate);
    setOpenDeleteModal(true);
  };
  const handleDeleteModal = async () => {
    try {
      console.log('Eliminando usuario:', ToDelete);
      await deleteUsers(ToDelete.id);
      setOpenDeleteModal(false);
      setToDelete(null);
      await loadUsers();

      setMessage({ type: 'success', text: 'Usuario eliminado correctamente.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setOpenDeleteModal(false);
      setToDelete(null);
      setMessage({
        type: 'error',
        text: error.message || 'Hubo un error al eliminar el posicion.',
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };
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
    if (!user) {
      navigate('/login');
      return;
    }

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
        type: '0',
      });
      console.log('Votante creado:', result);
      await loadUsers();
      setMessage({ type: 'success', text: 'Votante creado correctamente.' });
    } catch (error) {
      console.error('Error al crear votante:', error);
      setMessage({ type: 'error', text: error.message || 'Ocurrió un error al crear el votante.' });
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const columns: GridColDef[] = [
    {
      field: 'first_name',
      headerName: 'Nombre',
      flex: 1,
      valueGetter: (data) => data.toUpperCase(),
    },
    {
      field: 'last_name',
      headerName: 'Apellido',
      flex: 1,
      valueGetter: (data) => data.toUpperCase(),
    },
    { field: 'dni', headerName: 'DNI', flex: 1, valueGetter: (data) => data.toUpperCase() },
    { field: 'sede', headerName: 'Sede', flex: 1, valueGetter: (data) => data.toUpperCase() },
    {
      field: 'type',
      headerName: 'Tipo',
      flex: 1,
      valueGetter: (type) => {
        return type === '1' || type === 1 ? 'ADMINISTRADOR' : 'VOTANTE';
      },
    },
    {
      field: 'state',
      headerName: 'Asistencia',
      width: 80,
      renderCell: (params) => {
        console.log(params.row.state);
        const [checked, setChecked] = React.useState(params.row.state == true);

        const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
          try {
            setChecked(event.target.checked);
            await updateUserState({ id_user: params.row.id, state: event.target.checked });
          } catch (error) {
            console.error('Error al crear votante:', error);
            setMessage({ type: 'error', text: 'Ocurrió un error al crear el votante.' });
          }
        };

        return (
          <Switch
            checked={checked}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        );
      },
    },
    {
      field: '-',
      headerName: '',
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <DeleteForeverIcon
          onClick={() => handleOpenDeleteModal(params.row)}
          sx={{ cursor: 'pointer' }}
        />
      ),
    },
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
      <CustomModal open={openDeleteModal} onClose={handleCloseDeleteModal} width={400}>
        <Typography variant="h6" className="mb-4">
          ¿Estás seguro que deseas eliminar la posicion?
        </Typography>
        <Box className="flex justify-end gap-4">
          <Button variant="contained" color="error" onClick={handleDeleteModal}>
            Eliminar
          </Button>
          <Button variant="outlined" onClick={handleCloseDeleteModal}>
            Cancelar
          </Button>
        </Box>
      </CustomModal>
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
              <TextField
                select
                fullWidth
                label="Tipo"
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <MenuItem value="0">Votante</MenuItem>
                <MenuItem value="1">Admin</MenuItem>
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
