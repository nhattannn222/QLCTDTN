from app.models import TieuChi

def get_tieu_chi_service(ma_tieu_chuan):
    try:
        tieu_chis = TieuChi.query.filter_by(ma_tieu_chuan=ma_tieu_chuan).all()
        return [tc.to_dict() for tc in tieu_chis]
    except Exception as e:
        raise Exception(f"Lỗi khi lấy tiêu chí: {str(e)}")
