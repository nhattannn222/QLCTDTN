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
