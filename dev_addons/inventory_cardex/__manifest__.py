{
    'name': 'Inventory Cardex',
    'version': '1.0',
    'category': 'Inventory',
    'summary': 'Custom Inventory Module',
    'description': """
        This module adds a Hello World message to the Inventory Picking form.
    """,
    'depends': ['stock'],
    'data': [
        'views/stock_picking_views.xml',
        'views/stock_move_views.xml',
        'views/assets.xml',
    ],
    'demo': [
        'data/demo_data.xml',
    ],
    'installable': True,
    'application': False,
}
