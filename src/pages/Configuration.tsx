import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase-client';
import { useAuth } from './../context/AuthContext';
import profileImage from './assets/profile.jpeg';
import {
  fetchCandidates,
  createConfigurationMaxVotes,
  getConfigurations,
  getUsers,
  createCandidates,
  getGroups,
  getPositions,
} from './../services/supabaseService';
import {
  Card,
  CardContent,
  Button,
  Typography,
  Tabs,
  Tab,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  useTheme,
  InputLabel,
  MenuItem,
  FormControl,
} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Alert } from '@mui/material';
import { BorderColor } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import Autocomplete from '@mui/material/Autocomplete';
import CustomModal from './components/ModalCustom';
const Configuration = () => {
  const theme = useTheme();
  const [openModal, setOpenModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [modalGroupId, setModalGroupId] = useState(null);
  const [modalPositionId, setModalPositionId] = useState(null);

  const location = useLocation();
  const { user, logout } = useAuth(); // Usuario y método de logout desde el Context
  const [users, setUsers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState([]); // Estado para almacenar los votos

  const [groups, setGroups] = useState([]); // Estado para almacenar los votos
  const [positions, setPositions] = useState([]); // Estado para almacenar los votos

  const [activeDept, setActiveDept] = useState(''); // Departamento activo
  const [errorMessage, setErrorMessage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [inputs, setInputs] = useState<{ positionId: string; groupId: string; value: string }[]>(
    [],
  );

  const navigate = useNavigate();
  const loadCandidates = async () => {
    try {
      const data = await fetchCandidates();
      setCandidates(data);
      console.log(data);
    } catch (error) {
      console.error('Error al obtener candidatos:', error);
    }
  };

  const loadGroups = async () => {
    try {
      const data = await getGroups();
      setGroups(data);
      console.log(data);
    } catch (error) {
      console.error('Error al obtener grupos:', error);
    }
  };

  const loadPositions = async () => {
    try {
      const data = await getPositions();
      setPositions(data);
      console.log(data);
    } catch (error) {
      console.error('Error al obtener posiciones:', error);
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
  const handleSaveCandidates = async () => {
    if (!modalGroupId || !modalPositionId || selectedUsers.length === 0) {
      setErrorMessage('Faltan datos para guardar');
      return;
    }

    try {
      const candidatesToSave = selectedUsers.map((user) => ({
        group_id: modalGroupId,
        position_id: modalPositionId,
        user_id: user.id,
      }));
      console.log('Candidatos a guardar:', candidatesToSave); // Agregado para depuración
      await createCandidates(candidatesToSave);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      setOpenModal(false);
      setSelectedUsers([]); // limpia selección
      await loadCandidates(); // recarga lista
    } catch (error) {
      setErrorMessage('Hubo un error al guardar los candidatos.');
    }
  };

  const handleChange = async (positionId: string, groupId: string, value: string) => {
    if (value === '') {
      return;
    }

    setInputs((prevInputs) => {
      const index = prevInputs.findIndex(
        (input) => input.positionId === positionId && input.groupId === groupId,
      );

      if (index !== -1) {
        const updated = [...prevInputs];
        updated[index] = { ...updated[index], value };
        return updated;
      } else {
        return [...prevInputs, { positionId, groupId, value }];
      }
    });

    // Hacemos el upsert directamente en Supabase
    try {
      await createConfigurationMaxVotes([
        {
          position_id: positionId,
          group_id: groupId,
          max_votes: Number(value),
        },
      ]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000); // se oculta tras 3s
    } catch (error) {
      console.error('Error al guardar automáticamente:', error);
    }
  };

  const fetchConfigurations = async () => {
    try {
      const data = await getConfigurations();

      const formattedData = data.map((item) => ({
        positionId: item.position_id,
        groupId: item.group_id,
        value: item.max_votes.toString(),
      }));
      console.log('Configuraciones:', formattedData); // Agregado para depuración
      setInputs(formattedData);
    } catch (error) {
      console.error('Error al obtener configuraciones:', error);
    }
  };
  const loadData = async () => {
    await loadCandidates(); // Espera que termine
    await fetchConfigurations(); // Luego usa esos datos
    await loadGroups(); // Espera que termine
    await loadPositions(); // Espera que termine
    await loadUsers(); // Espera que termine
  };

  useEffect(() => {
    // Si no hay usuario autenticado, redirige a login
    /*  if (!user) {
      navigate('/login');
      return;
    } */

    loadData();
  }, []);

  // Cuando se carguen candidatos, si no hay departamento activo, se establece el primero disponible.
  useEffect(() => {
    if (candidates.length > 0 && !activeDept) {
      const deptSet = new Set(candidates.map((candidate) => candidate.groups.name));
      setActiveDept([...deptSet][0]);
    }
  }, [candidates, activeDept]);

  // Función para votar

  // Filtramos candidatos según el departamento activo
  const filteredCandidates = candidates.filter((candidate) => candidate.groups.name === activeDept);

  // Obtenemos la lista de departamentos únicos
  const departments = groups.map((group) => group.name); // Usar los grupos de la base de datos
  // const positionsData = positions.map((position) => position.name); // Usar las posici

  return (
    <div className="p-4">
      {/* Mostrar Tabs de departamentos */}
      {departments.length > 0 && (
        <Tabs
          value={activeDept}
          onChange={(_, newValue) => setActiveDept(newValue)}
          indicatorColor="primary"
          textColor="inherit"
          variant="scrollable"
          scrollButtons="auto"
          className="mb-4 "
        >
          {departments.map((dept) => (
            <Tab key={dept} label={dept} value={dept} />
          ))}
        </Tabs>
      )}

      {/* Mostrar la estructura de posiciones si no hay candidatos */}
      <Box className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {positions.map((positionObj) => {
          const positionName = positionObj.name;
          const positionId = positionObj.id;
          const group = groups.find((g) => g.name === activeDept);
          const groupId = group?.id;

          return (
            <Box key={positionName} sx={{ backgroundColor: theme.palette.background.alt, p: 2 }}>
              <Typography variant="h6" class="uppercase text-center font-bold mb-2">
                {positionName}
              </Typography>
              <Box sx={{ marginBottom: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  onClick={() => {
                    setModalGroupId(groupId); // Asumimos que setModalGroupId usa el id de grupo
                    setModalPositionId(positionId); // Lo mismo con el id de posición
                    setOpenModal(true);
                  }}
                >
                  Agregar Candidatos
                </Button>
              </Box>
              <Box className="flex flex-col gap-4 mt-4">
                {filteredCandidates
                  .filter((candidate) => candidate.positions.name === positionName)
                  .map((candidate) => (
                    <Card key={candidate.id} sx={{ backgroundColor: theme.palette.background.alt }}>
                      <CardContent className="flex flex-col items-center gap-4 shadow-md cursor-pointer">
                        <Box
                          component="img"
                          alt="profile"
                          src={profileImage}
                          height="150px"
                          width="150px"
                          borderRadius="50%"
                          sx={{ objectFit: 'cover' }}
                        />
                        <Typography variant="subtitle1" className="font-semibold">
                          {candidate.users.first_name} {candidate.users.last_name}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
              </Box>
              <Box sx={{ marginTop: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id={`select-label-${positionName}`}>
                    Cantidad maxima de votos para {positionName}
                  </InputLabel>
                  <Select
                    labelId={`select-label-${positionName}`}
                    id={`select-${positionName}`}
                    value={
                      inputs.find(
                        (input) => input.positionId === positionId && input.groupId === groupId,
                      )?.value || ''
                    }
                    label="Position"
                    onChange={(e) => handleChange(positionId, groupId, e.target.value)}
                  >
                    <MenuItem value="2">Dos</MenuItem>
                    <MenuItem value="3">Tres</MenuItem>
                    <MenuItem value="4">Cuatro</MenuItem>
                    <MenuItem value="5">Cinco</MenuItem>
                    <MenuItem value="6">Seis</MenuItem>
                    <MenuItem value="7">Siete</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          );
        })}
      </Box>

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
      <CustomModal open={openModal} onClose={() => setOpenModal(false)} width={500}>
        <Autocomplete
          multiple
          id="tags-outlined"
          options={users}
          getOptionLabel={(option) =>
            option.first_name + ' ' + option.last_name + ' / ' + option.dni + ' / ' + option.sede
          }
          filterSelectedOptions
          value={selectedUsers}
          onChange={(_, newValue) => setSelectedUsers(newValue)}
          renderInput={(params) => (
            <TextField {...params} label="usuarios" placeholder="nuevo usuario" />
          )}
        />
        <Box className="flex justify-end mt-4 gap-4">
          <Button variant="contained" color="secondary" onClick={handleSaveCandidates}>
            Guardar
          </Button>
          <Button variant="contained" color="primary" onClick={() => setOpenModal(false)}>
            Cerrar
          </Button>
        </Box>
      </CustomModal>
    </div>
  );
};

export default Configuration;
