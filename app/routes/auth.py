from flask import Blueprint, request, jsonify, make_response
from app.services.nguoi_dung_service import register, login
import datetime

from app import db

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/api/v1/login', methods=['POST'])
def login_route():
    # Lấy dữ liệu JSON từ request
    data = request.get_json()

    # Lấy tài khoản và mật khẩu từ dữ liệu
    tai_khoan = data.get('tai_khoan')
    mat_khau = data.get('mat_khau')

    try:
        # Kiểm tra tài khoản và mật khẩu
        user = login(tai_khoan, mat_khau)

        # Tạo phản hồi (response) và lưu token vào cookie
        response = make_response(jsonify({
            'status': 200,
            'message': 'Đăng nhập thành công!',
            'user': {
                'tai_khoan': user.tai_khoan,
                'vai_tro': user.vai_tro,
                'ma_nganh': user.ma_nganh
            }
        }), 200)

        # Lưu token vào cookie, với thời gian hết hạn là 1 giờ
        response.set_cookie('token', user.token, max_age=datetime.timedelta(hours=1))

        # Trả về phản hồi
        return response

    except Exception as e:
        # Nếu có lỗi (ví dụ: tài khoản hoặc mật khẩu không đúng), trả về lỗi
        return jsonify({
            'message': f"Thông tin đăng nhập không hợp lệ. Lỗi: {str(e)}"
        }), 401  # Trả về mã trạng thái HTTP 401 (Unauthorized)

@auth_bp.route('/api/v1/register', methods=['POST'])
def register_route():
    # Lấy dữ liệu từ request
    tai_khoan = request.json.get('tai_khoan')
    mat_khau = request.json.get('mat_khau')
    vai_tro = request.json.get('vai_tro')  # Vai trò của người dùng (admin/manager)
    ma_nganh = request.json.get('ma_nganh', 0)  # Mặc định là 0 cho admin

    try:
        # Gọi hàm register để tạo người dùng mới
        new_user = register(tai_khoan, mat_khau, vai_tro, ma_nganh)
        return jsonify({
            'message': 'Đăng ký thành công',
            'tai_khoan': new_user.tai_khoan,
            'vai_tro': new_user.vai_tro
        }), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400
