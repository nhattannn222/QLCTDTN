from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Import tất cả các models
from .khoa import Khoa
from .tieu_chuan import TieuChuan
from .tieu_chi import TieuChi
from .minh_chung import MinhChung
from .minh_chung_con import MinhChungCon
