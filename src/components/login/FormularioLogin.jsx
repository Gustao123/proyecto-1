import React from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";

const FormularioLogin = ({
  usuario,
  contrasena,
  error,
  setUsuario,
  setContrasena,
  iniciarSesion,
}) => {
  
  const manejarEnvio = (e) => {
    e.preventDefault(); // Evita que la página se recargue
    iniciarSesion();    // Llama a la función de Supabase
  };

  return (
    <Card style={{ minWidth: "320px", maxWidth: "400px", width: "100%" }} className="p-4 shadow-lg">
      <Card.Body>
        <h3 className="text-center mb-4">Iniciar Sesión</h3>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={manejarEnvio}>
          <Form.Group className="mb-3">
            <Form.Label>Correo Electrónico</Form.Label>
            <Form.Control
              type="email" // Cambiado a email para mejor validación
              placeholder="ejemplo@correo.com"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="Ingresa tu contraseña"
              value={contrasena} 
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </Form.Group>

          <Button type="submit" variant="primary" className="w-100">
            Iniciar Sesión
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FormularioLogin;