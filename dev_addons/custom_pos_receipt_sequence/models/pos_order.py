# custom_pos_receipt_sequence/models/pos_order.py
from odoo import models, fields, api
import logging

_logger = logging.getLogger(__name__)

class PosOrder(models.Model):
    _inherit = 'pos.order'

    daily_counter = fields.Integer("Contador Diario", store=True, readonly=False)
    
    @api.depends('daily_counter')
    def _compute_tracking_number(self):
        """Sobrescribir tracking_number con daily_counter"""
        for record in self:
            if record.daily_counter:
                record.tracking_number = str(record.daily_counter)
            else:
                record.tracking_number = ''

    @api.model_create_multi
    def create(self, vals_list):
        """Override create para asignar daily_counter al momento de crear"""
        today = fields.Date.today()
        company_id = self.env.company.id
        
        # Asignar daily_counter a cada orden antes de crearla
        for vals in vals_list:
            # Solo asignar si no viene ya con un daily_counter
            if 'daily_counter' not in vals or not vals.get('daily_counter'):
                # Buscar o crear el registro de secuencia para hoy
                sequence_record = self.env['pos.daily.receipt.sequence'].search([
                    ('date', '=', today),
                    ('company_id', '=', company_id)
                ], limit=1)
                
                if sequence_record:
                    next_number = sequence_record.last_number + 1
                    sequence_record.last_number = next_number
                else:
                    next_number = 1
                    self.env['pos.daily.receipt.sequence'].create({
                        'date': today,
                        'company_id': company_id,
                        'last_number': next_number
                    })
                
                vals['daily_counter'] = next_number
                vals['tracking_number'] = str(next_number)
                _logger.info("Asignado daily_counter %s y tracking_number en create", next_number)
        
        return super(PosOrder, self).create(vals_list)

    @api.model
    def create_from_ui(self, orders, draft=False):
        """Override para devolver el daily_counter en la respuesta"""
        # Llamar al método padre (que a su vez llamará a create())
        result = super(PosOrder, self).create_from_ui(orders, draft=draft)
        
        # Agregar daily_counter a la respuesta
        try:
            if isinstance(result, list):
                for order_result in result:
                    if isinstance(order_result, dict) and order_result.get('id'):
                        order_record = self.browse(order_result['id'])
                        if order_record and order_record.daily_counter:
                            order_result['daily_counter'] = order_record.daily_counter
                            _logger.info("Enviando daily_counter %s al frontend", order_record.daily_counter)
        except Exception as e:
            _logger.error("Error agregando daily_counter a respuesta: %s", str(e))
        
        return result
