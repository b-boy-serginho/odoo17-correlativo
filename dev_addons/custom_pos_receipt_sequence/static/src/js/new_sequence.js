/** @odoo-module */
import { patch } from "@web/core/utils/patch";
import { Order } from "@point_of_sale/app/store/models";
import { PosStore } from "@point_of_sale/app/store/pos_store";

let dailyCounterSession = 0;

patch(Order.prototype, {
    setup(_defaultObj, options) {
        super.setup(...arguments);
        this.daily_counter = null;
    },

    init_from_JSON(json) {
        super.init_from_JSON(...arguments);
        if ('daily_counter' in json) {
            this.daily_counter = json.daily_counter ? json.daily_counter - 1 : null;
        } else if (json.server_data && json.server_data.daily_counter) {
            this.daily_counter = json.server_data.daily_counter ? json.server_data.daily_counter - 1 : null;
        } else {
            this.daily_counter = null;
        }
    },

    export_as_JSON() {
        const json = super.export_as_JSON(...arguments);
        json.daily_counter = this.daily_counter;
        return json;
    },

    export_for_printing() {
        const result = super.export_for_printing(...arguments);
        
        // Si no tiene daily_counter, asignarlo localmente AHORA
        if (!this.daily_counter || this.daily_counter === 0) {
            dailyCounterSession++;
            this.daily_counter = dailyCounterSession;
            console.log('Asignado daily_counter local al recibo:', this.daily_counter);
        }
        
        result.daily_counter = this.daily_counter;
        console.log('Print - daily_counter:', this.daily_counter);
        return result;
    }
});

patch(PosStore.prototype, {
    async setup() {
        await super.setup(...arguments);
        dailyCounterSession = 0;
    },

    async _save_to_server(orders, options) {
        const result = await super._save_to_server(...arguments);
        
        // Actualizar con los valores del servidor si vienen
        if (result && Array.isArray(result)) {
            for (let i = 0; i < result.length; i++) {
                const serverOrderData = result[i];
                const order = orders[i];
                
                if (serverOrderData && order && serverOrderData.daily_counter) {
                    order.daily_counter = serverOrderData.daily_counter - 1;
                    if (serverOrderData.daily_counter > dailyCounterSession) {
                        dailyCounterSession = serverOrderData.daily_counter - 1;
                    }
                    console.log('Daily counter actualizado del servidor:', serverOrderData.daily_counter - 1);
                }
            }
        }
        
        return result;
    }
});