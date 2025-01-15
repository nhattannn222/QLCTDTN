from sqlalchemy.orm import joinedload
from app.models import TieuChuan
from app.models import TieuChi
from app.models import MinhChung
from app.models import NguoiDung
from app.models import BCTDG, db
import re

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

    # Hàm loại bỏ các chuỗi [2], [3], [4], [5]
    def remove_brackets(value):
        # Đảm bảo value là chuỗi trước khi áp dụng re.sub
        if isinstance(value, str):
            return re.sub(r'\[\d\]', '', value)
        return value  # Trả về giá trị gốc nếu không phải chuỗi

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
                    "ma_minh_chung": remove_brackets(minh_chung.ma_minh_chung),  # Loại bỏ [2], [3], [4], [5]
                    "url": minh_chung.url,
                    "minh_chung_cons": minh_chung_cons
                })
            tieu_chi_list.append({
                "ma_tieu_chi": remove_brackets(tieu_chi.ma_tieu_chi),  # Loại bỏ [2], [3], [4], [5]
                "mo_ta": tieu_chi.mo_ta,
                "minh_chungs": minh_chung_list
            })
        data.append({
            "ma_tieu_chuan": remove_brackets(tieu_chuan.ma_tieu_chuan),  # Loại bỏ [2], [3], [4], [5]
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
    
def get_bctdg():
    """
    Lấy danh sách các bản ghi từ bảng BCTDG và trả về dưới dạng Python list.
    """
    try:
        # Truy vấn tất cả các bản ghi trong bảng BCTDG
        bctdg_list = BCTDG.query.all()

        # Kiểm tra nếu không có bản ghi nào
        if not bctdg_list:
            return []  # Trả về danh sách rỗng nếu không có bản ghi

        # Chuyển đổi dữ liệu thành danh sách dictionary
        result = [
            {
                "ma_bc_tdg": item.ma_bc_tdg,
                "ma_nganh": item.ma_nganh,
                "ten_nganh": getattr(item.nganh, 'ten_nganh', None),  # Tránh lỗi nếu `nganh` là None
                "url": item.url
            }
            for item in bctdg_list
        ]

        # Trả về danh sách kết quả dưới dạng Python list
        return result
    except Exception as e:
        # Xử lý lỗi và trả về thông báo lỗi
        print(f"Error fetching data: {e}")
        return []  # Trả về danh sách rỗng trong trường hợp có lỗi


def updateURLbctdg(ma_bc_tdg, data):
    try:
        # Kiểm tra xem dữ liệu có chứa trường 'url' không
        if 'url' not in data:
            return {"error": "URL is required"}, 400

        # Tìm bản ghi BCTDG theo ma_bc_tdg
        bctdg = BCTDG.query.filter_by(ma_bc_tdg=ma_bc_tdg).first()

        # Nếu không tìm thấy bản ghi
        if not bctdg:
            return {"error": "BCTDG record not found"}, 404

        # Cập nhật URL
        bctdg.url = data['url']
        db.session.commit()  # Lưu thay đổi vào cơ sở dữ liệu

        # Trả về kết quả thành công
        return {
            "message": "URL updated successfully",
            "ma_bc_tdg": bctdg.ma_bc_tdg,
            "new_url": bctdg.url
        }, 200

    except Exception as e:
        # Xử lý lỗi và trả về thông báo lỗi
        return {"error": str(e)}, 500