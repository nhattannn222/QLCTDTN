from app.models import MinhChung

def get_minh_chung_service(ma_tieu_chi):
    try:
        minh_chungs = MinhChung.query.filter_by(ma_tieu_chi=ma_tieu_chi).all()
        return [mc.to_dict() for mc in minh_chungs]
    except Exception as e:
        raise Exception(f"Lỗi khi lấy minh chứng: {str(e)}")
