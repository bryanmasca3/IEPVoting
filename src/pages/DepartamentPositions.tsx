import { useState, useEffect } from 'react';
import { Alert, AlertColor } from '@mui/material';
import { TextField, Button, Box, useTheme, Typography } from '@mui/material';
import { useAuth } from './../AuthContext';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CustomModal from './components/ModalCustom';

import {
  getDepartaments,
  createDepartament,
  getPositions,
  createPosition,
  deletePositions,
  deleteDepartament,
} from './../services/supabaseService';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
const DepartamentPositions = () => {
  const { user } = useAuth(); // Usuario y método de logout desde el Context
  const [openDeletePositionModal, setOpenDeletePositionModal] = useState(false);
  const [openDeleteDepartamentModal, setOpenDeleteDepartamentModal] = useState(false);

  const [positionToDelete, setPositionToDelete] = useState(null);
  const [departamentToDelete, setDepartamentToDelete] = useState(null);

  const theme = useTheme();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formDataDepartament, setFormDataDepartament] = useState({
    name: '',
  });
  const [formDataPositions, setFormDataPositions] = useState({
    name: '',
  });
  const columnsDepartament: GridColDef[] = [
    { field: 'name', headerName: 'Nombre', flex: 1, valueGetter: (name) => name.toUpperCase() },
    {
      field: '-',
      headerName: '',
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <DeleteForeverIcon
          onClick={() => handleOpenDeleteDepartamentModal(params.row)}
          sx={{ cursor: 'pointer' }}
        />
      ),
    },
  ];
  const columnsPositions: GridColDef[] = [
    { field: 'name', headerName: 'Nombre', flex: 1, valueGetter: (name) => name.toUpperCase() },
    {
      field: '-',
      width: 80,
      sortable: false,
      headerName: '',
      renderCell: (params) => (
        <DeleteForeverIcon
          onClick={() => handleOpenDeletePositionModal(params.row)}
          sx={{ cursor: 'pointer' }}
        />
      ),
    },
  ];
  const [departament, setDepartament] = useState([]);
  const [positions, setPosition] = useState([]);
  const [message, setMessage] = useState<{ type: AlertColor; text: string } | null>(null);
  const loadDepartaments = async () => {
    try {
      const data = await getDepartaments();
      setDepartament(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Ocurrió un error al cargar los Departamento.' });
    }
  };
  const handleOpenDeletePositionModal = (candidate) => {
    setPositionToDelete(candidate);
    setOpenDeletePositionModal(true);
  };
  const handleDeletePositionModal = async () => {
    try {
      console.log('Eliminando posicion:', positionToDelete);
      await deletePositions(positionToDelete.id);
      setOpenDeletePositionModal(false);
      setPositionToDelete(null);
      await loadPositions();

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setOpenDeletePositionModal(false);
      setPositionToDelete(null);
      setErrorMessage(error.message || 'Hubo un error al eliminar el posicion.');
      setTimeout(() => setErrorMessage(false), 3000);
    }
  };
  const handleCloseDeletePositionModal = () => {
    setOpenDeletePositionModal(false);
    setPositionToDelete(null);
  };

  const handleOpenDeleteDepartamentModal = (candidate) => {
    setDepartamentToDelete(candidate);
    setOpenDeleteDepartamentModal(true);
  };

  // Handler para cerrar el modal

  const handleDeleteDepartamentModal = async () => {
    try {
      //console.log('Eliminando posicion:', positionToDelete);
      await deleteDepartament(departamentToDelete.id);
      setOpenDeleteDepartamentModal(false);
      setDepartamentToDelete(null);
      await loadDepartaments();

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setOpenDeleteDepartamentModal(false);
      setDepartamentToDelete(null);
      setErrorMessage(error.message || 'Hubo un error al eliminar el posicion.');
      setTimeout(() => setErrorMessage(false), 3000);
    }
  };
  const handleCloseDeleteDepartamentModal = () => {
    setOpenDeleteDepartamentModal(false);
    setDepartamentToDelete(null);
  };
  // Handler para cerrar el modal

  const loadPositions = async () => {
    try {
      const data = await getPositions();
      setPosition(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Ocurrió un error al cargar los Departamento.' });
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadDepartaments();
    loadPositions();
  }, []);
  const handleChangeDepartament = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormDataDepartament({ ...formDataDepartament, [e.target.name]: e.target.value });
  };

  const handleChangePositions = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormDataPositions({ ...formDataPositions, [e.target.name]: e.target.value });
  };

  const handleSubmitDepartament = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createDepartament(formDataDepartament);
      setFormDataDepartament({
        name: '',
      });
      console.log('Votante creado:', result);
      await loadDepartaments();
      setMessage({ type: 'success', text: 'Departamento creado correctamente.' });
    } catch (error) {
      console.error('Error al crear votante:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Ocurrió un error al crear el Departamento.',
      });
    }
  };

  const handleSubmitPositions = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createPosition(formDataPositions);
      setFormDataPositions({
        name: '',
      });
      console.log('Votante creado:', result);
      await loadPositions();
      setMessage({ type: 'success', text: 'Position creado correctamente.' });
    } catch (error) {
      console.error('Error al crear votante:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Ocurrió un error al crear el Position.',
      });
    }
  };
  return (
    <div className="p-4">
      {message && (
        <Alert
          severity={message.type}
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}
      {showSuccess && (
        <Alert severity="success" sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
          Configuración guardada correctamente.
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
          {errorMessage}
        </Alert>
      )}
      <CustomModal
        open={openDeletePositionModal}
        onClose={handleCloseDeletePositionModal}
        width={400}
      >
        <Typography variant="h6" className="mb-4">
          ¿Estás seguro que deseas eliminar la posicion?
        </Typography>
        <Box className="flex justify-end gap-4">
          <Button variant="contained" color="error" onClick={handleDeletePositionModal}>
            Eliminar
          </Button>
          <Button variant="outlined" onClick={handleCloseDeletePositionModal}>
            Cancelar
          </Button>
        </Box>
      </CustomModal>

      <CustomModal
        open={openDeleteDepartamentModal}
        onClose={handleCloseDeleteDepartamentModal}
        width={400}
      >
        <Typography variant="h6" className="mb-4">
          ¿Estás seguro que deseas eliminar el departamento?
        </Typography>
        <Box className="flex justify-end gap-4">
          <Button variant="contained" color="error" onClick={handleDeleteDepartamentModal}>
            Eliminar
          </Button>
          <Button variant="outlined" onClick={handleCloseDeleteDepartamentModal}>
            Cancelar
          </Button>
        </Box>
      </CustomModal>
      <Box className="grid grid-cols-2 md:grid-cols-2 gap-4">
        <Box className="flex flex-col gap-4">
          <Box sx={{ backgroundColor: theme.palette.background.alt, padding: '1rem' }}>
            <form onSubmit={handleSubmitDepartament} className="flex flex-col gap-4">
              <div className="flex gap-4">
                <TextField
                  fullWidth
                  label="Nombre"
                  name="name"
                  value={formDataDepartament.name}
                  onChange={handleChangeDepartament}
                />
              </div>
              <Button variant="contained" color="primary" fullWidth type="submit">
                Guardar Departamento
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
            <DataGrid rows={departament || []} columns={columnsDepartament} pageSize={5} />
          </Box>
        </Box>
        <Box className="flex flex-col gap-4">
          <Box sx={{ backgroundColor: theme.palette.background.alt, padding: '1rem' }}>
            <form onSubmit={handleSubmitPositions} className="flex flex-col gap-4">
              <div className="flex gap-4">
                <TextField
                  fullWidth
                  label="Nombre"
                  name="name"
                  value={formDataPositions.name}
                  onChange={handleChangePositions}
                />
              </div>
              <Button variant="contained" color="primary" fullWidth type="submit">
                Guardar Posición
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
            <DataGrid rows={positions || []} columns={columnsPositions} pageSize={5} />
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default DepartamentPositions;
