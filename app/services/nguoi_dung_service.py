from app.models import db
from app.models.nguoi_dung import NguoiDung
import bcrypt
from flask import abort
from config import Config
import jwt
import datetime


# Hàm mã hóa mật khẩu
def hash_mat_khau(mat_khau: str) -> bytes:
    """
    Mã hóa mật khẩu sử dụng bcrypt.
    """
    salt = bcrypt.gensalt()  # Tạo salt ngẫu nhiên
    hashed = bcrypt.hashpw(mat_khau.encode('utf-8'), salt)  # Mã hóa mật khẩu
    return hashed  # Trả về mật khẩu đã mã hóa dưới dạng bytes

def check_mat_khau(input_mat_khau, stored_mat_khau):
    """
    Kiểm tra mật khẩu người dùng nhập vào so với mật khẩu đã mã hóa trong cơ sở dữ liệu.
    """
    # Kiểm tra xem mật khẩu trong cơ sở dữ liệu có tồn tại không
    if stored_mat_khau is None:
        return False  # Nếu không có mật khẩu trong cơ sở dữ liệu, trả về False

    # Chuyển mật khẩu đã mã hóa từ chuỗi thành bytes nếu cần
    if isinstance(stored_mat_khau, str):
        stored_mat_khau = stored_mat_khau.encode('utf-8')

    # Kiểm tra mật khẩu đã mã hóa
    return bcrypt.checkpw(input_mat_khau.encode('utf-8'), stored_mat_khau)

# Hàm xử lý đăng nhập
def login(tai_khoan: str, mat_khau: str):
    """
    Kiểm tra thông tin đăng nhập của người dùng.
    """
    user = NguoiDung.query.filter_by(tai_khoan=tai_khoan).first()  # Lấy người dùng từ DB theo tài khoản

    if user is None:
        abort(401, description="Tài khoản không tồn tại.")  # Nếu không tìm thấy người dùng, trả về lỗi

    # Kiểm tra mật khẩu
    if not check_mat_khau(mat_khau, user.mat_khau):
        abort(401, description="Mật khẩu không chính xác.")  # Nếu mật khẩu không đúng, trả về lỗi

    # Kiểm tra và chuyển đổi các giá trị thành chuỗi
    tai_khoan = str(user.tai_khoan) if user.tai_khoan else ''
    vai_tro = str(user.vai_tro) if user.vai_tro else ''
    ma_nganh = str(user.ma_nganh) if user.ma_nganh else ''

    # Nếu đăng nhập thành công, tạo JWT token
    token = jwt.encode({
        'tai_khoan': tai_khoan,
        'vai_tro': vai_tro,
        'ma_nganh': ma_nganh,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Token hết hạn sau 1 giờ
    }, Config.SECRET_KEY, algorithm='HS256')

    # Lưu token vào cơ sở dữ liệu (thêm cột `token` vào bảng `NguoiDung` nếu chưa có)
    user.token = token
    db.session.commit()

    return user  # Nếu đăng nhập thành công, trả về đối tượng người dùng
# Hàm đăng ký người dùng mới
def register(tai_khoan: str, mat_khau: str, vai_tro: str, ma_nganh: int = 0):
    """
    Đăng ký người dùng mới, mã hóa mật khẩu và lưu vào cơ sở dữ liệu.
    """
    if not tai_khoan or not mat_khau or not vai_tro:
        abort(400, description="Tài khoản, mật khẩu và vai trò là bắt buộc.")  # Kiểm tra các trường không được để trống

    # Kiểm tra xem tài khoản đã tồn tại chưa
    existing_user = NguoiDung.query.filter_by(tai_khoan=tai_khoan).first()
    if existing_user:
        abort(400, description="Tài khoản đã tồn tại.")  # Nếu tài khoản đã tồn tại, trả về lỗi

    # Mã hóa mật khẩu
    hashed_mat_khau = hash_mat_khau(mat_khau)

    # Tạo đối tượng người dùng mới
    new_user = NguoiDung(tai_khoan=tai_khoan, mat_khau=hashed_mat_khau, vai_tro=vai_tro, ma_nganh=ma_nganh)

    # Lưu vào cơ sở dữ liệu
    db.session.add(new_user)
    db.session.commit()

    return new_user  # Trả về đối tượng người dùng mới