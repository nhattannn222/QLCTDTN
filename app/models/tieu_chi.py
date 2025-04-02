from . import db
from .tieu_chuan import TieuChuan

class TieuChi(db.Model):
    __tablename__ = 'tieu_chi'

    ma_tieu_chi = db.Column(db.String(50), primary_key=True)
    mo_ta = db.Column(db.Text, nullable=False)
    ma_tieu_chuan = db.Column(db.Integer, db.ForeignKey('tieu_chuan.ma_tieu_chuan', ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

    # Quan hệ với bảng minh_chung
    minh_chungs = db.relationship('MinhChung', backref='tieu_chi', cascade="all, delete", lazy=True)

    def __repr__(self):
        return f"<TieuChi {self.ma_tieu_chi}>"
    
    def to_dict(self):
        return {
            "ma_tieu_chi": self.ma_tieu_chi,
            "mo_ta": self.mo_ta,
            "ma_tieu_chuan": self.ma_tieu_chuan
        }

