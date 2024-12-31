from sqlalchemy.orm import joinedload
from app.models import TieuChuan
from app.models import TieuChi
from app.models import MinhChung
from app.models import NguoiDung

def fetch_tieu_chuan_data(ma_nganh=None):
    # Truy vấn dữ liệu từ database với các mối quan hệ
    query = TieuChuan.query.options(
        joinedload(TieuChuan.tieu_chis).joinedload(TieuChi.minh_chungs).joinedload(MinhChung.minh_chung_cons)
    )

    # Nếu có mã ngành, thêm điều kiện lọc theo mã ngành
    if ma_nganh is not None and ma_nganh != 0:
        query = query.filter_by(ma_nganh=ma_nganh)

    # Lấy tất cả các tiêu chuẩn
    tieu_chuans = query.all()

    # Chuyển dữ liệu sang format dễ render trong template
    data = []
    for tieu_chuan in tieu_chuans:
        tieu_chi_list = []
        for tieu_chi in tieu_chuan.tieu_chis:
            minh_chung_list = []
            for minh_chung in tieu_chi.minh_chungs:
                minh_chung_cons = [mc.to_dict() for mc in minh_chung.minh_chung_cons]
                minh_chung_list.append({
                    "so_thu_tu": minh_chung.so_thu_tu,
                    "ma_minh_chung": minh_chung.ma_minh_chung,
                    "url": minh_chung.url,
                    "minh_chung_cons": minh_chung_cons
                })
            tieu_chi_list.append({
                "ma_tieu_chi": tieu_chi.ma_tieu_chi,
                "mo_ta": tieu_chi.mo_ta,
                "minh_chungs": minh_chung_list
            })
        data.append({
            "ma_tieu_chuan": tieu_chuan.ma_tieu_chuan,
            "ten_tieu_chuan": tieu_chuan.ten_tieu_chuan,
            "tieu_chis": tieu_chi_list
        })

    return data


def getMaNganh(token):
    nguoi_dung = None  # Khởi tạo nguoi_dung mặc định là None

    # Truy vấn người dùng có token tương ứng
    if token is not None:
        nguoi_dung = NguoiDung.query.filter_by(token=token).first()

    if nguoi_dung: 
        return nguoi_dung.ma_nganh