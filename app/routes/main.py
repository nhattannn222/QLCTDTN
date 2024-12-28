# app/routes/main.py
from flask import Blueprint, render_template
from app.services.data_service import fetch_tieu_chuan_data
from config import Config
main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def index():
    data = fetch_tieu_chuan_data()
    return render_template('index.html', data = data, base_url=Config.BASE_URL)

@main_bp.route('/login')
def login():
    return render_template('login.html', base_url=Config.BASE_URL)

