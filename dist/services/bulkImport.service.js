"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTemplateBuffer = generateTemplateBuffer;
exports.bulkImportProducts = bulkImportProducts;
const XLSX = __importStar(require("xlsx"));
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const constants_1 = require("../config/constants");
const categoryService = __importStar(require("./category.service"));
/** Internal field keys we support when mapping Excel columns */
const FIELD_KEYS = [
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
/** Synonyms: normalized header → internal field key. First match wins. */
const HEADER_SYNONYMS = {
    nombre: 'Nombre',
    product: 'Nombre',
    producto: 'Nombre',
    articulo: 'Nombre',
    item: 'Nombre',
    name: 'Nombre',
    marca: 'Marca',
    model: 'Modelo',
    modelo: 'Modelo',
    precio: 'Precio',
    price: 'Precio',
    contado: 'Precio',
    'precio de lista': 'Precio',
    'precio contado': 'Precio',
    pvp: 'Precio',
    descripcion: 'Descripción',
    description: 'Descripción',
    stock: 'Stock',
    cantidad: 'Stock',
    qty: 'Stock',
    existencia: 'Stock',
    inventory: 'Stock',
    categoria: 'Categoría',
    category: 'Categoría',
    'url imagen': 'URL imagen',
    imagen: 'URL imagen',
    image: 'URL imagen',
    activo: 'Activo',
    active: 'Activo'
};
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
function normalizeHeader(s) {
    return String(s ?? '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ');
}
function getColumnIndexMap(headers) {
    const map = {};
    headers.forEach((h, i) => {
        const n = normalizeHeader(h);
        const field = HEADER_SYNONYMS[n];
        if (field !== undefined && map[field] === undefined) {
            map[field] = i;
        }
    });
    return map;
}
function getCell(row, index) {
    if (index === undefined || index < 0)
        return '';
    const v = row[index];
    if (v == null)
        return '';
    return String(v).trim();
}
/** Argentine/US format: $ 641.250,00 or 199.99 */
function parsePrice(s) {
    let s2 = String(s ?? '').replace(/\$/g, '').replace(/\s/g, '').trim();
    if (!s2)
        return null;
    const hasComma = /,/.test(s2);
    const hasDot = /\./.test(s2);
    if (hasComma && (!hasDot || s2.lastIndexOf(',') > s2.lastIndexOf('.'))) {
        s2 = s2.replace(/\./g, '').replace(',', '.');
    }
    else {
        s2 = s2.replace(/,/g, '');
    }
    const n = parseFloat(s2);
    return Number.isFinite(n) ? n : null;
}
function parseActive(s) {
    const v = s.toLowerCase();
    if (v === 'sí' || v === 'si' || v === 'yes' || v === '1' || v === 'true')
        return true;
    if (v === 'no' || v === '0' || v === 'false')
        return false;
    return true;
}
/** BAJO→1, MEDIO→5, ALTO→10, CONSULTAR→null; numeric string as number */
function parseStock(stockStr) {
    const v = stockStr.trim().toUpperCase();
    if (!v)
        return null;
    if (v === 'BAJO')
        return 1;
    if (v === 'MEDIO')
        return 5;
    if (v === 'ALTO')
        return 10;
    if (v === 'CONSULTAR')
        return null;
    const n = parsePrice(stockStr);
    if (n !== null && n >= 0)
        return Math.floor(n);
    return null;
}
function isValidUrl(s) {
    if (!s)
        return false;
    try {
        const u = new URL(s);
        return u.protocol === 'http:' || u.protocol === 'https:';
    }
    catch {
        return false;
    }
}
/** Skip row if it looks like a repeated header (MARCA, MODELO, etc.) */
function isHeaderRow(row, col, firstDataColIndex) {
    const first = getCell(row, firstDataColIndex);
    const n = normalizeHeader(first);
    if (n === 'marca' || n === 'modelo' || n === 'nombre')
        return true;
    if (col['Marca'] !== undefined && col['Modelo'] !== undefined) {
        const marca = getCell(row, col['Marca']);
        const modelo = getCell(row, col['Modelo']);
        if (normalizeHeader(marca) === 'marca' && normalizeHeader(modelo) === 'modelo')
            return true;
    }
    return false;
}
function generateTemplateBuffer() {
    const ws = XLSX.utils.aoa_to_sheet([
        [...TEMPLATE_HEADERS],
        ['Monitor 24"', 'Varios', '24"', 199.99, 'LED, HDMI', 5, 'Monitores', '', 'Sí'],
        ['Teclado USB', 'Genérico', 'USB', 29.5, 'Español, QWERTY', 20, 'Periféricos', '', 'Sí']
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return Buffer.from(buf);
}
async function bulkImportProducts(userId, input) {
    const { fileBuffer, fileName, fileSize, storeFile = true } = input;
    const profile = await database_1.prisma.merchantProfile.findUnique({
        where: { userId }
    });
    if (!profile)
        throw errors_1.AppError.notFound('Perfil de comercio no encontrado');
    const genericImage = profile.bannerUrl && isValidUrl(profile.bannerUrl)
        ? profile.bannerUrl
        : profile.logoUrl && isValidUrl(profile.logoUrl)
            ? profile.logoUrl
            : constants_1.DEFAULT_NO_IMAGE_URL;
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!firstSheet)
        throw errors_1.AppError.validation('El archivo no contiene hojas');
    const data = XLSX.utils.sheet_to_json(firstSheet, {
        header: 1,
        defval: ''
    });
    if (data.length < 2) {
        throw errors_1.AppError.validation('El archivo debe tener al menos la fila de encabezados y una fila de datos');
    }
    const headerRow = data[0];
    const col = getColumnIndexMap(headerRow);
    const hasNombre = col['Nombre'] !== undefined;
    const hasMarca = col['Marca'] !== undefined;
    const hasModelo = col['Modelo'] !== undefined;
    const hasPrecio = col['Precio'] !== undefined;
    if (!hasPrecio) {
        throw errors_1.AppError.validation('El archivo debe tener una columna de precio (Precio, CONTADO, PRECIO DE LISTA, etc.). Descargue la plantilla de ejemplo.');
    }
    if (!hasNombre && !(hasMarca && hasModelo)) {
        throw errors_1.AppError.validation('El archivo debe tener columnas "Nombre" o bien "Marca" y "Modelo". Descargue la plantilla de ejemplo.');
    }
    const firstDataCol = col['Nombre'] ?? col['Marca'] ?? 0;
    const categoryCache = new Map();
    let currentSectionCategory = '';
    const result = { created: 0, errors: [] };
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const nombre = getCell(row, col['Nombre']);
        const marca = getCell(row, col['Marca']);
        const modelo = getCell(row, col['Modelo']);
        const precioStr = getCell(row, col['Precio']);
        const descripcion = getCell(row, col['Descripción']);
        const stockStr = getCell(row, col['Stock']);
        const categoriaNombre = getCell(row, col['Categoría']);
        const urlImagen = getCell(row, col['URL imagen']);
        const activoStr = getCell(row, col['Activo']);
        if (isHeaderRow(row, col, firstDataCol)) {
            continue;
        }
        const price = parsePrice(precioStr);
        if (price === null || price <= 0) {
            const possibleSection = (nombre || marca || modelo || getCell(row, 0)).trim();
            if (possibleSection.length >= 2 && possibleSection.length <= 120) {
                currentSectionCategory = possibleSection;
            }
            continue;
        }
        let name = nombre;
        if (!name && marca && modelo) {
            name = `${marca} ${modelo}`.trim();
        }
        if (!name) {
            name = (marca || modelo || '').trim();
        }
        if (!name || name.length < 2) {
            result.errors.push({ row: i + 1, message: 'Falta nombre del producto (Nombre o Marca+Modelo)' });
            continue;
        }
        if (name.length > 200) {
            name = name.slice(0, 200);
        }
        const marcaVal = marca && marca.length <= 100 ? marca : null;
        const modeloVal = modelo && modelo.length <= 100 ? modelo : null;
        let categoryId = null;
        const catName = (categoriaNombre || currentSectionCategory).trim();
        if (catName.length >= 2) {
            const cached = categoryCache.get(catName);
            if (cached) {
                categoryId = cached;
            }
            else {
                const existing = await database_1.prisma.category.findFirst({
                    where: { merchantProfileId: profile.id, name: catName }
                });
                if (existing) {
                    categoryCache.set(catName, existing.id);
                    categoryId = existing.id;
                }
                else {
                    const created = await categoryService.createCategoryForMerchant(userId, {
                        name: catName
                    });
                    categoryCache.set(catName, created.id);
                    categoryId = created.id;
                }
            }
        }
        const stockInt = parseStock(stockStr);
        if (stockStr !== '' && stockInt === null && parsePrice(stockStr) === null) {
            result.errors.push({ row: i + 1, message: 'Stock inválido' });
            continue;
        }
        const imageCoverUrl = isValidUrl(urlImagen) ? urlImagen : genericImage;
        const active = parseActive(activoStr);
        const description = descripcion.length > 2000 ? descripcion.slice(0, 2000) : (descripcion || null);
        try {
            await database_1.prisma.product.create({
                data: {
                    merchantProfileId: profile.id,
                    name,
                    marca: marcaVal,
                    modelo: modeloVal,
                    description: description || null,
                    price,
                    categoryId,
                    imageCoverUrl,
                    stock: stockInt,
                    active
                }
            });
            result.created++;
        }
        catch (err) {
            result.errors.push({
                row: i + 1,
                message: err instanceof Error ? err.message : 'Error al crear producto'
            });
        }
    }
    const rowsTotal = Math.max(0, data.length - 1);
    await database_1.prisma.bulkImport.create({
        data: {
            merchantProfileId: profile.id,
            fileName: fileName || 'import.xlsx',
            fileSize: fileSize ?? fileBuffer.length,
            fileContent: storeFile ? Buffer.from(fileBuffer) : undefined,
            rowsTotal,
            rowsCreated: result.created,
            errorsJson: result.errors.length > 0 ? result.errors : undefined
        }
    });
    return result;
}
