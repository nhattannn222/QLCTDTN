from app.models import db
from app.models.minh_chung_con import MinhChungCon, MinhChung
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

def updateMC(ma_minh_chung_con, ten_minh_chung, so_minh_chung, ngay_ban_hanh, noi_ban_hanh, url_hop_minh_chung):
    """
    Cập nhật thông tin minh chứng con và gắn url_hop_minh_chung vào MinhChung cha.
    """

    # Tìm minh chứng con theo ID
    minh_chung_con = MinhChungCon.query.get(ma_minh_chung_con)
    if not minh_chung_con:
        abort(404, description="Minh chứng con không tồn tại.")

    # Cập nhật thông tin MinhChungCon
    minh_chung_con.ten_minh_chung = ten_minh_chung
    minh_chung_con.so_minh_chung = so_minh_chung
    minh_chung_con.ngay_ban_hanh = ngay_ban_hanh
    minh_chung_con.noi_ban_hanh = noi_ban_hanh

    # Cập nhật url cho MinhChung cha (nếu tồn tại)
    if minh_chung_con.minh_chung:
        minh_chung_con.minh_chung.url = url_hop_minh_chung
    else:
        abort(400, description="Minh chứng con không gắn với Minh chứng cha nào.")

    # Lưu thay đổi vào database
    db.session.commit()

    return minh_chung_con


def getMC(ma_minh_chung_con):
    try:
        # Tìm minh chứng con theo ID
        minh_chung_con = MinhChungCon.query.get(ma_minh_chung_con)

        # Nếu không tìm thấy, trả về lỗi 404
        if not minh_chung_con:
            abort(404, description='Minh chứng con không tồn tại')

        # Chuyển đối tượng MinhChungCon thành dict
        result = minh_chung_con.to_dict()

        # Gắn thêm url của MinhChung cha nếu có
        if minh_chung_con.minh_chung:  # Quan hệ với MinhChung
            result['url_hop_minh_chung'] = minh_chung_con.minh_chung.url
        else:
            result['url_hop_minh_chung'] = None

        return result

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
    
def create_minh_chung(ma_minh_chung, so_thu_tu, ma_tieu_chi, url):
    try:            
        # Tạo MinhChungCon với thông tin đầy đủ
        new_minh_chung = MinhChung(
            ma_minh_chung=ma_minh_chung,
            so_thu_tu=so_thu_tu,
            ma_tieu_chi=ma_tieu_chi,
            url=url
        )

        db.session.add(new_minh_chung)
        db.session.commit()

        return new_minh_chung.to_dict()

    except Exception as e:
        db.session.rollback()
        return str(e)    
    
def create_minh_chung_con(ma_minh_chung, ten_minh_chung, so_minh_chung="", noi_ban_hanh="", ngay_ban_hanh=""):
    try:            
        # Tạo MinhChungCon với thông tin đầy đủ
        new_minh_chung_con = MinhChungCon(
            ma_minh_chung=ma_minh_chung,
            ten_minh_chung=ten_minh_chung,
            so_minh_chung=so_minh_chung,
            noi_ban_hanh=noi_ban_hanh,
            ngay_ban_hanh=ngay_ban_hanh,
            link=""
        )

        db.session.add(new_minh_chung_con)
        db.session.commit()

        return new_minh_chung_con.to_dict()

    except Exception as e:
        db.session.rollback()
        return str(e)
    
def create_minh_chung_con_bs(ma_minh_chung, so_thu_tu, ma_tieu_chi, ten_minh_chung, url="", so_minh_chung="", noi_ban_hanh="", ngay_ban_hanh=""):
    try:
        if not so_thu_tu or not ma_tieu_chi or not ten_minh_chung:
            abort(400, description="Thiếu thông tin bắt buộc!") 

        minh_chung = MinhChung(ma_tieu_chi=ma_tieu_chi,
            so_thu_tu=so_thu_tu,
            url=url,
            ma_minh_chung=ma_minh_chung)
        db.session.add(minh_chung)
        db.session.flush()  # Đảm bảo có ID MinhChung để liên kết
            
        # Tạo MinhChungCon với thông tin đầy đủ
        new_minh_chung_con = MinhChungCon(
            ma_minh_chung=minh_chung.ma_minh_chung,  # Liên kết với MinhChung vừa tạo
            ten_minh_chung=ten_minh_chung,
            so_minh_chung=so_minh_chung,
            noi_ban_hanh=noi_ban_hanh,
            ngay_ban_hanh=ngay_ban_hanh,
            link=""
        )

        db.session.add(new_minh_chung_con)
        db.session.commit()

        return new_minh_chung_con.to_dict()

    except Exception as e:
        db.session.rollback()  # Đảm bảo hoàn tác khi có lỗi
        return str(e)


