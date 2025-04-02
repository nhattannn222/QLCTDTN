from app.models import TieuChuan

def get_tieu_chuan_service(ma_nganh):
    try:
        tieu_chuans = TieuChuan.query.filter_by(ma_nganh=ma_nganh).all()
        return [tc.to_dict() for tc in tieu_chuans]
    except Exception as e:
        raise Exception(f"Lỗi khi lấy tiêu chuẩn: {str(e)}")