from functools import wraps
from flask import request, jsonify, current_app
import jwt
from datetime import datetime
from config import Config

# Middleware kiểm tra quyền truy cập (authorize)
def authorize(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Lấy token từ header Authorization
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return jsonify({'message': 'Token không được cung cấp.'}), 401  # Nếu không có token, trả về lỗi

        # Token sẽ có dạng "Bearer <token>", cần phải tách lấy token
        token_parts = auth_header.split(" ")

        if len(token_parts) != 2 or not token_parts[1]:
            return jsonify({'message': 'Token không hợp lệ.'}), 401  # Nếu không có token hợp lệ, trả về lỗi

        token = token_parts[1]  # Lấy phần sau "Bearer"

        if not isinstance(token, str) or not token:
            return jsonify({'message': 'Token không hợp lệ.'}), 401  # Kiểm tra nếu token không phải chuỗi hoặc rỗng

        try:
            # Giải mã token và kiểm tra thông tin người dùng
            decoded_token = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])

            # Kiểm tra xem token có hết hạn không
            if decoded_token['exp'] < datetime.utcnow().timestamp():
                return jsonify({'message': 'Token đã hết hạn.'}), 401  # Nếu token hết hạn, trả về lỗi

            # Nếu token hợp lệ, thêm thông tin người dùng vào request để sử dụng trong các route khác
            request.user = decoded_token
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token đã hết hạn.'}), 401  # Nếu token hết hạn, trả về lỗi
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token không hợp lệ.'}), 401  # Nếu token không hợp lệ, trả về lỗi

        return f(*args, **kwargs)

    return decorated_function
