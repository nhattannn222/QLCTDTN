from app.models import Nganh
from app.models import NguoiDung


def getNganh(token=None):
    nguoi_dung = None  # Khởi tạo nguoi_dung mặc định là None
    query = Nganh.query.filter(Nganh.ma_nganh > 0)  # Lọc các ngành có mã ngành > 0
    if token is not None:
        nguoi_dung = NguoiDung.query.filter_by(token=token).first()

    if nguoi_dung is not None and nguoi_dung.vai_tro != "admin":
        query = query.filter_by(ma_nganh=nguoi_dung.ma_nganh)

    nganhs = query.all()  # Lấy danh sách ngành sau khi đã áp dụng các bộ lọc
    return [nganh.to_dict() for nganh in nganhs]  # Chuyển các đối tượng Nganh thành từ điển
