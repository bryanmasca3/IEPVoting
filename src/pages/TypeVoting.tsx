import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase-client';
import { useAuth } from './../context/AuthContext';
import profileImage from './assets/profile.jpeg';
import { getTypeVoting } from './../services/supabaseService';
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
import { useLocation } from 'react-router-dom';
const TypeVoting = () => {
  const theme = useTheme();
  const [typeVoting, setTypeVoting] = useState([]);
  const location = useLocation();
  const { user, logout } = useAuth(); // Usuario y método de logout desde el Context

  const navigate = useNavigate();
  const loadTypeVoting = async () => {
    try {
      const data = await getTypeVoting();
      setTypeVoting(data);
      console.log(data);
    } catch (error) {
      console.error('Error al obtener tipo de votación:', error);
    }
  };

  useEffect(() => {
    /*  if (!user) {
      navigate('/login');
      return;
    } */
    loadTypeVoting();
  }, []);

  return (
    <div className="p-4">
      <Box className="flex flex-col gap-4">
        <Box sx={{ backgroundColor: theme.palette.background.alt, padding: '1rem' }}>Cambio</Box>
      </Box>
    </div>
  );
};

export default TypeVoting;
