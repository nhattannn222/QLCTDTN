# routes/yeu_cau_routes.py
from flask import Blueprint, jsonify, request
from ..services.yeu_cau import get_all_yeu_cau, xu_li_yeu_cau, tao_yeu_cau, get_all_yeu_cau_by_tai_khoan
from app.middlewares.authorize import authorize


yeu_cau_bp = Blueprint('yeu_cau', __name__)

@yeu_cau_bp.route('/yeu_cau', methods=['GET'])
@authorize
def get_all_yeu_cau_route():
    try:
        # Lấy thông tin người dùng từ request
        tai_khoan_yeu_cau = request.user['tai_khoan']  # Giả sử thông tin người dùng đã có trong request
        role = request.user.get('vai_tro', '')  # Lấy role người dùng từ thông tin người dùng (admin hoặc manager)
        print(role)

        # Nếu là admin, trả về tất cả yêu cầu
        if role == 'admin':
            result = get_all_yeu_cau()
        
        # Nếu là manager, chỉ trả về các yêu cầu của người đó
        elif role == 'manager':
            result = get_all_yeu_cau_by_tai_khoan(tai_khoan_yeu_cau)
        else:
            return jsonify({
                "status": 403,
                "message": "Quyền truy cập không hợp lệ"
            }), 403

        # Trả về dữ liệu nếu không có lỗi
        return jsonify({
            "status": 200,
            "data": result
        }), 200

    except Exception as e:
        # Trường hợp có lỗi xảy ra, log và trả về thông báo lỗi
        print(f"Error fetching data: {str(e)}")
        return jsonify({
            "status": 500,
            "message": "Lỗi khi lấy dữ liệu yêu cầu. Vui lòng thử lại sau."
        }), 500

        
@yeu_cau_bp.route('/xu_li_yeu_cau/<int:ma_yeu_cau>', methods=['POST'])
@authorize
def xu_li_yeu_cau_route(ma_yeu_cau):
    try:
        # Lấy tai_khoan từ thông tin người dùng trong request
        tai_khoan_xu_li = request.user['tai_khoan']  # Giả sử thông tin người dùng đã có trong request

        # Kiểm tra xem có file trong request không
        if 'file' not in request.files:
            return jsonify({
                "status": 400,
                "message": "Không có file trong yêu cầu"
            }), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({
                "status": 400,
                "message": "Tên file không hợp lệ"
            }), 400

        # Gọi service để xử lý yêu cầu và cập nhật trạng thái
        result = xu_li_yeu_cau(ma_yeu_cau, file, tai_khoan_xu_li)

        return jsonify({
            "status": 200,
            "message": "Yêu cầu đã được xử lý",
            "data": result
        }), 200

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({
            "status": 500,
            "message": "Lỗi khi xử lý yêu cầu"
        }), 500
        
@yeu_cau_bp.route('/tao_yeu_cau', methods=['POST'])
@authorize
def tao_yeu_cau_route():
    try:
        # Lấy tai_khoan từ thông tin người dùng trong request
        tai_khoan_yeu_cau = request.user['tai_khoan']  # Giả sử thông tin người dùng đã có trong request
        
        # Lấy nội dung yêu cầu từ form-data
        noi_dung = request.form.get('noi_dung')
        if not noi_dung:
            return jsonify({
                "status": 400,
                "message": "Nội dung yêu cầu không được bỏ trống!"
            }), 400

        # Kiểm tra xem có file trong request không
        if 'file' not in request.files:
            return jsonify({
                "status": 400,
                "message": "Không có file trong yêu cầu"
            }), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({
                "status": 400,
                "message": "Tên file không hợp lệ"
            }), 400

        # Gọi service để tạo yêu cầu
        yeu_cau = tao_yeu_cau(noi_dung, file, tai_khoan_yeu_cau)

        return jsonify({
            "status": 200,
            "message": "Yêu cầu đã được tạo thành công",
            "data": yeu_cau
        }), 200

    except ValueError as e:
        # Xử lý lỗi liên quan đến file
        return jsonify({
            "status": 400,
            "message": str(e)
        }), 400
    except Exception as e:
        # Xử lý lỗi tổng quát
        print(f"Error processing request: {str(e)}")
        return jsonify({
            "status": 500,
            "message": "Lỗi khi xử lý yêu cầu"
        }), 500