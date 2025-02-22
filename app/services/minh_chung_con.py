from app.models import db
from app.models.minh_chung_con import MinhChungCon
from flask import abort

# Hàm cập nhật link cho minh_chung_con
def update_link(ma_minh_chung_con, new_link):
    """
    Cập nhật link cho minh_chung_con theo ID.
    """
    # Tìm minh_chung_con theo ID
    minh_chung_con = MinhChungCon.query.get(ma_minh_chung_con)
    if not minh_chung_con:
        abort(404, description="Minh Chung Con không tồn tại.")  # Nếu không tìm thấy minh_chung_con, trả về lỗi 404

    # Cập nhật link
    minh_chung_con.link = new_link

    # Lưu thay đổi vào cơ sở dữ liệu
    db.session.commit()

    return minh_chung_con  # Trả về đối tượng minh_chung_con đã cập nhật

def updateMC(ma_minh_chung_con, ten_minh_chung, so_minh_chung, ngay_ban_hanh, noi_ban_hanh):
    """
    Cập nhật thông tin minh chứng con theo ID.
    """

    # Tìm minh_chung_con theo ID
    minh_chung_con = MinhChungCon.query.get(ma_minh_chung_con)
    if not minh_chung_con:
        abort(404, description="Minh chứng con không tồn tại.")  # Nếu không tìm thấy, trả về lỗi 404

    # Cập nhật thông tin mới
    minh_chung_con.ten_minh_chung = ten_minh_chung
    minh_chung_con.so_minh_chung = so_minh_chung
    minh_chung_con.ngay_ban_hanh = ngay_ban_hanh
    minh_chung_con.noi_ban_hanh = noi_ban_hanh

    # Lưu thay đổi vào cơ sở dữ liệu
    db.session.commit()

    return minh_chung_con  # Trả về đối tượng minh chứng con đã cập nhật

def getMC(ma_minh_chung_con):
    try:
        # Tìm minh chứng con theo ID
        minh_chung_con = MinhChungCon.query.get(ma_minh_chung_con)
        
        # Nếu không tìm thấy, trả về lỗi 404
        if not minh_chung_con:
            abort(404, description='Minh chứng con không tồn tại')

        # Trả về dữ liệu dưới dạng dictionary
        return minh_chung_con.to_dict()
    except Exception as e:
        abort(500, description=f'Lỗi server: {str(e)}')

def deleteMC(ma_minh_chung_con):

    try:
        # Tìm minh chứng cần xóa
        minh_chung = MinhChungCon.query.filter_by(ma_minh_chung_con=ma_minh_chung_con).first()
        
        if not minh_chung:
            return False  # Trả về False nếu không tìm thấy

        # Xóa minh chứng
        db.session.delete(minh_chung)
        db.session.commit()
        return True  # Trả về True nếu xóa thành công
    except Exception as e:
        db.session.rollback()
        raise e  # Ném lỗi để xử lý phía trên
