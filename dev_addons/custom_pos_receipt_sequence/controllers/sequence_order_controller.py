# custom_pos_receipt_sequence/controllers/sequence_order_controller.py
# coding: utf-8
import logging
import json
from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)

class GetOrderSequenceController(http.Controller):

    @http.route('/get_full_data_order', type='json', auth='public', methods=['POST'])
    def get_full_data_order(self, **post):
        order_id = post.get('order_id')
        order = request.env['pos.order'].sudo().search([(
            'id', '=', order_id
        )], limit=1)
        if not order:
            return {
                'success': False,
                'order': None
            }
        else:
            return {
                'success': True,
                'order': {
                    'name': order.name,
                    'daily_counter': order.daily_counter,
                }
            }
