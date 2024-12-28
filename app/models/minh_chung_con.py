from . import db
from .minh_chung import MinhChung

class MinhChungCon(db.Model):
    __tablename__ = 'minh_chung_con'

    ma_minh_chung_con = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ma_minh_chung = db.Column(db.String(50), db.ForeignKey('minh_chung.ma_minh_chung', ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    ten_minh_chung = db.Column(db.Text, nullable=False)
    so_minh_chung = db.Column(db.Text, nullable=False)
    noi_ban_hanh = db.Column(db.Text, nullable=False)
    link = db.Column(db.Text, nullable=False)
    ngay_ban_hanh = db.Column(db.Date, nullable=False)  # Thêm trường ngày_ban_hanh

    def __repr__(self):
        return f"<MinhChungCon {self.ten_minh_chung}>"

    def to_dict(self):
        return {
            'ma_minh_chung_con': self.ma_minh_chung_con,
            'ma_minh_chung': self.ma_minh_chung,
            'ten_minh_chung': self.ten_minh_chung,
            'so_minh_chung': self.so_minh_chung,
            'noi_ban_hanh': self.noi_ban_hanh,
            'link': self.link,
            'ngay_ban_hanh': self.ngay_ban_hanh  # Chuyển đổi ngày thành định dạng chuỗi
        }
