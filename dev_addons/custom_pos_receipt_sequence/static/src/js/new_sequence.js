/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { Order } from "@point_of_sale/app/store/models";

let dailyCounterSession = 0;

/**
 * Parche para Order (POS 17, OWL 2)
 *
 * - Mantiene daily_counter en memoria local
 * - Lo envía al servidor al exportar
 * - Lo imprime en el recibo
 * - NO toca setup() ni PosStore (prohibido por Owl)
 */

patch(Order.prototype, {
    
    init_from_JSON(json) {
        super.init_from_JSON(...arguments);

        // Si viene del servidor → usarlo
        if ("daily_counter" in json) {
            this.daily_counter = json.daily_counter || null;
        } 
        // Si viene en server_data
        else if (json.server_data && json.server_data.daily_counter) {
            this.daily_counter = json.server_data.daily_counter || null;
        } 
        else {
            this.daily_counter = null;
        }
    },

    export_as_JSON() {
        const json = super.export_as_JSON(...arguments);
        json.daily_counter = this.daily_counter;
        return json;
    },

    export_for_printing() {
        const data = super.export_for_printing(...arguments);

        // Si aún no tiene contador → asignar localmente
        if (!this.daily_counter) {
            dailyCounterSession++;
            this.daily_counter = dailyCounterSession;
        }

        // Enviar al XML
        data.daily_counter = this.daily_counter;
        data.name = String(this.daily_counter);
        return data;
    },
});

// Reiniciar contador al abrir sesión POS
import { PosStore } from "@point_of_sale/app/store/pos_store";

patch(PosStore.prototype, {
    async _load_pos_data() {
        const res = await super._load_pos_data(...arguments);
        dailyCounterSession = 0; // reset por sesión
        return res;
    },
});
