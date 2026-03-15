/**
 * Genera un Excel de ejemplo con indumentaria y URLs de imágenes.
 * Ejecutar desde la raíz del proyecto: node backend/scripts/generate-indumentaria.js
 * El archivo se guarda en: docs/indumentaria-ejemplo.xlsx
 */

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const TEMPLATE_HEADERS = [
  'Nombre',
  'Marca',
  'Modelo',
  'Precio',
  'Descripción',
  'Stock',
  'Categoría',
  'URL imagen',
  'Activo'
];

// Productos de indumentaria con URLs de imágenes (Unsplash, libre uso)
const PRODUCTOS = [
  [
    'Remera básica algodón',
    'Básico',
    'Unisex',
    2499.99,
    'Remera de algodón peinado, cuello redondo. Colores: negro, blanco, gris.',
    50,
    'Remeras',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    'Sí'
  ],
  [
    'Buzo con capucha',
    'Urban',
    'Hoodie',
    5999.99,
    'Buzo de algodón frisado con capucha y bolsillo canguro.',
    30,
    'Buzos',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
    'Sí'
  ],
  [
    'Pantalón jogger',
    'Sport',
    'Jogger',
    4499.99,
    'Pantalón jogger de gabardina, cintura elástica y puños.',
    25,
    'Pantalones',
    'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800',
    'Sí'
  ],
  [
    'Campera liviana',
    'Outdoor',
    'Windbreaker',
    8999.99,
    'Campera impermeable y liviana, ideal para entretiempo.',
    15,
    'Camperas',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
    'Sí'
  ],
  [
    'Short deportivo',
    'Run',
    'Short',
    1999.99,
    'Short de running con interior slip, tela secado rápido.',
    40,
    'Shorts',
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800',
    'Sí'
  ],
  [
    'Camisa lino',
    'Clásico',
    'Lino',
    5499.99,
    'Camisa de lino manga larga, corte regular. Ideal verano.',
    20,
    'Camisas',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
    'Sí'
  ],
  [
    'Vestido midi',
    'Femenino',
    'Midi',
    6799.99,
    'Vestido midi de jersey, escote en V. Varios colores.',
    12,
    'Vestidos',
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
    'Sí'
  ],
  [
    'Sweater de lana',
    'Invierno',
    'Lana',
    7299.99,
    'Sweater de lana merino, cuello alto. Abrigado y suave.',
    18,
    'Sweaters',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800',
    'Sí'
  ],
  [
    'Jean slim fit',
    'Denim',
    'Slim',
    4999.99,
    'Jean slim fit, talle regular. Azul oscuro y negro.',
    35,
    'Pantalones',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800',
    'Sí'
  ],
  [
    'Zapatillas urbanas',
    'Street',
    'Sneaker',
    12999.99,
    'Zapatillas urbanas, suela de goma. Cómodas para el día a día.',
    22,
    'Calzado',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    'Sí'
  ]
];

const rows = [TEMPLATE_HEADERS, ...PRODUCTOS];
const ws = XLSX.utils.aoa_to_sheet(rows);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Productos');

// Ruta docs del proyecto (desde backend/scripts -> subir a raíz -> docs)
const docsDir = path.resolve(__dirname, '..', '..', 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}
const outPath = path.join(docsDir, 'indumentaria-ejemplo.xlsx');
XLSX.writeFile(wb, outPath);

console.log('Excel generado:', outPath);
