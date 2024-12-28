from app.models import Nganh


def getNganh():
    nganhs = Nganh.query.filter(Nganh.ma_nganh > 0).all()  # Lọc các ngành có mã ngành > 0
    return [nganh.to_dict() for nganh in nganhs]  # Chuyển các đối tượng Nganh thành từ điển