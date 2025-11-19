{
    'name': 'Reportes-Apex',
    'version': '1.0',
    'summary': 'Módulo para la gestión y visualización de reportes personalizados.',
    'description': """
        Este módulo permite crear, gestionar y visualizar reportes personalizados.
        Incluye vistas, controladores y modelos base.
    """,
    'author': 'Apex',
    'website': 'https://apex-report.com',
    'category': 'Tools',
    'depends': ['base', 'stock'],  # Agregar 'stock' aquí
    'data': [
        'security/ir.model.access.csv',
        'reports/boton.xml',
        'reports/formato_papel.xml',
        'reports/reporte.xml',
        'views/reporte_views.xml',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
}
