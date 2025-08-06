import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase-client';
import { useAuth } from './../context/AuthContext';
import profileImage from './assets/profile.jpeg';
import {
  fetchCandidates,
  voteForCandidate,
  getVoteForUser,
  deleteVoteForCandidate,
  getConfigurations,
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
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Alert } from '@mui/material';
import { BorderColor } from '@mui/icons-material';
const Dashboard = () => {
  const theme = useTheme();
  const { user, logout } = useAuth(); // Usuario y método de logout desde el Context
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState([]); // Estado para almacenar los votos
  const [activeDept, setActiveDept] = useState(''); // Departamento activo
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const [inputs, setInputs] = useState<{ positionId: string; groupId: string; value: string }[]>(
    [],
  );

  const loadCandidates = async () => {
    try {
      const data = await fetchCandidates();
      setCandidates(data);
      console.log(data);
    } catch (error) {
      console.error('Error al obtener candidatos:', error);
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
  const loadVotes = async () => {
    try {
      const data = await getVoteForUser(user.id);
      console.log(data); // Agregado para depuración
      setVotes(data);
    } catch (error) {
      console.error('Error al obtener candidatos:', error);
    }
  };
  useEffect(() => {
    // Si no hay usuario autenticado, redirige a login
    /*   if (!user) {
      navigate('/login');
      return;
    } */

    // Función para obtener candidatos

    loadVotes();
    loadCandidates();
    fetchConfigurations();
  }, []);

  // Cuando se carguen candidatos, si no hay departamento activo, se establece el primero disponible.
  useEffect(() => {
    if (candidates.length > 0 && !activeDept) {
      const deptSet = new Set(candidates.map((candidate) => candidate.groups.name));
      setActiveDept([...deptSet][0]);
    }
  }, [candidates, activeDept]);

  // Función para votar
  const handleVote = async (candidate) => {
    setErrorMessage(null);
    if (!user) return alert('Debes estar autenticado para votar.');

    const existingVote = votes.find((vote) => vote.candidate_id === candidate.id);

    try {
      if (existingVote) {
        // Eliminar voto existente
        await deleteVoteForCandidate(existingVote.id);
      } else {
        const value = inputs.find(
          (input) =>
            input.positionId === candidate.positions.id && input.groupId === candidate.groups.id,
        );

        const voteCount = votes.filter(
          (vote) =>
            vote.position_id === candidate.positions.id && vote.group_id === candidate.groups.id,
        ).length;

        const maxValue = value ? parseInt(value.value, 10) : undefined;

        if (maxValue === undefined || voteCount < maxValue) {
          await voteForCandidate({
            voter_id: user.id,
            group_id: candidate.groups.id,
            candidate_id: candidate.id,
            position_id: candidate.positions.id,
          });
        } else {
          setErrorMessage('No puedes votar por más candidatos de los permitidos.');
        }
      }

      await loadVotes(); // actualiza los votos en UI
    } catch (error) {
      console.error('Error al votar:', error);
    }
  };

  // Filtramos candidatos según el departamento activo
  const filteredCandidates = candidates.filter((candidate) => candidate.groups.name === activeDept);

  // Agrupamos los candidatos filtrados por su posición
  const groupedByPosition = filteredCandidates.reduce((acc, candidate) => {
    const position = candidate.positions.name;
    if (!acc[position]) acc[position] = [];
    acc[position].push(candidate);
    return acc;
  }, {});

  // Obtenemos la lista de departamentos únicos
  const departments = Array.from(new Set(candidates.map((candidate) => candidate.groups.name)));

  return (
    <div className="p-4">
      {/* Tabs para departamentos */}
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

      {/* Agrupación por Posición usando Accordion */}
      {Object.entries(groupedByPosition).map(([position, posCandidates]) => (
        <Accordion key={position} defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: theme.palette.background.alt, // Cambia este valor por el color deseado
            }}
          >
            <Typography variant="h6" className="text-white">
              {position}
            </Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              backgroundColor: theme.palette.background.alt, // Cambia este valor por el color deseado
            }}
          >
            <Box className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ">
              {posCandidates.map((candidate) => {
                // Verificamos si el candidato fue votado por el usuario.
                const isVoted = votes.some((vote) => vote.candidate_id === candidate.id);

                return (
                  <Card key={candidate.id} onClick={() => handleVote(candidate)}>
                    <CardContent
                      className={`flex flex-col items-center gap-4 shadow-md cursor-pointer`}
                      sx={{
                        backgroundColor: theme.palette.primary[600],
                        border: isVoted
                          ? `3px solid ${theme.palette.primary[300]}`
                          : `3px solid ${theme.palette.primary[600]}`,
                      }}
                    >
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
                        <span className="font-normal uppercase">
                          {candidate.users.first_name + ' ' + candidate.users.last_name}
                        </span>
                      </Typography>
                      <Typography variant="subtitle1" className="font-semibold">
                        Sede: <span className="font-normal capitalize">{candidate.users.sede}</span>
                      </Typography>
                      <div className="mt-4">
                        <Button
                          variant="contained"
                          fullWidth
                          className={`${
                            isVoted
                              ? 'bg-gray-500 hover:bg-gray-500'
                              : 'bg-blue-600 hover:bg-blue-700'
                          } text-white font-bold`}
                        >
                          {isVoted ? 'Votado' : 'Votar'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
            <Box className="mt-4">
              {errorMessage && (
                <Alert severity="error" className="mb-4 bg-red-600">
                  {errorMessage}
                </Alert>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Si no hay candidatos en el departamento seleccionado */}
      {filteredCandidates.length === 0 && (
        <Typography variant="body1" className="text-white">
          No hay candidatos disponibles en este departamento.
        </Typography>
      )}
    </div>
  );
};

export default Dashboard;
