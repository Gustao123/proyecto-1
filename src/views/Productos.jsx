import React, {useEffect, useState} from "react"
import {Container, Row, Col, Button, Alert, Spinner} from "react-bootstrap"
import {supabase} from "../database/supabaseconfig"
import ModalRegistroProducto from "../components/productos/ModalRegistroProducto"
import NotificacionOperacion from "../components/NotificacionOperacion"
import ModalEdicionProducto from "../components/productos/ModalEdicionProducto"
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas"
import TablaProductos from "../components/productos/TablaProductos"
import TarjetaProductos from "../components/productos/TarjetasProductos"
import ModalEliminacionProducto from "../components/productos/ModalEliminacionProducto"


const Productos =()=>{

  const [productos,setProductos]= useState([]);
  const [productosFiltrados, setProductosFlitrados] = useState([])
  const [categorias, setCategorias] = useState([])
  const [textoBusqueda, setTextoBusqueda] = useState("")
  const [cargando, setCargando] = useState(true)

  const [mostrarModal, setMostrarModal] = useState(false)
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false)
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false)


  const  [nuevoProducto, setNuevoProducto] = useState({
    nombre_producto:"",
    descripcion_producto: "",
    categoria_producto:"",
    precio_venta: "",
    archivo: null,
  });


  const [productoEditar, setProductoEditar] = useState({
    id_producto: "",
    nombre_producto:"",
    descripcion_producto:"",
    categoria_producto:"",
    precio_venta:"",
    url_imagen:"",
    archivo:null
  })

  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [toast, setToast] = useState ({mostrar:false, mensaje:"", tipo:""})

  
 const cargarProductos = async () => {
  try {
    const { data, error } = await supabase
      .from("productos")
      .select(`
        *,
        categorias(nombre_categoria)
      `)
      .order("id_producto", { ascending: true });

    if (error) throw error;

    setProductos(data || []);
    setProductosFlitrados(data || []);
  } catch (err) {
    console.error("Error al cargar productos:", err);
  } finally {
    setCargando(false);
  }
};

  const manejoCambioInput = (e) =>{
    const {name, value} = e.target;
    setNuevoProducto((prev)=>({...prev, [name]: value}));
  };

  const manejoCambioArchivo = (e)=>{
    const archivo = e.target.files[0];
    if (archivo && archivo.type.startsWith("image/")){
      setNuevoProducto((prev) => ({...prev, archivo}));
    }else{
      alert("Selecciona una imagen Válida (JPG, PNG, etc.)");
    }
  };

  const manejarBusqueda = (e) =>{
    setTextoBusqueda(e.target.value);
  };

  useEffect(()=>{
    if (!textoBusqueda.trim()){
      setProductosFlitrados(productos);
    }else{
      const textoLower = textoBusqueda.toLowerCase().trim();
      const filtrados = productos.filter((prod)=>{
        const nombre = prod.nombre_producto?.toLowerCase() ||"";
        const descripcion = prod.descripcion_producto?.toLowerCase() ||"";
        const precio = prod.precio_venta?.toString() || "";
        return(
          nombre.includes(textoLower)||
          descripcion.includes(textoLower)||
          precio.includes(textoLower)
        );
      });
      setProductosFlitrados(filtrados);
    }
  },[textoBusqueda, productos]);


  useEffect(()=>{
    cargarCategorias();
    cargarProductos(); 
  }, []);


  const cargarCategorias = async () => {
    try {
      const {data, error } = await supabase
      .from("categorias")
      .select("*")
      .order("id_categoria", {ascending: true});
      if (error) throw error;
      setCategorias(data || []);
    }catch (err){
      console.error("Error al cargar categorias:", err);
    }
  };

  const agregarProducto = async () =>{
    try {
      if (
        !nuevoProducto.nombre_producto.trim() ||
        !nuevoProducto.categoria_producto ||
        !nuevoProducto.precio_venta ||
        !nuevoProducto.archivo
      ) {
        setToast({
          mostrar:true,
          mensaje: "Completa los campos Obligatorios (nombre, categoria, precio e imagen)",
          tipo: "advertencia",
        });
        return;
      }

      setMostrarModal(false);

      const nombreArchivo = `${Date.now()}_${nuevoProducto.archivo.name}`;

      const {error: uploadError } = await supabase.storage
      .from("imagenes_productos")
      .upload(nombreArchivo, nuevoProducto.archivo);

      if(uploadError) throw uploadError;

      const {data:urlData} = supabase.storage
      .from("imagenes_productos")
      .getPublicUrl(nombreArchivo);
      const urlPublica = urlData.publicUrl;

      const {error} = await supabase.from("productos").insert([
        {
          nombre_producto: nuevoProducto.nombre_producto,
          descripcion_producto: nuevoProducto.descripcion_producto || null,
          categoria_producto:nuevoProducto.categoria_producto,
          precio_venta: parseFloat(nuevoProducto.precio_venta),
          url_imagen: urlPublica,
        },
      ]);

      if (error) throw error;

      await cargarProductos();

      setNuevoProducto({
        nombre_producto:"",
        descripcion_producto:"",
        categoria_producto:"",
        precio_venta:"",
        archivo:null,
      });

      setToast({ mostrar:true, mensaje: "Producto registrado correctamente", tipo: "exito"});

    }catch (err){
      console.error("Error al agregar producto", err);
      setToast({mostrar: true, mensaje: "Error al registrar producto", tipo: "error"});
    }
  };


  const manejoCambioInputEdicion = (e) =>{
    const {name, value} = e.target;
    setProductoEditar((prev) =>({...prev,[name]:value}));
  };

  const manejoCambioArchivoActulizar = (e) => {
    const archivo = e.target.files[0];
    if (archivo && archivo.type.startsWith("image/")){
      setProductoEditar((prev)=>({...prev, archivo}));

    }else {
      alert("Selecciona una imagen valida (JPG, PNG, etc.)")
    }
  };



  const actualizarProducto = async () =>{
    try{
      if(
        !productoEditar.nombre_producto.trim() ||
        !productoEditar.categoria_producto ||
        !productoEditar.precio_venta
      ) {
        setToast({
          mostrar:true,
          mensaje:"Complete los Campos obligatorios",
          tipo:"advertencia",
        });
        return
      }

      setMostrarModalEdicion(false)

      let datosActualizados = {
        nombre_producto:productoEditar.nombre_producto,
        descripcion_producto:productoEditar.descripcion_producto || null,
        categoria_producto: productoEditar.categoria_producto,
        precio_venta: parseFloat(productoEditar.precio_venta),
        url_imagen: productoEditar.url_imagen,
      };

      if (productoEditar.archivo){
        const nombreArchivo = `${Date.now()}_${productoEditar.archivo.name}`;

        const {error:uploadError} = await supabase.storage
        .from("imagenes_productos")
        .upload(nombreArchivo,productoEditar.archivo);

        if (uploadError) throw uploadError;

        const {data:urlData} = supabase.storage
        .from("imagenes_productos")
        .getPublicUrl(nombreArchivo);
        datosActualizados.url_imagen= urlData.publicUrl;

        if (productoEditar.url_imagen){
          const nombreAnterior = productoEditar.url_imagen.split("/").pop().split("?")[0];
          await supabase.storage.from("imagenes_productos").remove([nombreAnterior]).catch(()=>{});
        }

      }

      const {error} = await supabase
      .from("productos")
      .update(datosActualizados)
      .eq("id_producto", productoEditar.id_producto);

      if  (error) throw error;

      await cargarProductos();

      setProductoEditar({
        id_producto:"",
        nombre_producto:"",
        descripcion_producto:"",
        categoria_producto:"",
        precio_venta:"",
        url_imagen:"",
        archivo:null,
      });

      setToast({mostrar:true, mensaje:"producto actualizado correctamente", tipo:"exito"});

    }catch (err){
      console.error("Error al actualizar:", err);
      setToast({mostrar:true, mensaje: "Error al actualizar producto", tipo:"error"});
    }
  };


  const eliminarProducto = async () => {
  if (!productoAEliminar) return;

  try {
    setMostrarModalEliminacion(false);

    // eliminar imagen del storage
    if (productoAEliminar.url_imagen) {
      const nombreImagen = productoAEliminar.url_imagen
        .split("/")
        .pop()
        .split("?")[0];

      await supabase.storage
        .from("imagenes_productos")
        .remove([nombreImagen])
        .catch(() => {});
    }

    // eliminar producto
    const { error } = await supabase
      .from("productos")
      .delete()
      .eq("id_producto", productoAEliminar.id_producto);

    if (error) throw error;

    await cargarProductos();

    setToast({
      mostrar: true,
      mensaje: `Producto ${productoAEliminar.nombre_producto} eliminado correctamente`,
      tipo: "exito",
    });

  } catch (err) {
    console.error("Error al eliminar producto:", err);
    setToast({
      mostrar: true,
      mensaje: "Error al eliminar producto",
      tipo: "error",
    });
  }
};


  return(
    <Container className="mt-3">

  <Row className="align-items-center mb-3">
    <Col xs={9} sm={7} md={7} lg={7}>
      <h3 className="mb-0">
        <i className="bi-bag-heart-fill me-2"></i>
        Productos
      </h3>
    </Col>

    <Col xs={3} sm={5} md={5} lg={5} className="text-end">
      <Button onClick={() => setMostrarModal(true)} size="md">
        <i className="bi-plus-lg"></i>
        <span className="d-none d-sm-inline ms-2">Nuevo producto</span>
      </Button>
    </Col>
  </Row>

  <hr />

  <Row className="mb-4">
    <Col md={6} lg={5}>
      <CuadroBusquedas
        textoBusqueda={textoBusqueda}
        manejarCambioBusqueda={manejarBusqueda}
        placeholder="Buscar por nombre, descripcion o precio..."
      />
    </Col>
  </Row>

  
  {!cargando && textoBusqueda.trim() && productosFiltrados.length === 0 && (
    <Row className="mb-4">
      <Col>
        <Alert variant="info" className="text-center">
          <i className="bi bi-info-circle me-2"></i>
          No se encontraron productos con "{textoBusqueda}"
        </Alert>
      </Col>
    </Row>
  )}

  {/* LOADING */}
  {cargando && (
    <Row className="text-center my-5">
      <Col>
        <Spinner animation="border" variant="success" />
        <p className="mt-3 text-muted">Cargando productos...</p>
      </Col>
    </Row>
  )}

  {/* TABLA (PC) */}
  {!cargando && productos.length > 0 && (
    <Row>
      <Col lg={12} className="d-none d-lg-block">
        <TablaProductos
        categorias={categorias}
          productos={productosFiltrados}
          abrirModalEdicion={(prod) => {
            setProductoEditar(prod);
            setMostrarModalEdicion(true);
          }}
          abrirModalEliminacion={(prod) => {
            setProductoAEliminar(prod);
            setMostrarModalEliminacion(true);
          }}
        />
      </Col>
    </Row>
  )}

  
  <Col xs={12} className="d-lg-none">
    <TarjetaProductos
    categorias={categorias}
      productos={productosFiltrados}
      abrirModalEdicion={(prod) => {
        setProductoEditar(prod);
        setMostrarModalEdicion(true);
      }}
      abrirModalEliminacion={(prod) => {
        setProductoAEliminar(prod);
        setMostrarModalEliminacion(true);
      }}
    />
  </Col>

  {/* MODALES */}
  <ModalRegistroProducto
    mostrarModal={mostrarModal}
    setMostrarModal={setMostrarModal}
    nuevoProducto={nuevoProducto}
    manejoCambioInput={manejoCambioInput}
    manejoCambioArchivo={manejoCambioArchivo}
    agregarProducto={agregarProducto}
    categorias={categorias}
  />

  <ModalEliminacionProducto
  mostrarModalEliminacion={mostrarModalEliminacion}
  setMostrarModalEliminacion={setMostrarModalEliminacion}
  eliminarProducto={eliminarProducto}
  producto={productoAEliminar}
/>

  <ModalEdicionProducto
    mostrarModalEdicion={mostrarModalEdicion}
    setMostrarModalEdicion={setMostrarModalEdicion}
    productoEditar={productoEditar}
    manejoCambioInputEdicion={manejoCambioInputEdicion}
    manejoCambioArchivoActualizar={manejoCambioArchivoActulizar}
    actualizarProducto={actualizarProducto}
    categorias={categorias}
  />

  <NotificacionOperacion
    mostrar={toast.mostrar}
    mensaje={toast.mensaje}
    tipo={toast.tipo}
    onCerrar={() => setToast({ ...toast, mostrar: false })}
  />

</Container>
  );
}

export default Productos;