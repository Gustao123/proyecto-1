import React, { Children } from "react";
import { Navigate } from "react-router-dom";

const RutaProtegida = ({children})=>{

  const estaLogueado = !!localStorage.getItem("usuario-supabase");

  console.log("Usuario autenticado:", estaLogueado);

  return estaLogueado ? children : <Navigate to="/login" replace />;
};


export default RutaProtegida;