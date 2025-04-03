from . import db
from datetime import datetime

class YeuCau(db.Model):
    __tablename__ = 'yeu_cau'
    
    ma_yeu_cau = db.Column(db.Integer, primary_key=True, autoincrement=True)
    noi_dung = db.Column(db.Text, nullable=True)
    duong_dan_den_anh_yeu_cau = db.Column(db.String(255))
    duong_dan_den_anh_da_xu_li = db.Column(db.String(255))
    ngay_yeu_cau = db.Column(db.DateTime, default=datetime.now)
    ngay_xu_li = db.Column(db.DateTime, nullable=True)
    tai_khoan_yeu_cau = db.Column(db.String(100), db.ForeignKey('nguoi_dung.tai_khoan'))
    tai_khoan_xu_li = db.Column(db.String(100), db.ForeignKey('nguoi_dung.tai_khoan'))
    trang_thai = db.Column(db.Enum('chua_xu_li', 'da_xu_li', 'huy', name='trang_thai_enum'), default='chua_xu_li')
    
    def __repr__(self):
        return f"<YeuCau {self.ma_yeu_cau} - {self.trang_thai}>"

    def to_dict(self):
        return {
            "ma_yeu_cau": self.ma_yeu_cau,
            "noi_dung": self.noi_dung,
            "duong_dan_den_anh_yeu_cau": self.duong_dan_den_anh_yeu_cau,
            "duong_dan_den_anh_da_xu_li": self.duong_dan_den_anh_da_xu_li,
            "ngay_yeu_cau": self.ngay_yeu_cau.isoformat() if self.ngay_yeu_cau else None,
            "ngay_xu_li": self.ngay_xu_li.isoformat() if self.ngay_xu_li else None,
            "tai_khoan_yeu_cau": self.tai_khoan_yeu_cau,
            "tai_khoan_xu_li": self.tai_khoan_xu_li,
            "trang_thai": self.trang_thai,
        }