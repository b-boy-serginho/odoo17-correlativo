# custom_pos_receipt_sequence/__manifest__.py

{
    'name': 'POS Custom Receipt SEQUENCE',
    'version': '17.0.1.0',
    "license": "LGPL-3",
    'category': 'Sales/Point of Sale',
    'author': 'APPEX BOLIVIA SRL.',
    'website': 'https://www.appexbo.com/',
    'summary': 'Este modulo es para que la secuencia de las impresiones (Numero de orden) sea otro sea ahora el de Ref. de la orden',
    'description': "Customized our point of sale receipt.",
    'depends': [
        'base', 
        'point_of_sale'
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/pos_order_view.xml',
    ],
    'assets': {
        'point_of_sale._assets_pos': [
            # 'custom_pos_receipt_sequence/static/src/**/*',
            'custom_pos_receipt_sequence/static/src/js/new_sequence.js',
        ],
    },
    'installable': True,
}
