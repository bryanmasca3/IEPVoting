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
      setTotalVoters(data)
    } catch (error) {
      console.error('Error al obtener los votos:', error);
    }
  }
  // Obtener los votos
  const getVoteCounts = async () => {
    try {
      const data = await fetchVoteCounts();
      setVoteCounts(data);
    } catch (error) {
      console.error('Error al obtener los votos:', error);
    }
    setLoading(false);
  };

  useEffect(()=>{
    getCountVoters();
  },[])
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    getVoteCounts();

    const subscription = subscribeToVotes((payload) => {
      console.log('Nuevo voto insertado:', payload);
      getVoteCounts();
    });

    return () => {
      removeSubscription(subscription);
    };
  }, []);

  const groupedData = groupData();
  const departments = Object.keys(groupedData);

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
              backgroundColor: theme.palette.background.alt, // Cambia este valor por el color deseado
            }}>
                            <Typography className="font-semibold">
                              {position.toUpperCase()}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails  sx={{
              backgroundColor: theme.palette.background.alt, // Cambia este valor por el color deseado
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
                                    tickLabelStyle: { fontSize: 17,textTransform: 'uppercase' },
                                    colorMap: {
                                      type: "ordinal",
                                      values: candidates.map((c) => c.candidate_name),
                                      colors: candidates.map((c) => {
                                          if(c.votes > 3){
                                            return "#1abc9c";

                                          }else{
                                           return "#e74c3c";
                                          }
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
