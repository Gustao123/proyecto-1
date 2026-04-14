import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import ModalRegistroCategoria from "../components/categorias/ModalRegistroCategoria";
import NotificacionOperacion from "../components/NotificacionOperacion";
import TablaCategoria from "../components/categorias/TablaCategorias";

const Categorias = () => {

    const [toast, setToast] = useState({ 
        mostrar: false, 
        mensaje: "", 
        tipo: "" 
    });

    


    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
    const [categoriaAEliminar, setCategoriaAEliminar]= useState(null);
    const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);


    const [categoriaEditar, setCategoriaEditar]= useState({
        id_categoria: "",
        nombre_categoria: "",
        descripcion_categoria: "",
    });

    const [mostrarModal, setMostrarModal] = useState(false);

    const [nuevaCategoria, setNuevaCategoria] = useState({
        nombre_categoria: "",
        descripcion_categoria: "",
    });

    const manejoCambioInput = (e) => {
        const { name, value } = e.target;
        setNuevaCategoria((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const abrirModalEdicion = (categoria)=>{
        setCategoriaEditar({
            id_categoria: categoria.id_categoria,
            nombre_categoria: categoria.nombre_categoria,
            descripcion_categoria: categoria.descripcion_categoria,
        });
        setMostrarModalEdicion(true);
    };


    const abrirModalEliminacion = (categoria)=>{
        setCategoriaAEliminar(categoria);
        setMostrarModalEliminacion(true);
    };


    const cargarCategoria = async()=>{
        try{
            setCargando(true);
            const {data, error} = await supabase
            .from("categorias")
            .select("*")
            .order("id_categoria", {ascending: true});
            if(error){
                console.error("Error al cargar categorias:", error.message);
                setToast({
                    mostrar:true,
                    mensaje:"Error al cargar categorias.",
                    tipo:"error"
                });
                return;
            }
            setCategorias(data || []);
        }catch (err){
            console.error("Excepcion al cargar categorias:", err.message)
            setToast({
                mostrar:true,
                mensaje: "Error inesperado al cargar categorias.",
                tipo: "error",
            });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
    cargarCategoria();
    }, []);




    const agregarCategoria = async () => {
        try {
            if (!nuevaCategoria.nombre_categoria.trim() || 
                !nuevaCategoria.descripcion_categoria.trim()) {
                setToast({
                    mostrar: true,
                    mensaje: "Debes llenar todos los campos.",
                    tipo: "advertencia",
                });
                return;
            }

            const { error } = await supabase.from("categorias").insert([
                {
                    nombre_categoria: nuevaCategoria.nombre_categoria,
                    descripcion_categoria: nuevaCategoria.descripcion_categoria,
                },
            ]);

            if (error) throw error;

            setToast({
                mostrar: true,
                mensaje: `Categoría "${nuevaCategoria.nombre_categoria}" registrada exitosamente`,
                tipo: "exito",
            });

            await cargarCategoria();
        
        
            setNuevaCategoria({ nombre_categoria: "", descripcion_categoria: "" });
            setMostrarModal(false);

        } catch (err) {
            console.error("Error al agregar categoría:", err);
            setToast({
                mostrar: true,
                mensaje: "Error al registrar la categoría.",
                tipo: "error",
            });
        }
    };

    return (
        <Container>
        <Row className="align-items-center mb-3">
                <Col xs={9} sm={7} md={7} lg={7}>
                    <h3 className="mb-0">
                        <i className="bi-bookmark-plus-fill me-2"></i>
                        Categorías
                    </h3>
                </Col>
                <Col xs={3} sm={5} md={5} lg={5} className="text-end">
                    <Button onClick={() => setMostrarModal(true)} size="md">
                        <i className="bi-plus-lg"></i>
                        <span className="d-none d-sm-inline ms-2">Nueva Categoría</span>
                    </Button>
                </Col>
            </Row>

            <hr />

            {cargando && (
                <Row className="text-center my-5">
                    <Col>
                    <Spinner animation="border" variant="success" size="lg"/>
                    <p className="mt-3 text-muted">Cargando categorias...</p>
                    </Col>
                </Row>
            )}

            {!cargando && categorias.length>0 &&(
                <Row>
                    <Col lg={12} className="d-none d-lg-block">
                        <TablaCategoria
                        categorias={categorias}
                        abrirModalEdicion={abrirModalEdicion}
                        abrirModalEliminacion={abrirModalEliminacion}
                        />
                    </Col>
                </Row>
            )}

            <ModalRegistroCategoria
                mostrarModal={mostrarModal}
                setMostrarModal={setMostrarModal}
                nuevaCategoria={nuevaCategoria}
                manejoCambioInput={manejoCambioInput}
                agregarCategoria={agregarCategoria}
            />

            <NotificacionOperacion
                mostrar={toast.mostrar}
                mensaje={toast.mensaje}
                tipo={toast.tipo}
                onCerrar={() => setToast({ ...toast, mostrar: false })}
            />
            </Container>
    
    );
};

export default Categorias;