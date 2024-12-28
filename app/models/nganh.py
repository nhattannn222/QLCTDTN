from . import db

class Nganh(db.Model):
    __tablename__ = 'nganh'

    ma_nganh = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ten_nganh = db.Column(db.String(50), nullable=False)

    # Quan hệ với bảng tieu_chuan
    tieu_chuans = db.relationship('TieuChuan', backref='nganh', cascade="all, delete", lazy=True)

    def __repr__(self):
        return f"<nganh {self.ten_nganh}>"
    
    def to_dict(self):
        return {
            'ma_nganh': self.ma_nganh,
            'ten_nganh': self.ten_nganh
        }
