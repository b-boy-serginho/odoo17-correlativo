# custom_pos_receipt_sequence/models/pos_daily_sequence.py
from odoo import models, fields, api

class PosDailyReceiptSequence(models.Model):
    _name = 'pos.daily.receipt.sequence'
    _description = 'POS Daily Receipt Sequence'
    _order = 'date desc'
    _sql_constraints = [
        ('date_company_unique', 'unique(date, company_id)', 'Ya existe una secuencia para esta fecha y compañía')
    ]

    date = fields.Date(required=True)
    company_id = fields.Many2one('res.company', default=lambda self: self.env.company, required=True)
    last_number = fields.Integer(default=0)
