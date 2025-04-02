from . import db
from .tieu_chi import TieuChi

class MinhChung(db.Model):
    __tablename__ = 'minh_chung'

    ma_minh_chung = db.Column(db.String(50), primary_key=True)
    so_thu_tu = db.Column(db.Integer, nullable=False)
    ma_tieu_chi = db.Column(db.String(50), db.ForeignKey('tieu_chi.ma_tieu_chi', ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    url = db.Column(db.Text, nullable=False)

    # Quan hệ với bảng minh_chung_con
    minh_chung_cons = db.relationship('MinhChungCon', backref='minh_chung', cascade="all, delete", lazy=True)

    def __repr__(self):
        return f"<MinhChung {self.ma_minh_chung}>"
    
    def to_dict(self):
        return {
            "ma_minh_chung": self.ma_minh_chung,
            "so_thu_tu": self.so_thu_tu,
            "ma_tieu_chi": self.ma_tieu_chi,
            "url": self.url
        }
