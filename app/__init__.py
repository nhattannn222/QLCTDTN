from flask import Flask
from config import Config
from app.models import db
from app.routes.main import main_bp
from app.routes.auth import auth_bp
from app.routes.data import data_bp
from app.routes.fetch_data import fetch_data

def create_app():
    app = Flask(__name__, static_url_path='/static', static_folder='static')
    app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{Config.MYSQL_USER}:{Config.MYSQL_PASSWORD}@{Config.MYSQL_HOST}/{Config.MYSQL_DB}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Khởi tạo database
    db.init_app(app)

    # Đăng ký blueprint
    

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(data_bp)
    app.register_blueprint(fetch_data)
    
    return app
