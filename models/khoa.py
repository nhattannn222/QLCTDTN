from . import db

class Khoa(db.Model):
    __tablename__ = 'khoa'

    ma_khoa = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ten_khoa = db.Column(db.String(50), nullable=False)

    # Quan hệ với bảng tieu_chuan
    tieu_chuans = db.relationship('TieuChuan', backref='khoa', cascade="all, delete", lazy=True)

    def __repr__(self):
        return f"<Khoa {self.ten_khoa}>"
