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
  useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { fetchVoteCounts, subscribeToVotes, removeSubscription } from './../services/supabaseService';
import { BarChart } from '@mui/x-charts/BarChart';
const Votes = () => {
  const [voteCounts, setVoteCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
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

  // Obtener los votos
  const getVoteCounts = async () => {
    try {
      const data = await fetchVoteCounts();
      setVoteCounts(data);
    } catch (error) {
      console.error("Error al obtener los votos:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
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
    <Box className= "p-4" >
    <Card className="shadow-lg border"  sx = {{
    color: theme.palette.secondary[200],
      backgroundColor: theme.palette.background.alt,
        border: "none"
  }
}>
  <CardContent>
  {
    loading?(
            <Box className = "flex justify-center items-center h-32" >
        <CircularProgress color="primary" />
  </Box>
          ) : voteCounts.length === 0 ? (
  <Typography variant= "body1" className = "text-white" >
    No se encontraron votos.
            </Typography>
          ) : (
  <>
  <Tabs
                value= { activeTab }
onChange = {(e, newValue) => setActiveTab(newValue)}
textColor = "inherit"
indicatorColor = "primary"
variant = "scrollable"
scrollButtons = "auto"
className = "mb-4"
  >
{
  departments.map((dept, idx) => (
    <Tab key= { dept } label = { dept } className = "text-white" />
                ))
}
  </Tabs>

  <Box >
{
  departments.map((dept, index) =>
    index === activeTab ? (
      <Box key= { dept } >
      {
        Object.entries(groupedData[dept]).map(
          ([position, candidates]) => (
            <Accordion key= { position } className = " text-white mb-2" >
            <AccordionSummary
                              expandIcon={< ExpandMoreIcon className = "text-white" />}
      >
      <Typography className="font-semibold" >
      { position.toUpperCase() }
      </Typography>
      </AccordionSummary>
      < AccordionDetails >
  <Box className="overflow-x-auto" >
  <BarChart
                                  xAxis={ [{ scaleType: 'band', data: candidates.map(c => c.candidate_name) }]}
                                  series = { [{ data: candidates.map(c => c.votes), label: 'Votos' }]}
                                  width = { 500}
                                  height = { 300}

    />
    </Box>
    </AccordionDetails>
    </Accordion>
  )
                      )
}
</Box>
                  ) : null
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
