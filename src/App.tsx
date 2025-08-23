import { CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { useMemo } from 'react';

import { useSelector } from 'react-redux';
import { themeSettings } from './theme';
import Layout from './pages/layout';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Votes from './pages/Votes';
import Page404 from './pages/errors/Page404';
import Configuration from './pages/Configuration';
import Welcome from './pages/Welcome';
import DepartamentPositions from './pages/DepartamentPositions';
import Voters from './pages/Voters';
import Audit from './pages/Audit';
import PrivateRoute from './pages/components/PrivateRoute'; 

import Unauthorized from './pages/Unauthorized';

function App() {
  const mode = useSelector((state) => state.global.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Page404 />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
             <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Welcome />} />
                <Route path="/votes" element={<Dashboard />} />             
                <Route element={<PrivateRoute allowedRoles={[1]} />}>
                  <Route path="/results" element={<Votes />} />
                  <Route path="/audit" element={<Audit />} />
                  <Route path="/configuration" element={<Configuration />} />
                  <Route path="/votantes" element={<Voters />} />
                  <Route path="/groupsposiciones" element={<DepartamentPositions />} />
                </Route>
              </Route>
              </Route>
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
