# services/yeu_cau_service.py

import os
from werkzeug.utils import secure_filename
from datetime import datetime
from ..models.yeu_cau import YeuCau
from app.models import db

# Đường dẫn tuyệt đối tới thư mục uploads/img
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', '..', 'uploads', 'img')

# Đảm bảo thư mục uploads/img tồn tại
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def get_all_yeu_cau():
    try:
        yeu_cau_list = YeuCau.query.all()
        return [yeu_cau.to_dict() for yeu_cau in yeu_cau_list]
    except Exception as e:
        return {"error": str(e)}, 500
    
def get_all_yeu_cau_by_tai_khoan(tai_khoan_yeu_cau):
    try:
        # Lọc các yêu cầu theo tai_khoan_yeu_cau
        yeu_cau_list = YeuCau.query.filter_by(tai_khoan_yeu_cau=tai_khoan_yeu_cau).all()
        return [yeu_cau.to_dict() for yeu_cau in yeu_cau_list]
    except Exception as e:
        # Xử lý lỗi nếu có
        print(f"Error fetching requests for tai_khoan_yeu_cau {tai_khoan_yeu_cau}: {str(e)}")
        raise ValueError("Không thể truy xuất yêu cầu từ cơ sở dữ liệu.")


def allowed_file(filename):
    # Kiểm tra xem file có phải là hình ảnh hay không
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def xu_li_yeu_cau(ma_yeu_cau, file, tai_khoan_xu_li):
    try:
        # Tìm yêu cầu theo ma_yeu_cau
        yeu_cau = YeuCau.query.get(ma_yeu_cau)
        
        if not yeu_cau:
            raise ValueError("Yêu cầu không tồn tại")

        # Kiểm tra xem file có hợp lệ không
        if file and allowed_file(file.filename):
            # Tạo tên file từ thời gian hiện tại (dùng datetime.now())
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S%f')  # Định dạng tên file
            file_extension = file.filename.rsplit('.', 1)[1].lower()  # Lấy phần mở rộng của file
            filename = f"{timestamp}.{file_extension}"  # Tạo tên file với timestamp và đuôi file
            
            # Đường dẫn lưu file trong thư mục uploads/img
            file_path = os.path.join(UPLOAD_FOLDER, filename)  # Đường dẫn tuyệt đối
            file.save(file_path)  # Lưu file vào thư mục

            # Cập nhật đường dẫn ảnh đã xử lý và trạng thái
            yeu_cau.duong_dan_den_anh_da_xu_li = f'uploads/img/{filename}'
            yeu_cau.trang_thai = 'da_xu_li'
            yeu_cau.tai_khoan_xu_li = tai_khoan_xu_li  # Gắn tai_khoan_xu_li từ request.user['tai_khoan']
            yeu_cau.ngay_xu_li = datetime.now()

            # Lưu thay đổi vào cơ sở dữ liệu
            db.session.commit()

            return yeu_cau.to_dict()

        else:
            raise ValueError("File không hợp lệ hoặc không phải ảnh")

    except Exception as e:
        db.session.rollback()  # Đảm bảo rollback nếu có lỗi
        raise e


def tao_yeu_cau(noi_dung, file, tai_khoan_yeu_cau):
    """Service tạo yêu cầu"""
    
    # Kiểm tra xem có file hợp lệ không
    if not allowed_file(file.filename):
        raise ValueError("Chỉ cho phép tải lên các file hình ảnh hoặc PDF!")
    
    # Tạo tên file từ thời gian hiện tại (dùng datetime.now())
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S%f')  # Định dạng tên file
    file_extension = file.filename.rsplit('.', 1)[1].lower()  # Lấy phần mở rộng của file
    filename = f"{timestamp}.{file_extension}"  # Tạo tên file với timestamp và đuôi file

    # Đường dẫn lưu file trong thư mục uploads/img
    file_path = os.path.join(UPLOAD_FOLDER, filename)  # Đường dẫn tuyệt đối
    file.save(file_path)  # Lưu file vào thư mục

    # Lưu thông tin yêu cầu vào cơ sở dữ liệu
    yeu_cau = YeuCau(
        noi_dung=noi_dung,
        duong_dan_den_anh_yeu_cau=f'uploads/img/{filename}',  # Lưu đường dẫn file vào cơ sở dữ liệu
        tai_khoan_yeu_cau=tai_khoan_yeu_cau,
        trang_thai='chua_xu_li'
    )
    db.session.add(yeu_cau)
    db.session.commit()
    
    return yeu_cau.to_dict()