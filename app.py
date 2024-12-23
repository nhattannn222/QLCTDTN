import json
from flask import Flask, render_template
from config import Config
from models import db
from models.khoa import Khoa
from models.tieu_chuan import TieuChuan
from models.tieu_chi import TieuChi
from models.minh_chung import MinhChung
from models.minh_chung_con import MinhChungCon
from sqlalchemy.orm import joinedload

app = Flask(__name__, static_url_path='/static')  # Đường dẫn tĩnh

# Cấu hình kết nối MySQL
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{Config.MYSQL_USER}:{Config.MYSQL_PASSWORD}@{Config.MYSQL_HOST}/{Config.MYSQL_DB}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

@app.route('/')
def index():
    # Truy vấn dữ liệu từ database với các mối quan hệ
    tieu_chuans = TieuChuan.query.options(
        joinedload(TieuChuan.tieu_chis).joinedload(TieuChi.minh_chungs).joinedload(MinhChung.minh_chung_cons)
    ).all()

    # Chuyển dữ liệu sang format dễ render trong template
    data = []
    for tieu_chuan in tieu_chuans:
        tieu_chi_list = []
        for tieu_chi in tieu_chuan.tieu_chis:
            minh_chung_list = []
            for minh_chung in tieu_chi.minh_chungs:
                minh_chung_cons = [mc.to_dict() for mc in minh_chung.minh_chung_cons]
                minh_chung_list.append({
                    "so_thu_tu": minh_chung.so_thu_tu,
                    "ma_minh_chung": minh_chung.ma_minh_chung,
                    "minh_chung_cons": minh_chung_cons
                })
            tieu_chi_list.append({
                "ma_tieu_chi": tieu_chi.ma_tieu_chi,
                "mo_ta": tieu_chi.mo_ta,
                "minh_chungs": minh_chung_list
            })
        data.append({
            "ma_tieu_chuan": tieu_chuan.ma_tieu_chuan,
            "ten_tieu_chuan": tieu_chuan.ten_tieu_chuan,
            "tieu_chis": tieu_chi_list
        })
    print("data")
    # Truyền dữ liệu vào template
    return render_template('index.html', data=data)

if __name__ == '__main__':
    # Chạy Flask trên cổng 3005
    app.run(debug=True, host='0.0.0.0', port=3005)