-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-07-2025 a las 23:45:19
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `pelktech`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carritos`
--

CREATE TABLE `carritos` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `carritos`
--

INSERT INTO `carritos` (`id`, `email`, `created_at`) VALUES
(1, 'maria@gmail.com', '2025-07-06 01:07:52');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito_items`
--

CREATE TABLE `carrito_items` (
  `id` int(11) NOT NULL,
  `carrito_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` varchar(300) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `url` varchar(300) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price` int(11) NOT NULL,
  `stock` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `lastName` varchar(100) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `timestamp` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`email`, `password`, `name`, `lastName`, `telefono`, `direccion`, `timestamp`) VALUES
('maria@gmail.com', '123456', 'mariam', 'Sanchez', '3054715845', 'cr 26 w mutis ', '2025-07-08 00:12:01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dispositivos`
--

CREATE TABLE `dispositivos` (
  `id` int(11) NOT NULL,
  `cliente_email` varchar(100) DEFAULT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `marca` varchar(100) DEFAULT NULL,
  `modelo` varchar(100) DEFAULT NULL,
  `serie` varchar(100) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `dispositivos`
--

INSERT INTO `dispositivos` (`id`, `cliente_email`, `nombre`, `marca`, `modelo`, `serie`, `observaciones`, `fecha_creacion`) VALUES
(2, 'maria@gmail.com', 'PC', 'NITRO 5S', '16 PULGADAS', '293823', 'RAM MARCA LAS RONDA', '2025-07-09 20:20:39');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleados`
--

CREATE TABLE `empleados` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `rol` varchar(100) NOT NULL,
  `password` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `fecha_vinculacion` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `empleados`
--

INSERT INTO `empleados` (`id`, `email`, `name`, `rol`, `password`, `telefono`, `fecha_vinculacion`) VALUES
(1, 'admin@gmail.com', 'Juan Carlos', 'ADMINISTRADOR', '123456', '222222', NULL),
(2, 'tecnico@gmail.com', 'Jose Angel', 'TECNICO', '123456', '+57 316 0901434', '2025-07-10 03:56:01'),
(3, 'LAURA@GMAIL.COM', 'DANIELA', '', '123456', '1', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_compras`
--

CREATE TABLE `historial_compras` (
  `id` bigint(20) NOT NULL,
  `cliente_email` varchar(100) NOT NULL,
  `total` int(11) NOT NULL,
  `items` text NOT NULL,
  `estado` varchar(50) DEFAULT 'PENDIENTE',
  `encargado` varchar(100) DEFAULT 'SIN ASIGNAR',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `historial_compras`
--

INSERT INTO `historial_compras` (`id`, `cliente_email`, `total`, `items`, `estado`, `encargado`, `created_at`) VALUES
(1752182491882, 'maria@gmail.com', 3500000, '[{\"id\":20,\"carrito_id\":1,\"producto_id\":13,\"name\":\"Monitor Acer Nitro 27” QHD\",\"description\":\"Monitor IPS 2560x1440 con 165Hz y Freesync Premium.\",\"category\":\"Monitores\",\"url\":\"https://www.asus.com/media/odin/websites/MX/News/xm0zlcq9k05pginq/30502.jpg\",\"quantity\":1,\"price\":1580000,\"stock\":10},{\"id\":21,\"carrito_id\":1,\"producto_id\":14,\"name\":\"Webcam Logitech C920 HD Pro\",\"description\":\"Resolución 1080p para videollamadas nítidas.\",\"category\":\"Accesorios\",\"url\":\"https://symcomputadores.com/wp-content/uploads/2024/12/GeForce-RTX%E2%84%A2-3060-VENTUS-2X-12G-OC-1.png\",\"quantity\":1,\"price\":310000,\"stock\":42},{\"id\":22,\"carrito_id\":1,\"producto_id\":15,\"name\":\"Silla Gamer Cougar Armor One\",\"description\":\"Ergonómica con soporte lumbar ajustable.\",\"category\":\"Mobiliario\",\"url\":\"https://www.pcware.com.co/wp-content/uploads/2023/12/4473_001.jpg\",\"quantity\":1,\"price\":1150000,\"stock\":9},{\"id\":23,\"carrito_id\":1,\"producto_id\":16,\"name\":\"Kit Raspberry Pi 4 8GB\",\"description\":\"MiniPC para proyectos con puerto HDMI y Wi-Fi.\",\"category\":\"Computadoras\",\"url\":\"https://lasus.com.co/220171-large_default/disco-duro-interno-wd-purple-2tb.jpg\",\"quantity\":1,\"price\":460000,\"stock\":28}]', 'COMPLETADO', 'SIN ASIGNAR', '2025-07-10 16:21:31'),
(1752183107465, 'maria@gmail.com', 1890000, '[{\"id\":24,\"carrito_id\":1,\"producto_id\":6,\"name\":\"Tarjeta Gráfica NVIDIA RTX 4060\",\"description\":\"GPU con 8GB GDDR6 ideal para gaming y edición.\",\"category\":\"Componentes\",\"url\":\"https://reset.net.co/wp-content/uploads/2024/02/Procesador-AMD-Ryzen-5-5600G-principal.webp\",\"quantity\":1,\"price\":1890000,\"stock\":25}]', 'COMPLETADO', 'SIN ASIGNAR', '2025-07-10 16:31:46'),
(1752183196289, 'maria@gmail.com', 3150000, '[{\"id\":25,\"carrito_id\":1,\"producto_id\":5,\"name\":\"HP Pavilion Desktop\",\"description\":\"PC de escritorio con Ryzen 5, 16GB RAM y SSD 1TB.\",\"category\":\"Computadoras\",\"url\":\"https://cdnx.jumpseller.com/tienda-gamer-medellin/image/47773317/resize/610/610?1713403170\",\"quantity\":1,\"price\":3150000,\"stock\":15}]', 'PENDIENTE PAGO', 'SIN ASIGNAR', '2025-07-10 16:33:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_mantenimiento`
--

CREATE TABLE `historial_mantenimiento` (
  `id` bigint(20) NOT NULL,
  `cliente_email` varchar(100) DEFAULT NULL,
  `dispositivo_id` int(11) DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `diagnostico` text DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `pruebas` text DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `fecha_diagnostico` datetime DEFAULT NULL,
  `fecha_reparacion` datetime DEFAULT NULL,
  `fecha_entrega` datetime DEFAULT NULL,
  `encargado` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `historial_mantenimiento`
--

INSERT INTO `historial_mantenimiento` (`id`, `cliente_email`, `dispositivo_id`, `status`, `tipo`, `descripcion`, `created_at`, `diagnostico`, `precio`, `pruebas`, `observaciones`, `fecha_diagnostico`, `fecha_reparacion`, `fecha_entrega`, `encargado`) VALUES
(1752182282978, 'maria@gmail.com', 2, 'ENTREGADO', 'SOFTWARE', 'No sirve la pantalla\nni idea solo dejo de funcionar', '2025-07-10 16:18:02', 'cambio de pantalla', 1000000.00, 'sitrvio todo bien ', 'se hizo cambio y tyodo ', NULL, NULL, NULL, 'Jose Angel'),
(1752182813499, 'maria@gmail.com', 2, 'ENTREGADO', 'SOFTWARE', 'a\na', '2025-07-10 16:26:53', '1', 1.00, NULL, 'a', NULL, NULL, NULL, 'Jose Angel'),
(1752183415247, 'maria@gmail.com', 2, 'PENDIENTE', 'SOFTWARE', 'a\na', '2025-07-10 16:36:54', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `category` varchar(200) NOT NULL,
  `description` varchar(200) NOT NULL,
  `name` varchar(200) NOT NULL,
  `price` int(12) NOT NULL,
  `stock` int(12) NOT NULL,
  `url` varchar(300) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `category`, `description`, `name`, `price`, `stock`, `url`) VALUES
(2, 'Monitores', 'Monitor gaming IPS FHD 1ms con tasa de refresco de 144Hz.', 'Monitor LG 27” UltraGear', 2450000, 22, 'https://symcomputadores.com/wp-content/uploads/2022/09/5-2.jpg'),
(3, 'Periféricos', 'Teclado retroiluminado con switches Romer-G para gaming.', 'Teclado Mecánico Logitech G413', 320000, 50, 'https://www.janus.com.co/cdn/shop/files/rgb16.jpg?v=1714177300'),
(4, 'Periféricos', 'Mouse ergonómico inalámbrico con múltiples botones personalizables.', 'Mouse Logitech MX Master 3', 410000, 40, 'https://m.media-amazon.com/images/I/61t4B8GodTL.jpg'),
(5, 'Computadoras', 'PC de escritorio con Ryzen 5, 16GB RAM y SSD 1TB.', 'HP Pavilion Desktop', 3150000, 15, 'https://cdnx.jumpseller.com/tienda-gamer-medellin/image/47773317/resize/610/610?1713403170'),
(6, 'Componentes', 'GPU con 8GB GDDR6 ideal para gaming y edición.', 'Tarjeta Gráfica NVIDIA RTX 4060', 1890000, 25, 'https://reset.net.co/wp-content/uploads/2024/02/Procesador-AMD-Ryzen-5-5600G-principal.webp'),
(7, 'Componentes', 'DDR4 3200MHz para rendimiento óptimo en gaming.', 'Memoria RAM Corsair Vengeance 16GB', 350000, 60, 'https://tienvir.co/cdn/shop/files/zahcnma9_b2cf3897-2ab0-4b65-b662-041f3697b674.png?v=1717114868&width=800'),
(8, 'Almacenamiento', 'Disco SSD PCIe Gen 4 NVMe para altas velocidades de lectura.', 'SSD Kingston NV2 1TB', 410000, 70, 'https://symcomputadores.com/wp-content/uploads/2022/09/AMD-RYZEN-7-5700X.png'),
(9, 'Componentes', 'Placa madre microATX para Intel 12va gen con WiFi y Aura Sync.', 'Placa Madre ASUS TUF B660M-PLUS', 690000, 22, 'https://compubit.com.co/wp-content/uploads/2024/08/procesadores-03-1.jpg'),
(10, 'Componentes', 'Chasis con panel frontal en malla y tres ventiladores ARGB.', 'Gabinete Cooler Master MB511 ARGB', 360000, 18, 'https://clonesyperifericos.com/wp-content/uploads/2024/01/Procesador-AMD-Ryzen-5-8600G-5.0-GHz.jpg'),
(11, 'Componentes', 'Fuente certificada 80+ Bronze con ventilador silencioso.', 'Fuente de Poder EVGA 650W 80+ Bronze', 280000, 35, 'https://tienvir.co/cdn/shop/files/cv5zkrmq.png?v=1734473398'),
(12, 'Periféricos', 'Teclado RGB con mouse ergonómico para juegos.', 'Combo Razer Cynosa V2 + DeathAdder', 495000, 26, 'https://www.gamerscolombia.com/img/products/Tarjeta-grfica-NVIDIA-Gigabyte-RTX-4070-WINDFORCE-12GB/17005851491.png'),
(13, 'Monitores', 'Monitor IPS 2560x1440 con 165Hz y Freesync Premium.', 'Monitor Acer Nitro 27” QHD', 1580000, 10, 'https://www.asus.com/media/odin/websites/MX/News/xm0zlcq9k05pginq/30502.jpg'),
(14, 'Accesorios', 'Resolución 1080p para videollamadas nítidas.', 'Webcam Logitech C920 HD Pro', 310000, 42, 'https://symcomputadores.com/wp-content/uploads/2024/12/GeForce-RTX%E2%84%A2-3060-VENTUS-2X-12G-OC-1.png'),
(15, 'Mobiliario', 'Ergonómica con soporte lumbar ajustable.', 'Silla Gamer Cougar Armor One', 1150000, 9, 'https://www.pcware.com.co/wp-content/uploads/2023/12/4473_001.jpg'),
(16, 'Computadoras', 'MiniPC para proyectos con puerto HDMI y Wi-Fi.', 'Kit Raspberry Pi 4 8GB', 460000, 28, 'https://lasus.com.co/220171-large_default/disco-duro-interno-wd-purple-2tb.jpg'),
(17, 'Redes', 'Router Wi-Fi 6 dual band para juegos de baja latencia.', 'Router ASUS RT-AX86U', 890000, 13, 'https://compucentro.co/wp-content/uploads/3-26.jpg'),
(18, 'Componentes', 'Sistema de refrigeración líquida con iluminación ARGB.', 'Enfriamiento Líquido Cooler Master ML240L', 520000, 14, 'https://jyrtechnology.com.co/wp-content/uploads/2023/07/JX123-1.jpg'),
(19, 'Accesorios', 'Micrófono profesional para grabación y streaming.', 'Micrófono Blue Yeti USB', 480000, 21, 'https://jyrtechnology.com.co/wp-content/uploads/2023/06/JX122-1.jpg'),
(20, 'Impresoras', 'Multifuncional compacta con conexión Wi-Fi y escáner.', 'Impresora HP DeskJet 3775', 329000, 16, 'https://www.pcware.com.co/wp-content/uploads/2023/06/Impresora-HP-3775.jpg'),
(21, 'Seguridad', 'Cámara IP rotativa con visión nocturna y control remoto.', 'Cámara de Seguridad TP-Link Tapo C200', 189000, 34, 'https://lasus.com.co/23456-large_default/tp-link-tapo-c200.jpg'),
(22, 'Accesorios', 'Alta velocidad compatible con 8K, ARC, HDR.', 'Cable HDMI 2.1 4K 3m', 39000, 100, 'https://symcomputadores.com/wp-content/uploads/2023/11/cable-hdmi.jpg'),
(23, 'Energía', 'Sistema de respaldo con regulación automática de voltaje.', 'UPS Forza 1200VA', 295000, 19, 'https://compubit.com.co/wp-content/uploads/2024/01/ups-forza.jpg'),
(24, 'Proyección', 'Proyector XGA con 3600 lúmenes ideal para presentaciones.', 'Proyector Epson PowerLite X49', 1890000, 7, 'https://www.pcware.com.co/wp-content/uploads/2023/08/epson-x49.jpg'),
(25, 'Consolas', 'Consola digital de nueva generación con 512GB SSD.', 'Consola Xbox Series S', 1450000, 12, 'https://www.gamerscolombia.com/img/products/Xbox-Series-S.jpg'),
(26, 'Tablets', 'Pantalla de 10.5”, 4GB RAM, 64GB almacenamiento.', 'Tablet Samsung Galaxy Tab A8', 899000, 22, 'https://lasus.com.co/22145-large_default/tablet-samsung-galaxy-tab-a8.jpg'),
(27, 'Periféricos', 'Trackpad multitáctil recargable con Bluetooth.', 'Apple Magic Trackpad', 635000, 11, 'https://m.media-amazon.com/images/I/71lFkGdIhnL.jpg'),
(28, 'Ofimática', 'Portátil empresarial con Intel i5 y pantalla FHD antirreflejo.', 'Laptop Lenovo ThinkBook 14', 2290000, 17, 'https://tecnoplaza.com.co/cdn/shop/files/memoria-ram-adata-b5f6c258-877e-46dd-9098-593a49196806.jpg?v=1743709527&width=1445'),
(29, 'Pantallas', 'Monitor curvo para trabajo y entretenimiento con Eye Saver Mode.', 'Pantalla Samsung LED 24” Curva', 799000, 20, 'https://symcomputadores.com/wp-content/uploads/2022/09/5-2.jpg'),
(30, 'Gaming', 'Mecánico RGB con switches Outemu Blue.', 'Teclado Redragon Kumara K552', 230000, 40, 'https://www.janus.com.co/cdn/shop/files/rgb16.jpg?v=1714177300'),
(31, 'Ergonomía', 'Diseño vertical que previene lesiones por esfuerzo repetitivo.', 'Mouse Vertical Ergonómico Delux', 120000, 60, 'https://m.media-amazon.com/images/I/61t4B8GodTL.jpg'),
(32, 'Ofimática', 'Compacto con Intel Core i3, SSD 256GB y 8GB RAM.', 'MiniPC HP ProDesk 400 G6', 1990000, 13, 'https://cdnx.jumpseller.com/tienda-gamer-medellin/image/47773317/resize/610/610?1713403170'),
(33, 'Diseño Gráfico', 'Ideal para estaciones de trabajo en CAD y multimedia.', 'Aceleradora de Video NVIDIA T400', 1490000, 8, 'https://reset.net.co/wp-content/uploads/2024/02/Procesador-AMD-Ryzen-5-5600G-principal.webp'),
(34, 'Actualización', 'Ideal para mejorar rendimiento de laptops modernas.', 'Memoria RAM ADATA 8GB 3200MHz', 180000, 48, 'https://tienvir.co/cdn/shop/files/zahcnma9_b2cf3897-2ab0-4b65-b662-041f3697b674.png?v=1717114868&width=800'),
(35, 'Almacenamiento Rápido', 'NVMe PCIe 4.0 para sistemas gaming exigentes.', 'Disco Duro NVMe WD Black 500GB', 380000, 33, 'https://symcomputadores.com/wp-content/uploads/2022/09/AMD-RYZEN-7-5700X.png'),
(36, 'Hardware', 'Compatibilidad Ryzen y componentes de alto rendimiento.', 'Placa Base ASRock B550M Steel Legend', 610000, 19, 'https://compubit.com.co/wp-content/uploads/2024/08/procesadores-03-1.jpg'),
(37, 'Gabinetes', 'Ideal para PCs compactas con ventilación mejorada.', 'Caja ATX Thermaltake Versa H18', 240000, 29, 'https://clonesyperifericos.com/wp-content/uploads/2024/01/Procesador-AMD-Ryzen-5-8600G-5.0-GHz.jpg'),
(38, 'Energía', 'Certificación 80+ Bronze, ideal para equipos de entrada.', 'Fuente de Poder Corsair CV550', 260000, 42, 'https://tienvir.co/cdn/shop/files/cv5zkrmq.png?v=1734473398'),
(39, 'Gaming', 'Incluye teclado, mouse, alfombrilla y auriculares.', 'Kit Combo Gamer Trust GXT 838', 360000, 31, 'https://www.gamerscolombia.com/img/products/Tarjeta-grfica-NVIDIA-Gigabyte-RTX-4070-WINDFORCE-12GB/17005851491.png'),
(40, 'Escritorio', 'Monitor LED 144Hz con tecnología Anti-Flicker.', 'Monitor MSI Optix G24', 1280000, 15, 'https://www.asus.com/media/odin/websites/MX/News/xm0zlcq9k05pginq/30502.jpg'),
(41, 'Teletrabajo', 'Micrófono estéreo integrado y enfoque automático.', 'Cámara Web Aukey Full HD 1080p', 250000, 55, 'https://symcomputadores.com/wp-content/uploads/2024/12/GeForce-RTX%E2%84%A2-3060-VENTUS-2X-12G-OC-1.png'),
(42, 'Oficina', 'Espaldar reclinable, soporte lumbar y reposabrazos.', 'Silla Ejecutiva Ergonómica', 990000, 6, 'https://www.pcware.com.co/wp-content/uploads/2023/12/4473_001.jpg'),
(43, 'Educación', 'Incluye sensores, cables y placa Arduino oficial.', 'Mini Kit Arduino UNO R3', 145000, 45, 'https://lasus.com.co/220171-large_default/disco-duro-interno-wd-purple-2tb.jpg'),
(44, 'Redes Empresariales', 'Wi-Fi AC1200 para cobertura en oficinas.', 'Access Point TP-Link EAP225', 369000, 23, 'https://compucentro.co/wp-content/uploads/3-26.jpg'),
(45, 'Modding', 'Compacto y con iluminación RGB para builds llamativas.', 'Refrigeración Líquida Thermaltake TH120', 395000, 17, 'https://jyrtechnology.com.co/wp-content/uploads/2023/07/JX123-1.jpg'),
(46, 'Grabación', 'Ideal para entrevistas y videoblogs con conector 3.5mm.', 'Micrófono Lavalier Boya BY-M1', 99000, 78, 'https://jyrtechnology.com.co/wp-content/uploads/2023/06/JX122-1.jpg'),
(47, 'Educación', 'Portátil ligera con ChromeOS, ideal para estudiantes.', 'Laptop Acer Chromebook 311', 780000, 32, 'https://tecnoplaza.com.co/cdn/shop/files/memoria-ram-adata-b5f6c258-877e-46dd-9098-593a49196806.jpg?v=1743709527&width=1445'),
(48, 'Educación', 'Incluye sensores, cables y placa Arduino oficial.', 'Mini Kit Arduino UNO R3', 145000, 45, 'https://lasus.com.co/220171-large_default/disco-duro-interno-wd-purple-2tb.jpg'),
(49, 'Redes Empresariales', 'Wi-Fi AC1200 para cobertura en oficinas.', 'Access Point TP-Link EAP225', 369000, 23, 'https://compucentro.co/wp-content/uploads/3-26.jpg'),
(50, 'Modding', 'Compacto y con iluminación RGB para builds llamativas.', 'Refrigeración Líquida Thermaltake TH120', 395000, 17, 'https://jyrtechnology.com.co/wp-content/uploads/2023/07/JX123-1.jpg'),
(51, 'Grabación', 'Ideal para entrevistas y videoblogs con conector 3.5mm.', 'Micrófono Lavalier Boya BY-M1', 99000, 78, 'https://jyrtechnology.com.co/wp-content/uploads/2023/06/JX122-1.jpg'),
(52, 'Educación', 'Portátil ligera con ChromeOS, ideal para estudiantes.', 'Laptop Acer Chromebook 311', 780000, 32, 'https://tecnoplaza.com.co/cdn/shop/files/memoria-ram-adata-b5f6c258-877e-46dd-9098-593a49196806.jpg?v=1743709527&width=1445');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `redes`
--

CREATE TABLE `redes` (
  `id` int(11) NOT NULL,
  `facebook` varchar(200) NOT NULL,
  `instagram` varchar(200) NOT NULL,
  `correo` varchar(200) NOT NULL,
  `twitter` varchar(200) NOT NULL,
  `whatsapp` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `redes`
--

INSERT INTO `redes` (`id`, `facebook`, `instagram`, `correo`, `twitter`, `whatsapp`) VALUES
(1, 'https://www.facebook.com/Cristiano/?locale=es_LA', 'https://www.instagram.com/cristiano/', 'sssssss@sasas.coms', 'https://x.com/Cristiano?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor', '+573004380009');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carritos`
--
ALTER TABLE `carritos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `carrito_items`
--
ALTER TABLE `carrito_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `carrito_id` (`carrito_id`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`email`);

--
-- Indices de la tabla `dispositivos`
--
ALTER TABLE `dispositivos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `empleados`
--
ALTER TABLE `empleados`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `historial_compras`
--
ALTER TABLE `historial_compras`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `historial_mantenimiento`
--
ALTER TABLE `historial_mantenimiento`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `redes`
--
ALTER TABLE `redes`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `carritos`
--
ALTER TABLE `carritos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `carrito_items`
--
ALTER TABLE `carrito_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `dispositivos`
--
ALTER TABLE `dispositivos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `empleados`
--
ALTER TABLE `empleados`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT de la tabla `redes`
--
ALTER TABLE `redes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `carrito_items`
--
ALTER TABLE `carrito_items`
  ADD CONSTRAINT `carrito_items_ibfk_1` FOREIGN KEY (`carrito_id`) REFERENCES `carritos` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
