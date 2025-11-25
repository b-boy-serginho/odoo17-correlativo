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
        
        // Asegurar que la información de la compañía esté disponible
        if (this.pos && this.pos.company) {
            result.company = {
                id: this.pos.company.id,
                name: this.pos.company.name,
                phone: this.pos.company.phone,
                email: this.pos.company.email,
                vat: this.pos.company.vat,
                street: this.pos.company.street,
                city: this.pos.company.city,
                country_id: this.pos.company.country_id,
                partner_id: this.pos.company.partner_id,
            };
        }
        
        // Agregar información del cliente (partner_id)
        if (this.partner) {
            result.client = {
                id: this.partner.id,
                name: this.partner.name,
                phone: this.partner.phone,
                email: this.partner.email,
                vat: this.partner.vat,
            };
        }
        
        // Formatear totales con 2 decimales
        if (result.total_with_tax) {
            result.total_with_tax = parseFloat(result.total_with_tax).toFixed(2);
        }
        if (result.total_paid) {
            result.total_paid = parseFloat(result.total_paid).toFixed(2);
        }
        if (result.total) {
            result.total = parseFloat(result.total).toFixed(2);
        }
        
        // Formatear montos de pago con 2 decimales
        if (result.paymentlines) {
            result.paymentlines.forEach(payment => {
                if (payment.amount) {
                    payment.amount = parseFloat(payment.amount).toFixed(2);
                }
            });
        }
        
        console.log('Print - daily_counter:', this.daily_counter);
        console.log('Print - company:', result.company);
        console.log('Print - result completo:', JSON.stringify(result, null, 2));
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