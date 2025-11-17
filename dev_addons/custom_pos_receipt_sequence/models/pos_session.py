# custom_pos_receipt_sequence/models/pos_session.py
from odoo import models

class PosSession(models.Model):
    _inherit = 'pos.session'

    def _loader_params_pos_order(self):
        params = super()._loader_params_pos_order()
        params['search_params']['fields'].append('daily_counter')
        return params

