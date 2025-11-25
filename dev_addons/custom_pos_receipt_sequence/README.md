# POS Custom Receipt Sequence - Contador Diario

## Descripción
Módulo para mostrar un contador diario incremental (1, 2, 3...) en los recibos del POS que se reinicia cada día.

## Funcionalidades implementadas

### Backend (Python)
- **Modelo nuevo**: `pos.daily.receipt.sequence`
  - Almacena el contador por fecha y compañía
  - Método `get_next(date)` usa UPSERT atómico para incrementar sin race conditions
  
- **Extensión de `pos.order`**:
  - Campo `daily_counter` (Integer, readonly, store)
  - Override de `create()`: asigna `daily_counter` antes de crear la orden
  - Override de `create_from_ui()`: incluye `daily_counter` en la respuesta al POS

### Frontend (JavaScript)
- **Extensión de `Order`** (`static/src/js/new_sequence.js`):
  - Campo `daily_counter` en la orden del cliente
  - `init_from_JSON`: carga `daily_counter` desde JSON
  - `export_as_JSON`: incluye `daily_counter` al guardar
  - `export_for_printing`: sobrescribe `trackingNumber` con `daily_counter` para impresión
  - `getOrderData`: incluye `daily_counter` en datos generales

- **Extensión de `PosStore`**:
  - `_save_to_server`: captura respuesta y actualiza `order.daily_counter` localmente

### Frontend (XML)
- **Template** (`static/src/xml/new_sequence.xml`):
  - Hereda `point_of_sale.ReceiptHeader`
  - Muestra `trackingNumber` (que el JS sobrescribe con `daily_counter`)

## Requisitos del usuario
- ✅ Contador por día
- ✅ Si se sale del POS sin cerrar sesión → contador NO se reinicia (es por fecha, no por sesión)
- ✅ Si es otro día → contador se reinicia
- ✅ Si se suspende la sesión el mismo día → contador se mantiene
- ✅ Contador empieza desde 1

## Instalación

1. Clonar el repositorio o copiar el módulo a `addons/`
2. Actualizar lista de aplicaciones
3. Instalar "POS Custom Receipt Sequence"

## Actualización en Odoo.sh

```bash
# Desde la shell de Odoo.sh
odoo-update custom_pos_receipt_sequence
exit

# Los servicios se reinician automáticamente
```

## Verificación

### Base de datos
```sql
-- Ver contador actual para hoy
SELECT id, date, company_id, last_number 
FROM pos_daily_receipt_sequence 
WHERE date = current_date;

-- Ver órdenes con contador
SELECT id, name, daily_counter, create_date 
FROM pos_order 
WHERE create_date::date = current_date 
ORDER BY id DESC;
```

### Navegador
1. Abrir POS en ventana incógnita (Ctrl+Shift+N)
2. Abrir DevTools (F12) → Console
3. Hacer una venta
4. Buscar logs:
   - `🖨️ export_for_printing - usando daily_counter: X`
   - `✅ Updated order ... daily_counter to X`

## Troubleshooting

### El recibo muestra 101 en lugar de 1
**Causa**: `daily_counter` no está llegando al cliente o no se actualiza tras crear la orden.

**Solución**:
1. Verificar en consola del navegador si aparece log de `daily_counter`
2. Verificar en DB que la orden tiene `daily_counter` poblado
3. Limpiar caché del navegador (Ctrl+Shift+R)
4. Regenerar assets en Odoo.sh

### Assets no se actualizan
**Solución**:
```bash
# En Odoo.sh shell
odoo-update custom_pos_receipt_sequence
odoosh-restart http
exit
```

Luego abrir POS en ventana incógnita.

## Estructura de archivos

```
custom_pos_receipt_sequence/
├── __init__.py
├── __manifest__.py
├── README.md
├── models/
│   ├── __init__.py
│   ├── pos_order.py           # Extensión de pos.order
│   └── pos_daily_sequence.py  # Modelo contador diario
├── controllers/
│   ├── __init__.py
│   └── sequence_order_controller.py  # Endpoint /get_full_data_order
└── static/src/
    ├── js/
    │   └── new_sequence.js    # Lógica cliente POS
    └── xml/
        └── new_sequence.xml   # Template recibo
```

## Notas técnicas

- El contador usa UPSERT de PostgreSQL para evitar race conditions
- La tabla `pos_daily_receipt_sequence` tiene constraint único en `(date, company_id)`
- El campo `daily_counter` se asigna en `create()` antes de llamar a `super()`
- La respuesta de `create_from_ui()` incluye `daily_counter` para que el cliente lo reciba
- El JS sobrescribe `trackingNumber` con `daily_counter` en `export_for_printing()`

## Advertencias conocidas

```
WARNING: The models ['pos.daily.receipt.sequence'] have no access rules
```

Esto es opcional. El modelo funciona sin reglas de acceso. Para agregarlo, crear:
`security/ir.model.access.csv`

## Autor
APPEX BOLIVIA SRL
https://www.appexbo.com/
