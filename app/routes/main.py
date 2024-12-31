# app/routes/main.py
from flask import Blueprint, render_template, request
from app.services.data_service import fetch_tieu_chuan_data, getMaNganh
from config import Config
main_bp = Blueprint('main', __name__)

@main_bp.route('/', defaults={'index': None})
@main_bp.route('/<index>')
def index(index):
    token = request.cookies.get('token')  # Lấy token từ cookie
   
    if token:
        ma_nganh = getMaNganh(token)
        if ma_nganh == 0:
            data = fetch_tieu_chuan_data(index)
        else:
            data = fetch_tieu_chuan_data(ma_nganh)  # Truyền token vào hàm nếu cần
    else:
        data = fetch_tieu_chuan_data(index)
    return render_template('index.html', data=data, base_url=Config.BASE_URL)


@main_bp.route('/login')
def login():
    return render_template('login.html', base_url=Config.BASE_URL)

