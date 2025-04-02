from flask import Blueprint, jsonify
from app.services.tieu_chuan_service import get_tieu_chuan_service
from app.services.tieu_chi_service import get_tieu_chi_service
from app.services.minh_chung_service import get_minh_chung_service
from app.middlewares.authorize import authorize

fetch_data = Blueprint('fetch_data', __name__)

@fetch_data.route('/api/v1/tieu_chuan/<int:ma_nganh>', methods=['GET'])
@authorize
def get_tieu_chuan(ma_nganh):
    try:
        data = get_tieu_chuan_service(ma_nganh)
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@fetch_data.route('/api/v1/tieu_chi/<int:ma_tieu_chuan>', methods=['GET'])
# @authorize
def get_tieu_chi(ma_tieu_chuan):
    try:
        data = get_tieu_chi_service(ma_tieu_chuan)
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@fetch_data.route('/api/v1/minh_chung/<string:ma_tieu_chi>', methods=['GET'])
@authorize
def get_minh_chung(ma_tieu_chi):
    try:
        data = get_minh_chung_service(ma_tieu_chi)
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
