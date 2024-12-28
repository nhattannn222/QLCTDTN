from flask import Blueprint, jsonify, request
from app.services.nganh import getNganh
from app.services.minh_chung_con import update_link
from app.middlewares.authorize import authorize

data_bp = Blueprint('data', __name__)

@data_bp.route('/api/v1/nganh')
def nganh():
    nganhs = getNganh()
    return jsonify({
            'status': 200,
            'data': nganhs
        }), 200  # Trả về mã trạng thái HTTP 200 (OK)

@data_bp.route('/api/v1/update_link/<int:minh_chung_con_id>', methods=['PUT'])
@authorize
def update_link_route(minh_chung_con_id):
    # Lấy dữ liệu từ request
    data = request.get_json()

    # Kiểm tra xem dữ liệu có hợp lệ không
    if not data or 'link' not in data:
        return jsonify({'status': 400, 'message': 'Link không hợp lệ'}), 400

    new_link = data['link']

    try:
        # Gọi service để cập nhật link
        updated_minh_chung_con = update_link(minh_chung_con_id, new_link)

        # Kiểm tra xem bản ghi có được cập nhật không
        if not updated_minh_chung_con:
            return jsonify({'status': 404, 'message': 'Không tìm thấy Minh Chứng Con để cập nhật'}), 404

        return jsonify({
            'status': 200,
            'message': 'Cập nhật link thành công',
            'data': updated_minh_chung_con.to_dict()  # Trả về dữ liệu đã cập nhật dưới dạng dict
        }), 200
    except Exception as e:
        # Trả về lỗi nếu có bất kỳ sự cố nào
        return jsonify({'status': 500, 'message': f'Lỗi server: {str(e)}'}), 500
