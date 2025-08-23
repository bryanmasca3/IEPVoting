import { useState, useEffect } from 'react';
import { Alert, AlertColor } from '@mui/material';
import { TextField, Button, Box, useTheme, Typography } from '@mui/material';
import { useAuth } from './../AuthContext';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CustomModal from './components/ModalCustom';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {
 fetchCandidates,
 get_all_votes
} from './../services/supabaseService';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
const Audit = () => {
  const { user } = useAuth(); // Usuario y método de logout desde el Context  

  const theme = useTheme();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
    
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState([]);
  const columnsDepartament: GridColDef[] = [
    { field: 'name', headerName: 'Nombre', flex: 1, valueGetter: (name) => name.toUpperCase() },
    { field: 'type', headerName: 'Tipo', flex: 1, valueGetter: (type) => type?"ESTRICTO":"NO ESTRICTO" },
   
  ];
    const loadCandidates = async () => {
      try {
        const data = await fetchCandidates();
        setCandidates(data);
        console.log(data);
      } catch (error) {
        console.error('Error al obtener candidatos:', error);
      }
    };

     const getVotes = async () => {
      try {
        const data = await get_all_votes();
        setVotes(data);
        console.log(data);
      } catch (error) {
        console.error('Error al obtener candidatos:', error);
      }
    };
  useEffect(() => {
   
    loadCandidates();
    getVotes();
  }, []);

   const result = {};

candidates.forEach(entry => {
  const groupName = entry.groups.name;
  const positionId = entry.positions.id;
  const positionName = entry.positions.name;
  const user = entry.users;

  if (!result[groupName]) {
    result[groupName] = {
      group: groupName,
      positions: []
    };
  }

  const groupPositions = result[groupName].positions;

  let position = groupPositions.find(p => p.id === positionId);

  if (!position) {
    position = {
      id: positionId,
      name: positionName,
      users: []
    };
    groupPositions.push(position);
  }

  // Evitar usuarios duplicados por DNI
  if (!position.users.some(u => u.dni === user.dni)) {
    position.users.push(user);
  }
});

const output = Object.values(result);
console.log(output);
function TableBodyVotes({ output, votes }) {
  // Lista única de votantes
  const uniqueVotantes = Array.from(new Set(votes.map(v => v.votante)));

  return (
    <TableBody /* sx={{backgroundColor:theme.palette.primary.main}} */>
      {uniqueVotantes.map(votante => (
        <TableRow key={votante}>
          {/* Primera celda: nombre del votante */}
          <TableCell sx={{ fontWeight: 'bold' }}>{votante}</TableCell>

          {/* Por cada candidato en output */}
          {output.flatMap(group =>
            group.positions.flatMap(position =>
              position.users.map(user => {
                // Buscar voto que coincida con votante, grupo, posición, candidato
                const voto = votes.find(
                  v =>
                    v.votante === votante &&
                    v.departament === group.group &&
                    v.posicion === position.name &&
                    v.candidato.toLowerCase() ===
                      (user.first_name + ' ' + user.last_name).toLowerCase()
                );

                return (
                  <TableCell
                    key={`${votante}-${group.group}-${position.id}-${user.dni}`}
                    align="center"
                  >
                    {voto ? '✔️' : ''}
                  </TableCell>
                );
              })
            )
          )}
        </TableRow>
      ))}
    </TableBody>
  );
}
  return (
    <div className="p-4">         
      <Box className="grid grid-cols-1 md:grid-cols-1 gap-4">                          
        <Box className="flex flex-col gap-4">                 
          <Box
            sx={{
              backgroundColor: theme.palette.background.alt,
              padding: '1rem',
           
              width: '100%', // asegura que no se desborde
              maxWidth: '100%',
              overflowX: 'auto', // agrega scroll si hay desborde horizontal
            }}
          >
         <TableContainer component={Paper}>
  <Table sx={{ minWidth: 650 }} aria-label="simple table">
    <TableHead>
      <TableRow>
        <TableCell sx={{ backgroundColor: theme.palette.secondary.main, color: "#000" }}>
          <Box sx={{ fontWeight: 'bold' }}>VOTANTE</Box>
        </TableCell>

        {output.map(group => {
          const totalUsers = group.positions.reduce((sum, pos) => sum + pos.users.length, 0);
          return (
            <TableCell
              key={group.group}
              align="center"
              colSpan={totalUsers}
              sx={{ backgroundColor: theme.palette.secondary.main, color: "#000" }}
            >
              <Box>
                <Box sx={{ fontWeight: 'bold' }}>{group.group.toUpperCase()}</Box>
                <Box display="flex">
                  {group.positions.map(position => (
                    <Box
                      key={position.id}
                      sx={{ flex: position.users.length, textAlign: 'center' }}
                    >
                      <Box sx={{ fontWeight: 'bold' }}>{position.name.toUpperCase()}</Box>
                      <Box display="flex" justifyContent="space-around">
                        {position.users.map(user => (
                          <Box key={user.dni} sx={{ mx: 1 }}>
                            {user.first_name} {user.last_name}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>

    <TableBodyVotes output={output} votes={votes} />
  </Table>
</TableContainer>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default Audit;
