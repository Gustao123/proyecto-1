import React, {useState, useEffect} from "react";
import {Table, Spinner, Button} from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaProductos = ({
  productos,
  categorias,
  abrirModalEdicion,
  abrirModalEliminacion
}) => {

  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    setLoading(!(productos && productos.length > 0));
  },[productos]);

  return(
    <>
      {loading ? (
        <div className="text-center">
          <h5>Cargando productos...</h5>
          <Spinner animation="border" variant="success"/>
        </div>
      ) : (
        <Table striped hover responsive size="sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th className="d-none d-md-table-cell">Descripción</th>
              <th className="text-center">Imagen</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {productos.map((producto)=>{

              const categoria = categorias.find(
                cat => cat.id_categoria === producto.categoria_producto
              );

              return(
                <tr key={producto.id_producto}>
                  <td>{producto.id_producto}</td>

                  <td>{producto.nombre_producto}</td>

                  <td>
                    {categoria ? categoria.nombre_categoria : "Sin categoría"}
                  </td>

                  <td>${producto.precio_venta}</td>

                  <td className="d-none d-md-table-cell">
                    {producto.descripcion_producto}
                  </td>

                  <td className="text-center">
                    <img
                      src={producto.url_imagen || "https://via.placeholder.com/50"}
                      alt={producto.nombre_producto}
                      style={{
                        width:"50px",
                        height:"50px",
                        objectFit:"cover",
                        borderRadius:"6px"
                      }}
                    />
                  </td>

                  <td className="text-center">
                    <Button
                      size="sm"
                      variant="outline-warning"
                      className="me-1"
                      onClick={()=> abrirModalEdicion(producto)}
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={()=> abrirModalEliminacion(producto)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default TablaProductos;