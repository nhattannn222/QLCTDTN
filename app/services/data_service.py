from sqlalchemy.orm import joinedload
from app.models import TieuChuan, Nganh, TieuChi, MinhChung, NguoiDung, BCTDG, db
import re

def fetch_tieu_chuan_data(ma_nganh=None):
    # Kiểm tra tính hợp lệ của ma_nganh trong bảng Nganh
    if ma_nganh is not None and ma_nganh != 0:
        # Kiểm tra xem ma_nganh có tồn tại trong bảng Nganh không
        valid_nganh = Nganh.query.filter_by(ma_nganh=ma_nganh).first()  # Truy vấn bảng Nganh
        if not valid_nganh:
            print(f"Invalid ma_nganh: {ma_nganh}, returning empty data.")
            return []  # Nếu không tồn tại, trả về dữ liệu rỗng thay vì ném lỗi

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
        if isinstance(value, str):
            return re.sub(r'\[\d+\]', '', value)  # Loại bỏ [số bất kỳ]
        return value

    # Chuyển dữ liệu sang format dễ render trong template
    data = []
    for tieu_chuan in tieu_chuans:
        tieu_chi_list = []
        for tieu_chi in tieu_chuan.tieu_chis:
            minh_chung_list = []
            for minh_chung in tieu_chi.minh_chungs:
                # Lọc bỏ những minh_chung_con có chứa 'BS' trong tên minh chứng
                minh_chung_cons = [
                    mc.to_dict()
                    for mc in minh_chung.minh_chung_cons
                    if "BS" not in mc.ma_minh_chung
                ]

                minh_chung_list.append({
                    "so_thu_tu": minh_chung.so_thu_tu,
                    "ma_minh_chung": remove_brackets(minh_chung.ma_minh_chung),
                    "url": minh_chung.url,
                    "minh_chung_cons": minh_chung_cons
                })

            tieu_chi_list.append({
                "ma_tieu_chi": remove_brackets(tieu_chi.ma_tieu_chi),
                "mo_ta": tieu_chi.mo_ta,
                "minh_chungs": minh_chung_list
            })

        data.append({
            "ma_tieu_chuan": remove_brackets(tieu_chuan.ma_tieu_chuan),
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

def fetch_minh_chung_bo_sung(ma_nganh=None):
    # Truy vấn dữ liệu từ database với các mối quan hệ
    query = TieuChuan.query.options(
        joinedload(TieuChuan.tieu_chis).joinedload(TieuChi.minh_chungs).joinedload(MinhChung.minh_chung_cons)
    )

    # Nếu có mã ngành, thêm điều kiện lọc theo mã ngành
    if ma_nganh is not None and ma_nganh != 0:
        query = query.filter_by(ma_nganh=ma_nganh)

    tieu_chuans = query.all()

    # Hàm làm sạch mã (áp dụng cho ma_tieu_chi và ma_minh_chung)
    def clean_ma(value):
        if isinstance(value, str):
            # Loại bỏ đoạn đầu kiểu [1], [2], ...
            value = re.sub(r'^\[\d+\]', '', value)
            # Xóa toàn bộ dấu [ và ]
            value = value.replace('[', '').replace(']', '')
            return value.strip()
        return value

    # Chuyển dữ liệu sang format yêu cầu
    data = []
    for tieu_chuan in tieu_chuans:
        tieu_chi_list = []
        for tieu_chi in tieu_chuan.tieu_chis:
            minh_chung_list = []
            for minh_chung in tieu_chi.minh_chungs:
                # Làm sạch ma_minh_chung
                cleaned_ma_minh_chung = clean_ma(minh_chung.ma_minh_chung)

                # Kiểm tra mã có chứa chữ "BS" không
                if 'BS' in cleaned_ma_minh_chung:
                    minh_chung_cons = [mc.to_dict() for mc in minh_chung.minh_chung_cons]
                    minh_chung_list.append({
                        "so_thu_tu": minh_chung.so_thu_tu,
                        "ma_minh_chung": cleaned_ma_minh_chung,
                        "url": minh_chung.url,
                        "minh_chung_cons": minh_chung_cons
                    })

            if minh_chung_list:
                tieu_chi_list.append({
                    "ma_tieu_chi": clean_ma(tieu_chi.ma_tieu_chi),  # Làm sạch ma_tieu_chi ở đây
                    "mo_ta": tieu_chi.mo_ta,
                    "minh_chungs": minh_chung_list
                })

        if tieu_chi_list:
            data.append({
                "ma_tieu_chuan": tieu_chuan.ma_tieu_chuan,  # Không làm sạch
                "ten_tieu_chuan": tieu_chuan.ten_tieu_chuan,
                "tieu_chis": tieu_chi_list
            })

    return data
