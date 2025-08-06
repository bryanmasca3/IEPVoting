import React from 'react'
import logoImage from "./../assets/logo.png";
import {    
    Box
  } from "@mui/material";
const Welcome = () => {
  return (
    <div className="flex flex-col md:flex-row">
        {/* Izquierda */}
        <div className="w-full flex flex-col items-center justify-center p-10 gap-4">          
            <h1 className="text-2xl font-bold mb-4"> Iglesia Evangelica Peruana</h1>
            <Box
                component="img"
                alt="profile"
                src={logoImage}
                height="150px"
                width="150px"
                borderRadius="50%"
                sx={{ objectFit: "cover" }}
              />
            <h3 className="text-5xl font-bold mb-4 text-center">
            ELECCIONES <br></br>GENERALES <br></br>2025
            </h3>
            
        
        </div>
    </div>
  )
}

export default Welcome