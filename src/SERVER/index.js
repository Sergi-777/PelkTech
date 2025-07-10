const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json()); // Necesario para leer JSON en POST

// Configurar conexión a MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'pelktech',
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
  } else {
    console.log('✅ Conectado a la base de datos MySQL');
  }
});

// ============GET ROUTES===========
//        GET ROUTES
// =======================

// Ruta raíz - Verifica que el servidor funciona
app.get('/', (req, res) => {
  res.send('Servidor funcionando 🚀');
});

// Obtener la cantidad total de productos en el carrito por email
// index.js o rutas/carrito.js
app.get('/carrito/cantidad', (req, res) => {
  const email = req.query.email;

  const query = `
    SELECT SUM(ci.quantity) AS totalCantidad
    FROM carritos c
    JOIN carrito_items ci ON c.id = ci.carrito_id
    WHERE c.email = ?
  `;

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error al obtener la cantidad de productos del carrito:", err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    const totalCantidad = results[0].totalCantidad || 0;
    res.json({ cantidad: totalCantidad });
  });
});


// Obtener los productos del carrito de un usuario
app.get('/carrito/productos', (req, res) => {
  const email = req.query.email;
  const query = `
    SELECT ci.*, p.stock AS stock_actual
    FROM carritos c
    JOIN carrito_items ci ON c.id = ci.carrito_id
    JOIN productos p ON ci.producto_id = p.id
    WHERE c.email = ?
    ORDER BY ci.id DESC
  `;

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error al obtener productos del carrito:', err);
      return res.status(500).json({ error: 'Error al obtener carrito' });
    }
    res.json(results);
  });
});

// Obtener dispositivos
app.get('/dispositivos/:email', (req, res) => {
  const email = req.params.email;
  db.query('SELECT * FROM dispositivos WHERE cliente_email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: true });
    res.json(results);
  });
});

// Obtener historial del cliente
app.get('/historial/:email', (req, res) => {
  const email = req.params.email;
  db.query('SELECT * FROM historial_mantenimiento WHERE cliente_email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: true });
    res.json(results);
  });
});



// Obtener todos los productos
app.get('/productos', (req, res) => {
  db.query('SELECT * FROM productos', (err, results) => {
    if (err) {
      console.error('Error al obtener productos:', err);
      res.status(500).json({ error: 'Error al obtener productos' });
    } else {
      res.json(results);
    }
  });
});

// Obtener redes sociales (solo id=1)
app.get('/redes', (req, res) => {
  db.query('SELECT * FROM redes WHERE id = 1', (err, results) => {
    if (err) {
      console.error('Error al obtener redes:', err);
      res.status(500).json({ error: 'Error al obtener redes' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'No se encontraron redes' });
    } else {
      res.json(results[0]); // solo la fila con id = 1
    }
  });
});

// Buscar empleado por email (devuelve todos los datos)
app.get('/empleados/email/:email', (req, res) => {
  const email = req.params.email;
  db.query('SELECT * FROM empleados WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error interno del servidor' });
    if (results.length === 0) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(results[0]);
  });
});

// Buscar cliente por email
app.get('/clientes/:email', (req, res) => {
  const email = req.params.email;
  db.query('SELECT * FROM clientes WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error al obtener cliente:', err);
      return res.status(500).json({ error: 'Error al obtener cliente' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(results[0]);
  });
});

// Buscar nombre del empleado por email (solo nombre)
app.get('/empleados/nombre/:email', (req, res) => {
  const email = req.params.email;
  db.query('SELECT name FROM empleados WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error interno' });
    if (results.length === 0) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json({ name: results[0].name });
  });
});

app.get('/historial_compras/:email', (req, res) => {
  const email = req.params.email;
  db.query('SELECT * FROM historial_compras WHERE cliente_email = ? ORDER BY created_at DESC', [email], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener historial_compras:', err);
      return res.status(500).json({ error: true });
    }

    // Parsear los campos items JSON
    const data = results.map(entry => ({
      ...entry,
      items: JSON.parse(entry.items || '[]')
    }));

    res.json(data);
  });
});
app.get('/historial_mantenimiento/:email', (req, res) => {
  const email = req.params.email;

  db.query(
    'SELECT * FROM historial_mantenimiento WHERE cliente_email = ? ORDER BY created_at DESC',
    [email],
    (err, results) => {
      if (err) {
        console.error('❌ Error al obtener historial de mantenimiento:', err);
        return res.status(500).json({ error: true });
      }
      res.json(results);
    }
  );
});

app.get('/empleados/email/:email', async (req, res) => {
  const email = req.params.email.toLowerCase(); // 👈 normaliza

  try {
    const [rows] = await connection.promise().query(
      'SELECT name, email, rol, telefono FROM empleados WHERE LOWER(email) = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error al obtener el empleado:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.get('/tickets', (req, res) => {
  db.query(
    'SELECT * FROM historial_mantenimiento ORDER BY status, created_at DESC',
    (err, results) => {
      if (err) {
        console.error('❌ Error al obtener todos los tickets:', err);
        return res.status(500).json({ error: true });
      }
      res.json(results);
    }
  );
});

// Obtener todos los carritos desde historial_compras
app.get('/carritos', (req, res) => {
  const query = 'SELECT * FROM historial_compras ORDER BY created_at DESC';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener los carritos:', err);
      return res.status(500).json({ error: 'Error al obtener los carritos' });
    }

    // Parsear los items de texto a JSON
    const carritosParseados = results.map(carrito => ({
      ...carrito,
      items: safeParse(carrito.items)
    }));

    res.json(carritosParseados);
  });
});

function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}

app.get('/clientes/email/:email', (req, res) => {
  const email = decodeURIComponent(req.params.email);

  const query = 'SELECT * FROM clientes WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error al buscar cliente:', err);
      return res.status(500).json({ success: false, message: 'Error en la base de datos' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }

    res.json(results[0]); // <-- importante: enviar un solo objeto, no array
  });
});

app.get('/redes', (req, res) => {
  db.query('SELECT * FROM redes_sociales LIMIT 1', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener redes' });
    res.json(results[0] || {});
  });
});
app.get('/empleados', (req, res) => {
  const query = 'SELECT * FROM empleados ORDER BY fecha_vinculacion DESC';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json(results); // ✅ Esto es un array. NO lo pongas dentro de un objeto como { empleados: results }
  });
});

// =============POST ROUTES==========
// =======================


// Necesrio para hacer login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  // Buscar en empleados
  db.query("SELECT * FROM empleados WHERE email = ? AND password = ?", [email, password], (err, empResults) => {
    if (err) {
      console.error("Error al buscar empleado:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    if (empResults.length > 0) {
      const emp = empResults[0];
      return res.json({ email: emp.email, rol: emp.rol.toUpperCase() });
    }

    // Si no es empleado, buscar en clientes
    db.query("SELECT * FROM clientes WHERE email = ? AND password = ?", [email, password], (err, cliResults) => {
      if (err) {
        console.error("Error al buscar cliente:", err);
        return res.status(500).json({ error: "Error en el servidor" });
      }

      if (cliResults.length > 0) {
        const cli = cliResults[0];
        return res.json({ email: cli.email, rol: "USER" });
      }

      return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    });
  });
});

// Subir productos masivamente desde JSON

app.post('/productos', (req, res) => {
  const productos = req.body;

  if (!Array.isArray(productos)) {
    return res.status(400).json({ error: 'El cuerpo debe ser un arreglo de productos' });
  }

  const insertQuery = `
    INSERT INTO productos (category, description, name, price, stock, url)
    VALUES ?
  `;

  const values = productos.map(p => [
    p.category,
    p.description,
    p.name,
    p.price,
    p.stock,
    p.url
  ]);

  db.query(insertQuery, [values], (err, result) => {
    if (err) {
      console.error('Error al insertar productos:', err);
      return res.status(500).json({ error: 'Error al insertar productos' });
    }
    res.json({ message: 'Productos insertados correctamente', inserted: result.affectedRows });
  });
});

// Agregar producto al carrito de un usuario
app.post('/carrito/agregar', async (req, res) => {
  const { email, productoId, cantidad } = req.body;
  if (!email || !productoId || !cantidad) {
    return res.status(400).json({ success: false, message: 'Faltan datos' });
  }

  try {
    const dbp = db.promise();

    const [carritoRows] = await dbp.query(
      "SELECT id FROM carritos WHERE email = ? ORDER BY created_at DESC LIMIT 1",
      [email]
    );

    let carritoId;
    if (carritoRows.length > 0) {
      carritoId = carritoRows[0].id;
    } else {
      const [result] = await dbp.query(
        "INSERT INTO carritos (email, created_at) VALUES (?, NOW())",
        [email]
      );
      carritoId = result.insertId;
    }

    const [itemRows] = await dbp.query(
      "SELECT quantity FROM carrito_items WHERE carrito_id = ? AND producto_id = ?",
      [carritoId, productoId]
    );

    if (itemRows.length > 0) {
      await dbp.query(
        "UPDATE carrito_items SET quantity = quantity + ? WHERE carrito_id = ? AND producto_id = ?",
        [cantidad, carritoId, productoId]
      );
    } else {
      const [productos] = await dbp.query(
        "SELECT name, description, category, url, stock, price FROM productos WHERE id = ?",
        [productoId]
      );
      if (productos.length === 0) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      }
      const p = productos[0];

      await dbp.query(
        `INSERT INTO carrito_items 
         (carrito_id, producto_id, name, description, category, url, quantity, price, stock)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [carritoId, productoId, p.name, p.description, p.category, p.url, cantidad, p.price, p.stock]
      );
    }

    return res.json({ success: true, carritoId });

  } catch (err) {
    console.error('❌ Error en /carrito/agregar:', err);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Registrar un nuevo cliente
// POST /clientes
// Ruta para registrar cliente
app.post("/clientes", (req, res) => {
  const { email, password, name, lastName } = req.body;

  const query = "INSERT INTO clientes (email, password, nombre, apellido) VALUES (?, ?, ?, ?)";
  db.query(query, [email, password, name, lastName], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al registrar cliente" });
    res.json({ success: true });
  });
});

app.post('/historial_compras', (req, res) => {
  const { cliente_email, total, items, status = 'COMPLETADO', encargado = 'SIN ASIGNAR' } = req.body;
  const id = uuidv4(); // Generar ID único

  if (!cliente_email || !total || !Array.isArray(items)) {
    return res.status(400).json({ success: false, message: 'Faltan datos o items no es un arreglo' });
  }

  const query = `
    INSERT INTO historial_compras (id, cliente_email, total, items, estado, encargado)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [id, cliente_email, total, JSON.stringify(items), status, encargado], (err, result) => {
    if (err) {
      console.error('❌ Error al insertar en historial_compras:', err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true, id });
  });
});
app.post('/dispositivos', (req, res) => {
  const { cliente_email, nombre, marca, modelo, serie, observaciones } = req.body;

  if (!cliente_email || !marca) {
    return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
  }

  const query = `
    INSERT INTO dispositivos (cliente_email, nombre, marca, modelo, serie, observaciones)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [cliente_email, nombre, marca, modelo, serie, observaciones], (err, result) => {
    if (err) {
      console.error("❌ Error al insertar dispositivo:", err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true, id: result.insertId });
  });
});


app.post('/carrito/comprar', async (req, res) => {
  const { email, encargado = 'SIN ASIGNAR' } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Falta el email del cliente' });
  }

  try {
    const dbp = db.promise();

    const [carritos] = await dbp.query(
      "SELECT id FROM carritos WHERE email = ? ORDER BY created_at DESC LIMIT 1",
      [email]
    );

    if (carritos.length === 0) {
      return res.status(404).json({ success: false, message: 'Carrito no encontrado' });
    }

    const carritoId = carritos[0].id;

    const [items] = await dbp.query(
      "SELECT * FROM carrito_items WHERE carrito_id = ?",
      [carritoId]
    );

    if (items.length === 0) {
      return res.status(400).json({ success: false, message: 'El carrito está vacío' });
    }

    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const id = Date.now() + Math.floor(Math.random() * 1000); // ID único y largo

    await dbp.query(
      `INSERT INTO historial_compras (id, cliente_email, total, items, estado, encargado)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, email, total, JSON.stringify(items), 'PENDIENTE', encargado]
    );

    await dbp.query("DELETE FROM carrito_items WHERE carrito_id = ?", [carritoId]);

    return res.json({ success: true, message: 'Compra realizada y productos movidos a historial', id });

  } catch (error) {
    console.error('❌ Error al procesar compra:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.post('/redes', (req, res) => {
  const { facebook, instagram, correo, twitter, whatsapp } = req.body;
  const query = `
    INSERT INTO redes_sociales (facebook, instagram, correo, twitter, whatsapp)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(query, [facebook, instagram, correo, twitter, whatsapp], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al crear redes' });
    res.json({ success: true, id: result.insertId });
  });
});


app.listen(3001, () => {
  console.log("Servidor backend corriendo en http://localhost:3001");
});

app.post('/mantenimiento', (req, res) => {
  const { cliente_email, dispositivo_id, status, tipo, descripcion } = req.body;

  if (!cliente_email || !dispositivo_id || !status || !tipo || !descripcion) {
    return res.status(400).json({ success: false, message: 'Faltan datos' });
  }

  const id = Date.now() + Math.floor(Math.random() * 1000); // ID único y largo

  const query = `
    INSERT INTO historial_mantenimiento 
    (id, cliente_email, dispositivo_id, status, tipo, descripcion)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [id, cliente_email, dispositivo_id, status, tipo, descripcion], (err, result) => {
    if (err) {
      console.error('❌ Error al guardar mantenimiento:', err);
      return res.status(500).json({ success: false });
    }

    res.json({ success: true, id });
  });
});
app.post('/productos/uno', (req, res) => {
  const { category, description, name, price, stock, url } = req.body;

  if (!category || !description || !name || !price || !stock) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const query = `
    INSERT INTO productos (category, description, name, price, stock, url)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [category, description, name, price, stock, url], (err, result) => {
    if (err) {
      console.error('❌ Error al insertar producto:', err);
      return res.status(500).json({ error: 'Error al insertar producto' });
    }

    res.json({ success: true, id: result.insertId });
  });
});

app.post('/empleados', (req, res) => {
  const { name, email, rol, telefono } = req.body;

  if (!name || !email || !rol) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
  }

  const query = 'INSERT INTO empleados (name, email, rol, telefono, fecha_vinculacion) VALUES (?, ?, ?, ?, NOW())';
  db.query(query, [name, email, rol, telefono], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, id: result.insertId });
  });
});



// ============PUT ROUTES===========
// Actualizar redes sociales por id
app.put('/redes/:id', (req, res) => {
  const id = req.params.id;
  const { facebook, instagram, correo, twitter, whatsapp } = req.body;

  const updateQuery = `
    UPDATE redes
    SET facebook = ?, instagram = ?, correo = ?, twitter = ?, whatsapp = ?
    WHERE id = ?
  `;

  db.query(updateQuery, [facebook, instagram, correo, twitter, whatsapp, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar redes:', err);
      return res.status(500).json({ error: 'Error al actualizar redes' });
    }

    res.json({ message: 'Redes actualizadas correctamente' });
  });
});

// Actualizar datos de un cliente por email
app.put('/clientes/:email', (req, res) => {
  const email = req.params.email;
  const { name, lastName, telefono, direccion } = req.body;

  db.query(
    'UPDATE clientes SET nombre = ?, apellido = ?, telefono = ?, direccion = ? WHERE email = ?',
    [name, lastName, telefono, direccion, email],
    (err, result) => {
      if (err) {
        console.error("Error en la consulta SQL:", err);
        return res.status(500).json({ success: false, message: 'Error en el servidor' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
      }
      return res.json({ success: true });
    }
  );
});

app.put('/dispositivos/:id', (req, res) => {
  const id = req.params.id;
  const { nombre, marca, modelo, serie, observaciones } = req.body;

  const query = `
    UPDATE dispositivos
    SET nombre = ?, marca = ?, modelo = ?, serie = ?, observaciones = ?
    WHERE id = ?
  `;

  db.query(query, [nombre, marca, modelo, serie, observaciones, id], (err, result) => {
    if (err) {
      console.error("❌ Error al actualizar dispositivo:", err);
      return res.status(500).json({ success: false });
    }

    res.json({ success: true });
  });
});
app.put('/empleados/:email', (req, res) => {
  const email = req.params.email;
  const { name, rol, telefono } = req.body;

  const query = 'UPDATE empleados SET name = ?, rol = ?, telefono = ? WHERE email = ?';
  db.query(query, [name, rol, telefono, email], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    res.json({ success: true, message: 'Empleado actualizado' });
  });
});
app.delete('/empleados/:email', (req, res) => {
  const email = req.params.email;
  const query = 'DELETE FROM empleados WHERE email = ?';
  db.query(query, [email], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    res.json({ success: true, message: 'Empleado eliminado' });
  });
});


app.delete('/dispositivos/:id', (req, res) => {
  const id = req.params.id;

  db.query('DELETE FROM dispositivos WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('❌ Error al eliminar dispositivo:', err);
      return res.status(500).json({ success: false });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Dispositivo no encontrado' });
    }

    res.json({ success: true });
  });
});
app.delete('/productos/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM productos WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('❌ Error al eliminar producto:', err);
      return res.status(500).json({ error: 'Error al eliminar producto' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ success: true });
  });
});

app.put('/empleados/:email', async (req, res) => {
  const email = req.params.email.toLowerCase();
  const { name, telefono } = req.body;

  try {
    // Verificar si ya tiene fecha_vinculacion
    const [rows] = await db.promise().query(
      'SELECT fecha_vinculacion FROM empleados WHERE LOWER(email) = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    const yaTieneVinculacion = rows[0].fecha_vinculacion !== null;

    let query;
    let params;

    if (yaTieneVinculacion) {
      query = 'UPDATE empleados SET name = ?, telefono = ? WHERE LOWER(email) = ?';
      params = [name, telefono, email];
    } else {
      query = 'UPDATE empleados SET name = ?, telefono = ?, fecha_vinculacion = NOW() WHERE LOWER(email) = ?';
      params = [name, telefono, email];
    }

    const [result] = await db.promise().query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    res.json({ message: 'Empleado actualizado correctamente' });

  } catch (err) {
    console.error('❌ Error al actualizar el empleado:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.put('/tickets/:id', async (req, res) => {
  const id = req.params.id;
  const {
    status,
    diagnostico,
    precio,
    pruebas,
    observaciones,
    encargado
  } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Estado es obligatorio' });
  }

  let query = 'UPDATE historial_mantenimiento SET status = ?';
  const params = [status];

  if (diagnostico !== undefined) {
    query += ', diagnostico = ?';
    params.push(diagnostico);
  }
  if (precio !== undefined) {
    query += ', precio = ?';
    params.push(Math.round(Number(precio.toString().replace(/\./g, '').replace(',', '.')))); // evitar decimales
  }
  if (pruebas !== undefined) {
    query += ', pruebas = ?';
    params.push(pruebas);
  }
  if (observaciones !== undefined) {
    query += ', observaciones = ?';
    params.push(observaciones);
  }
  if (encargado !== undefined) {
    query += ', encargado = ?';
    params.push(encargado);
  }

  query += ' WHERE id = ?';
  params.push(id);

  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Error actualizando ticket:', err);
      return res.status(500).json({ success: false, message: 'Error al actualizar' });
    }
    res.json({ success: true });
  });
});

app.put('/carritos/:id', (req, res) => {
  const id = req.params.id;
  const { status, encargado } = req.body;

  if (!status && !encargado) {
    return res.status(400).json({ success: false, message: 'Falta status o encargado' });
  }

  const fields = [];
  const values = [];

  if (status) {
    fields.push('estado = ?');
    values.push(status);
  }

  if (encargado) {
    fields.push('encargado = ?');
    values.push(encargado);
  }

  values.push(id);

  const query = `UPDATE historial_compras SET ${fields.join(', ')} WHERE id = ?`;

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al actualizar carrito:', err);
      return res.status(500).json({ success: false, message: 'Error al actualizar carrito' });
    }

    res.json({ success: true, message: 'Carrito actualizado' });
  });
});
app.put('/redes/:id', (req, res) => {
  const id = req.params.id;
  const { facebook, instagram, correo, twitter, whatsapp } = req.body;
  const query = `
    UPDATE redes_sociales
    SET facebook = ?, instagram = ?, correo = ?, twitter = ?, whatsapp = ?
    WHERE id = ?
  `;
  db.query(query, [facebook, instagram, correo, twitter, whatsapp, id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar redes' });
    res.json({ success: true });
  });
});

app.put('/productos/:id', (req, res) => {
  const { id } = req.params;
  const { category, description, name, price, stock, url } = req.body;

  if (!category || !description || !name || !price || !stock) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const query = `
    UPDATE productos
    SET category = ?, description = ?, name = ?, price = ?, stock = ?, url = ?
    WHERE id = ?
  `;

  db.query(query, [category, description, name, price, stock, url, id], (err, result) => {
    if (err) {
      console.error('❌ Error al actualizar producto:', err);
      return res.status(500).json({ error: 'Error al actualizar producto' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ success: true });
  });
});

// =======================
//    INICIAR SERVIDOR
// =======================
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
