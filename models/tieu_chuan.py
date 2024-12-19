from . import db
from .khoa import Khoa

class TieuChuan(db.Model):
    __tablename__ = 'tieu_chuan'

    ma_tieu_chuan = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ten_tieu_chuan = db.Column(db.Text, nullable=False)
    ma_khoa = db.Column(db.Integer, db.ForeignKey('khoa.ma_khoa', ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

    # Quan hệ với bảng tieu_chi
    tieu_chis = db.relationship('TieuChi', backref='tieu_chuan', cascade="all, delete", lazy=True)

    def __repr__(self):
        return f"<TieuChuan {self.ten_tieu_chuan}>"
