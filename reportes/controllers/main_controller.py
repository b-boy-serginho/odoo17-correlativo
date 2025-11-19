from odoo import http

class ReportesController(http.Controller):
    @http.route('/reportes/hello', auth='public')
    def index(self, **kw):
        return "Hola desde el módulo Reportes"
