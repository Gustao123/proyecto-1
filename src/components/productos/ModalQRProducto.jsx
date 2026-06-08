import React from "react";
import { Modal, Button } from "react-bootstrap";
import QRCode from "react-qr-code";

const ModalQRProducto = ({
  mostrarModalQR,
  setMostrarModalQR,
  productoQR
}) => {
  if (!productoQR) return null;

  return (
    <Modal
      show={mostrarModalQR}
      onHide={() => setMostrarModalQR(false)}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>QR del Producto</Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center">
        <h5>{productoQR.nombre_producto}</h5>

        <div className="bg-white p-3 d-inline-block">
          <QRCode
            value={JSON.stringify({
              id: productoQR.id_producto,
              nombre: productoQR.nombre_producto,
              precio: productoQR.precio_venta,
              descripcion: productoQR.descripcion_producto
            })}
            size={220}
          />
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setMostrarModalQR(false)}
        >
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalQRProducto;