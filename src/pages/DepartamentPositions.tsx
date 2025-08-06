import { useState, useEffect } from 'react';
import { Alert, AlertColor } from '@mui/material';
import { TextField, Button, Box, useTheme } from '@mui/material';
import { useAuth } from './../AuthContext';
import {
  getDepartaments,
  createDepartament,
  getPositions,
  createPosition,
} from './../services/supabaseService';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
const DepartamentPositions = () => {
  const { user } = useAuth(); // Usuario y método de logout desde el Context
  const theme = useTheme();
  const navigate = useNavigate();
  const [formDataDepartament, setFormDataDepartament] = useState({
    name: '',
  });
  const [formDataPositions, setFormDataPositions] = useState({
    name: '',
  });
  const columns: GridColDef[] = [{ field: 'name', headerName: 'Departamento' }];
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
      setMessage({ type: 'error', text: 'Ocurrió un error al crear el Departamento.' });
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
      setMessage({ type: 'error', text: 'Ocurrió un error al crear el Position.' });
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
            <DataGrid rows={departament || []} columns={columns} pageSize={5} />
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
            <DataGrid rows={positions || []} columns={columns} pageSize={5} />
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default DepartamentPositions;
