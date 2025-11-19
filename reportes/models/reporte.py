from odoo import models, fields

class Reporte(models.Model):
    _name = 'reportes.reporte'
    _description = 'Reporte Personalizado'

    name = fields.Char(string='Nombre del Reporte', required=True)
    fecha = fields.Date(string='Fecha')
    descripcion = fields.Text(string='Descripción')
