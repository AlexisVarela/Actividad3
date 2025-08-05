const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let productos = [
    {id:1, nombre: "laptop", precio:200},
    {id:2, nombre: "mouse", precio:20},
    {id:3, nombre: "monitor", precio:150}
]

app.get('/', (req, res) => {
    res.send('HOla')
})

app.get('/productos', (req, res) => {
    res.json({
        success:true,
        data:productos,
        count: productos.length
    })
})


try {
    app.get('/productos/:id', (req, res) => {
    const id = parseInt(req.params.id)
    if(isNaN(id)) {
        return res.status(400).json({
            success:true,
            message:'El id debe ser numerico'
        });
    };

    const producto = productos.find( p => p.id === id);
        if(producto){
            res.json({
                success:true,
                data:producto
            });
        }else{
            res.status(400).json({
                success:false,
                message:'producto con ID'
            });
        }; 

    });
} 
catch (error) {
        console.error('Error en el endpoint /products/:id:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
}

// tercer endpoint
app.post('/productos', (req, res) => {
    try {
        const {nombre, precio} = req.body
        // validación
        if (!nombre || typeof nombre !== 'string' || nombre.trim()==='') {
            return res.status(400).json ({
                success:true,
                message: 'Es requerido el nombre, debe de ser una cadena y no debe estar vacio'
            })
        }

        // agregar un maximo del ya existente
        const nuevoid = productos.length > 0
            ? Math.max(...productos.map(p => p.id)) + 1 : 1; 

        const nuevoProducto = {
            id: nuevoid,
            nombre: nombre.trim(), 
            precio:Number(precio)
        };
        
        productos.push(nuevoProducto);

        return res.status(201).json({
            success:true,
            message: "Producto creado con exito",
            data: nuevoProducto
        });

    } catch (error) {
        return res.status(501).json({
            success:false,
            message: "Error al crear el nuevo producto"
        });
    }
});

app.use((req, res) => {
    res.status(401).json({
        success:false,
        message: "Error al encontrar la página"
    })
});

app.listen(PORT, () =>{
    console.log(`Corriendo en el puerto http://localhost:${PORT}`);
})
