from . import db

class NguoiDung(db.Model):
    __tablename__ = 'nguoi_dung'

    tai_khoan = db.Column(db.Integer, primary_key=True, autoincrement=True)
    mat_khau = db.Column(db.String(100), nullable=False)  # Mã hóa mật khẩu
    vai_tro = db.Column(db.Enum('admin', 'manager'), nullable=False)  # Vai trò của người dùng
    ma_nganh = db.Column(db.Integer, db.ForeignKey('nganh.ma_nganh', ondelete='SET NULL'), default=0)  # Liên kết với ngành
    token = db.Column(db.String(255))  

    # Quan hệ với bảng nganh
    nganh = db.relationship('Nganh', backref=db.backref('nguoi_dungs', lazy=True))

    def __repr__(self):
        return f"<NguoiDung {self.tai_khoan}, Vai tro: {self.vai_tro}>"
