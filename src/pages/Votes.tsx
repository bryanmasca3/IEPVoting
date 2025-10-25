import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  fetchVoteCounts,
  subscribeToVotes,
  getDepartaments,
  removeSubscription,
  get_count_voters
} from './../services/supabaseService';
import { BarChart } from '@mui/x-charts/BarChart';
import { useAuth } from './../AuthContext';
import { useNavigate } from 'react-router-dom';
const Votes = () => {
  const [voteCounts, setVoteCounts] = useState([]);
  const { user, logout } = useAuth(); // Usuario y método de
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
    const [depa, setDepa] = useState([]);

  const [totalVoters,setTotalVoters]=useState(null);
  const theme = useTheme();
  // Agrupar votos por grupo y posición
  const groupData = () => {
    const grouped = {};

    voteCounts.forEach((item) => {
      const group = item.group_name;
      const position = item.position_name;

      if (!grouped[group]) grouped[group] = {};
      if (!grouped[group][position]) grouped[group][position] = [];

      grouped[group][position].push(item);
    });

    return grouped;
  };

  const getCountVoters=async()=>{
    
    try {
      const data = await get_count_voters();
      console.log(data)
      setTotalVoters(data)
    } catch (error) {
      console.error('Error al obtener los votos:', error);
    }
  }
  const loadDepartaments = async () => {
      try {
        const data = await getDepartaments();
        setDepa(data);
      } catch (error) {
         console.error('Error al obtener los votos:', error);
        //setMessage({ type: 'error', text: 'Ocurrió un error al cargar los Departamento.' });
      }
    };
  // Obtener los votos
  const getVoteCounts = async () => {
    try {
      const data = await fetchVoteCounts();
      //console.log(data)
      setVoteCounts(data);
    } catch (error) {
      console.error('Error al obtener los votos:', error);
    }
    setLoading(false);
  };

  useEffect(()=>{
    getCountVoters();
    loadDepartaments();
  },[])
  useEffect(() => {   
    getVoteCounts();    
  }, []);

  const groupedData = groupData();
  const departments = Object.keys(groupedData);
/* console.log(groupedData) */
  return (
    <Box className="p-4">
  <Box
  position="fixed"
  zIndex={1000}
  bottom={"20px"}
  backgroundColor={"#000"}   
  right={"20px"}
 borderRadius={"10px"}
>
  <Box
    display="flex"
    flexDirection={"column"}
    justifyContent={"space-between"}
    alignItems={"center"}
    padding={"10px"}
  >
    <Box display={"flex"} flexDirection={"column"} alignItems={"center"}>
      <Box fontSize="0.75rem" opacity={0.7} fontWeight={600}>Miembros hábiles</Box>
      <Box fontSize="1.2rem">{totalVoters?.aptos}</Box>
    </Box>

    <Box display={"flex"} flexDirection={"column"} alignItems={"center"}>
      <Box fontSize="0.75rem" opacity={0.7} fontWeight={600}>Quórum</Box>
      <Box fontSize="1.2rem">{totalVoters?.corum}</Box>
    </Box>

    <Box display={"flex"} flexDirection={"column"} alignItems={"center"}>
      <Box fontSize="0.75rem" opacity={0.7} fontWeight={600}>Dos terceras partes</Box>
      <Box fontSize="1.2rem">{totalVoters?.dos_tercios}</Box>
    </Box>

    <Box display={"flex"} flexDirection={"column"} alignItems={"center"}>
      <Box fontSize="0.75rem" opacity={0.7} fontWeight={600}>La mitad mas 1</Box>
      <Box fontSize="1.2rem">{totalVoters?.mitad_mas_uno}</Box>
    </Box>
  </Box>
</Box>

      <Card
        className="shadow-lg border"
        sx={{
          color: theme.palette.secondary[200],
          backgroundColor: theme.palette.background.alt,
          border: 'none',
        }}
      >
        <CardContent>
          {loading ? (
            <Box className="flex justify-center items-center h-32">
              <CircularProgress color="primary" />
            </Box>
          ) : voteCounts.length === 0 ? (
            <Typography variant="body1" className="text-white">
              No se encontraron votos.
            </Typography>
          ) : (
            <>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                textColor="inherit"
                indicatorColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                className="mb-4"
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
                {departments.map((dept, idx) => (
                  <Tab key={dept} label={dept} className="text-white" />
                ))}
              </Tabs>

              <Box>
                {departments.map((dept, index) =>
                  index === activeTab ? (
                    <Box key={dept}>                      
                      {Object.entries(groupedData[dept]).map(([position, candidates]) => (
                        <Accordion key={position} defaultExpanded>
                          <AccordionSummary expandIcon={<ExpandMoreIcon/>}  sx={{
              /* backgroundColor: theme.palette.background.alt,  */
            }}>
                            <Typography className="font-semibold">
                              {position.toUpperCase()}  
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails  sx={{
            /*   backgroundColor: theme.palette.background.alt, */ // Cambia este valor por el color deseado
            }}>
                            <Box className="overflow-x-auto">
                              <BarChart
                               sx={{
                              '& .MuiBarLabel-root': {
                                fontSize: '30px',    // aquí defines el tamaño de fuente
                                fill: '#fff',        // color del texto (opcional)
                                fontWeight: 'bold',  // grosor de letra (opcional)
                              },
                            }}
                                xAxis={[
                                  {
                                    scaleType: 'band',
                                    data: candidates.map((c) => c.candidate_name),
                                    tickLabelStyle: { fontSize: 15,textTransform: 'uppercase',fontWeight:600 },
                                    colorMap: {
                                      type: "ordinal",
                                      values: candidates.map((c) => c.candidate_name),
                                      colors: candidates.map((c) => {
                                           const state = depa.find((it) => it.name === dept);

                                            // Si existe state y es "true", usamos dos_tercios, si no, mitad_mas_uno
                                            const threshold = state?.type 
                                              ? totalVoters?.dos_tercios 
                                              : totalVoters?.mitad_mas_uno;

                                            // Comparación única
                                            return c.votes >= threshold ? "#1abc9c" : "#e74c3c";
                                          
                                      }),
                                    }
                                  },
                                ]}
                                  yAxis={[{
                                    tickLabelStyle: { fontSize: 20 }
                                     }]}
                    
                                series={[{ data: candidates.map((c) => c.votes)}]}
                                 barLabel="value"
                              /*   width={500} */
                                height={300}
                              />
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  ) : null,
                )}
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Votes;
