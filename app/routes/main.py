# app/routes/main.py
from flask import Blueprint, render_template, request
from app.services.data_service import fetch_tieu_chuan_data, getMaNganh, get_bctdg, fetch_minh_chung_bo_sung
from config import Config
main_bp = Blueprint('main', __name__)

@main_bp.route('/', defaults={'index': 1})
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


@main_bp.route('/bctdg')
def bctdg():
    token = request.cookies.get('token')  # Lấy token từ cookie
   
    if token:
        ma_nganh = getMaNganh(token)
        if ma_nganh == 0:
            data = get_bctdg()
        else:
            data = get_bctdg()  # Truyền token vào hàm nếu cần
    else:
        data = get_bctdg()
    return render_template('bctdg.html',data=data, base_url=Config.BASE_URL)


@main_bp.route('/', defaults={'index': 1})
@main_bp.route('/mcbs/<index>')
def mcbs(index):
    token = request.cookies.get('token')  # Lấy token từ cookie
   
    if token:
        ma_nganh = getMaNganh(token)
        if ma_nganh == 0:
            data = fetch_minh_chung_bo_sung(index)
        else:
            data = fetch_minh_chung_bo_sung(ma_nganh)  # Truyền token vào hàm nếu cần
    else:
        data = fetch_minh_chung_bo_sung(index)
    return render_template('mcbs.html', data=data, base_url=Config.BASE_URL)
