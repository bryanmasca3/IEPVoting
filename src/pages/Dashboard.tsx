import  { useEffect, useState,useMemo,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './../AuthContext';

import logoImage from './../assets/logo.png';
import {
  fetchCandidates,
  voteForCandidate,
  getVoteForUser,
  deleteVoteForCandidate,
  getConfigurations,
  finishVote,
  getVoteState
} from './../services/supabaseService';
import {
  Button,
  Typography,
  Tabs,
  Tab,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  AlertColor
} from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
 import Candidate from "./components/Card/Candidate";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Alert } from '@mui/material';


const Dashboard = () => {
  const theme = useTheme();
  const { user, logout } = useAuth(); 
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState([]); 
  const [activeDept, setActiveDept] = useState('');
  const [voteState, setVoteState] = useState(null); 
  const [errorMessage, setErrorMessage] = useState('');
  const [message, setMessage] = useState<{ type: AlertColor; text: string } | null>(null);

  const navigate = useNavigate();
  const [finish,setFinish]=useState<boolean>(false);
  const [inputs, setInputs] = useState<{ positionId: string; groupId: string; value: string }[]>(
    [],
  );

  const loadCandidates = async () => {
    try {
      const data = await fetchCandidates();
      setCandidates(data);          
    } catch (error) {
       setMessage({
        type: 'error',
        text: error.message || 'No se pudo cargar los candidatos.',
      });      
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

      setInputs(formattedData);

    } catch (error) {
          setMessage({
              type: 'error',
              text: error.message || 'No se pudo cargar las configuraciones.',
            });
    }
  };

   const loadVotes = async () => {
    try {
      if (!user) return alert('Debes estar autenticado para votar.');
      const data = await getVoteForUser(user.id);      
      setVotes(data);
    } catch (error) {
       setMessage({
              type: 'error',
              text: error.message || 'No se pudo cargar los votos actuales del usuario.',
            });
    }
  };

  const handleFinishVote = async () => {
        try {                      
           if (!user) return alert('Debes estar autenticado para votar.');
            await finishVote(user.id);
            setFinish(true);
          } catch (error) {
            setMessage({
              type: 'error',
              text: error.message || 'No se pudo finalizar las votaciones.',
            });
            setTimeout(() => setMessage(null), 3000);
        }
  };

 

  const loadStateVote = async () => {
    try {
      if (!user) return alert('Debes estar autenticado para votar.');
      const data = await getVoteState(user.id);     
      setVoteState(data);
    } catch (error) {
      setMessage({
              type: 'error',
              text: error.message || 'No se pudo cargar el estado de los votos.',
            });   
    }
  }

   // Función para votar
  const handleVote = useCallback(async (candidate) => {
    setErrorMessage('');
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
  }, [votes, inputs, user, loadVotes]);

const handleClose = async () => {
    await logout();
    navigate('/login');    
  };

  useEffect(() => {    
    loadVotes();
  }, []);

  useEffect(() => {
    loadCandidates();
  }, []);

  useEffect(() => {
    fetchConfigurations();
  }, []);

  useEffect(() => {
    loadStateVote();
  }, [finish]);


  // Cuando se carguen candidatos, si no hay departamento activo, se establece el primero disponible.
  useEffect(() => {
    if (candidates.length > 0 && !activeDept) {
      const deptSet = new Set(candidates.map((candidate) => candidate.groups.name));
      setActiveDept([...deptSet][0]);
    }
  }, [candidates,activeDept]);

 
  // Filtramos candidatos según el departamento activo
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => c.groups.name === activeDept);
  }, [candidates, activeDept]);

  // Agrupamos los candidatos filtrados por su posición
  const groupedByPosition = useMemo(() => {
  return filteredCandidates.reduce((acc, candidate) => {
    const position = candidate.positions.name;
    if (!acc[position]) acc[position] = [];
    acc[position].push(candidate);
    return acc;
  }, {});
}, [filteredCandidates]);

  const departments = useMemo(() => {
    return Array.from(new Set(candidates.map((c) => c.groups.name)));
  }, [candidates]);

  const activeIndex = departments.indexOf(activeDept);

 

  return (<>
   {message && (
        <Alert
          severity={message.type}
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}
          onClose={() => setMessage(null)} // Permite cerrar el mensaje manualmente
        >
          {message.text}
        </Alert>
      )}
    {voteState?!voteState.state?
    (<div className="p-4" >
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
          sx={{
            "& .MuiTab-root": {
              fontSize: "1.0rem", // tamaño de texto general             
              fontWeight: 300,
              textTransform: "uppercase",
            },
            "& .Mui-selected": {            
              fontWeight: 700,
              color: "#000", // color más llamativo
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
              backgroundColor: theme.palette.secondary.main,
            },
          }}
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
            <Typography variant="h5" className="text-white uppercase">
             {/*  {position.toLocaleUpperCase()} */}
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
                  <Candidate candidate={candidate} handle={handleVote} isVoted={isVoted} />
                );
              })}
            </Box>
            <Box className="mt-4">
              {errorMessage!='' && (
                <Alert severity="error" className="mb-4 bg-red-600">
                  {errorMessage}
                </Alert>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
      <Box className="flex justify-center gap-4">
        <Button
          variant="outlined"
          color="primary"
          startIcon={<NavigateBeforeIcon />}          
          disabled={activeIndex <= 0}
          onClick={() => {if (activeIndex > 0) {
            setActiveDept(departments[activeIndex - 1]);
                    window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
          sx={{
            marginTop: '1rem',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: theme.palette.secondary.main,
            borderColor: theme.palette.secondary.main,
          }}
        >
        Anterior
        </Button>
        {activeIndex < departments.length - 1 ? (
    <Button
      variant="outlined"
      color="primary"
      endIcon={<NavigateNextIcon />}
      onClick={() => {
        if (activeIndex < departments.length - 1) {
          setActiveDept(departments[activeIndex + 1]);
          window.scrollTo({ top: 0, behavior: "smooth" }); // 🔹 vuelve arriba
        }
      }}
      sx={{
        marginTop: '1rem',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: theme.palette.secondary.main,
        borderColor: theme.palette.secondary.main,
      }}
    >
      Siguiente
    </Button>
  ) : (
    // Si es el último, mostramos Terminar
    <Button
       variant="contained"      
      onClick={handleFinishVote} // Aquí puedes definir la acción que quieres al terminar
      sx={{
        marginTop: '1rem',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: "#000",
        borderColor: theme.palette.secondary.main,
        backgroundColor: theme.palette.secondary.main,
      }}
    >
      Terminar
    </Button>
  )}
      </Box>
      {/* Si no hay candidatos en el departamento seleccionado */}
      {filteredCandidates.length === 0 && (
        <Typography variant="body1" className="text-white">
          No hay candidatos disponibles en este departamento.
        </Typography>
      )}
    </div>):(<Box /* className="p-4" */ display={'flex'} flexDirection="column" alignItems="center" justifyContent="center"  marginTop={"25px"} >
     {/*  <Box
          component="img"
          alt="profile"
          src={logoImage}
          height="200px"
          width="200px"
          borderRadius="50%"
          sx={{ objectFit: 'cover' }}
        /> */}
      <Typography variant="h4" className="text-white p-4">
        La votación ha finalizado. Gracias por participar.
      </Typography>
      <Button
        variant="contained"
        color="primary" 
        onClick={handleClose}
        sx={{
          marginTop: '1rem',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          color: "#000",
          backgroundColor: theme.palette.secondary.main,
        }}
      >
        Cerrar session
      </Button>
    </Box>):(<Box className="p-4" display={'flex'} flexDirection="column" alignItems="center" justifyContent="center" gap={"10px"}>
          {/* <Box
          component="img"
          alt="profile"
          src={logoImage}
          height="200px"
          width="200px"
          borderRadius="50%"
          sx={{ objectFit: 'cover' }}
        /> */}
      <Typography variant="h3" className="text-white text-center">
        No tiene asistencia registrada para votar. <br></br>Contactate con el administrador.
      </Typography>
      
      <Button
        variant="contained"
        color="primary"
        onClick={handleClose}
        sx={{
          marginTop: '1rem',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          color: "#000",
          backgroundColor: theme.palette.secondary.main,
        }}
      >
        Cerrar session
      </Button></Box>)}
      </>
  );
};

export default Dashboard;
