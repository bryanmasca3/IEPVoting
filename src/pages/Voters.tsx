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
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Alert, AlertColor } from '@mui/material';
import { Switch } from '@mui/material';
import CustomModal from './components/ModalCustom';
import { styled } from '@mui/material/styles';
import { getUsers, createUsers, updateUserState, deleteUsers } from './../services/supabaseService';
import { MailOutline, LockOutlined, BadgeOutlined, Padding } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useAuth } from './../AuthContext';
import { useNavigate } from 'react-router-dom';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
const Voters = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [ToDelete, setToDelete] = useState(null);
  const [loading,setLoading]=useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',    
    dni: '',
    password: '',
    sede: '',
    email: '',
    type: '0',
    file:null
  });
  const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
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
 
    loadUsers();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simular guardado (puedes reemplazar con Supabase, backend, etc.)
    try {
      let uploadData={
        secure_url:""
      }
      setLoading(true);
       if (formData.file) {
          const imageData = new FormData();
          imageData.append('file', formData.file);
          imageData.append('upload_preset', 'voting_preset_by_client'); // tu upload preset
       //   imageData.append('folder', 'voting');     // opcional si usas la API base

          const uploadRes = await fetch('https://api.cloudinary.com/v1_1/dr8m7eoce/image/upload', {
            method: 'POST',
            body: imageData,
          });
           const result = await uploadRes.json();

            if (!uploadRes.ok) {
              throw new Error(result.error?.message || 'Error al subir imagen a Cloudinary');
            }

            uploadData.secure_url = result.secure_url;
        }

      await createUsers({ ...formData, photo: uploadData.secure_url });
      setFormData({
        first_name: '',
        last_name: '',
        dni: '',
        password: '',
        sede: '',
        email: '',
        type: '0',
        file:null
      });
      
      await loadUsers();
      setMessage({ type: 'success', text: 'Votante creado correctamente.' });
    } catch (error) {
      
      setMessage({ type: 'error', text: error.message || 'Ocurrió un error al crear el votante.' });
    }finally{
      setLoading(false);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0]});
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
       const [checked, setChecked] = React.useState(
  Array.isArray(params.row.users_votes) && params.row.users_votes.length > 0
);

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
  <div className="flex gap-4">
            

               <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<CloudUploadIcon />}
              >
                Upload files
                <VisuallyHiddenInput
                  type="file"
                  name='file'
                  onChange={handleChangeFile}
                  multiple
                />
              </Button>
            </div>
            {loading?<Box display={"flex"} justifyContent={"center"} alignItems={"center"}
     sx={{
        '& svg': {
          animation: 'spin 1.5s linear infinite',
          fontSize: 50,
        },
        '@keyframes spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      }}><RestartAltIcon/></Box>:<Button variant="contained" color="primary" fullWidth type="submit">
              Guardar Votante
            </Button>}
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
