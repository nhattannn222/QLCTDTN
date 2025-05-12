# app/routes/main.py
from flask import Blueprint, render_template, request, redirect, url_for, send_from_directory, abort
from app.services.data_service import fetch_tieu_chuan_data, getMaNganh, get_bctdg, fetch_minh_chung_bo_sung
from config import Config
import os

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', '..', 'uploads', 'img')
main_bp = Blueprint('main', __name__)

@main_bp.route('/', defaults={'index': 1})
@main_bp.route('/<index>')
def index(index):
    token = request.cookies.get('token')  # Lấy token từ cookie

    try:
        index_int = int(index)
    except ValueError:
        abort(404)

    if token:
        ma_nganh = getMaNganh(token)
        
        # Nếu ma_nganh khác index, chuyển hướng về đúng ngành từ token
        if ma_nganh != 0 and ma_nganh != index_int:
            return redirect(url_for('main.index', index=ma_nganh))
        
        # Nếu ma_nganh == 0 thì cho phép xem theo index bất kỳ
        data = fetch_tieu_chuan_data(index_int if ma_nganh == 0 else ma_nganh)
    else:
        data = fetch_tieu_chuan_data(index_int)

    if not data:  # Nếu không có dữ liệu, trả về 404
        abort(404)

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

# Cấu hình Flask để phục vụ ảnh từ thư mục uploads/img
@main_bp.route('/uploads/img/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


@main_bp.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404