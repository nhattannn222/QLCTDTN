import io
import os
import logging
from flask import Blueprint, jsonify, request
from app.services.nganh import getNganh
from app.services.minh_chung_con import update_link, updateMC, getMC, deleteMC, create_minh_chung_con_bs, create_minh_chung_con, create_minh_chung
from app.services.data_service import get_bctdg, updateURLbctdg
from app.middlewares.authorize import authorize
from googleapiclient.http import MediaIoBaseUpload
from app.services.link_drive import list_files_in_folder,create_folder_on_drive, authenticate_google_drive, get_folder_id_by_name, upload_file_to_drive, delete_file_or_folder

data_bp = Blueprint('data', __name__)

@data_bp.route('/api/v1/nganh')
def nganh():
    token = request.cookies.get('token')  # Lấy token từ cookie

    if token:
        # Nếu có token, gọi hàm fetch_tieu_chuan_data
        nganhs = getNganh(token)
    else:
        nganhs = getNganh()
    return jsonify({
            'status': 200,
            'data': nganhs
        }), 200  # Trả về mã trạng thái HTTP 200 (OK)

@data_bp.route('/api/v1/update_link/<int:minh_chung_con_id>', methods=['PUT'])
@authorize
def update_link_route(minh_chung_con_id):
    # Lấy dữ liệu từ request
    data = request.get_json()

    # Kiểm tra xem dữ liệu có hợp lệ không
    if not data or 'link' not in data:
        return jsonify({'status': 400, 'message': 'Link không hợp lệ'}), 400

    new_link = data['link']

    try:
        # Gọi service để cập nhật link
        updated_minh_chung_con = update_link(minh_chung_con_id, new_link)

        # Kiểm tra xem bản ghi có được cập nhật không
        if not updated_minh_chung_con:
            return jsonify({'status': 404, 'message': 'Không tìm thấy Minh Chứng Con để cập nhật'}), 404

        return jsonify({
            'status': 200,
            'message': 'Cập nhật link thành công',
            'data': updated_minh_chung_con.to_dict()  # Trả về dữ liệu đã cập nhật dưới dạng dict
        }), 200
    except Exception as e:
        # Trả về lỗi nếu có bất kỳ sự cố nào
        return jsonify({'status': 500, 'message': f'Lỗi server: {str(e)}'}), 500


@data_bp.route('/api/v1/get_links', methods=['GET'])
def get_files():
    # Lấy ID thư mục từ tham số URL
    folder_id = request.args.get('folder_id')
    if not folder_id:
        return jsonify({"error": "Không tìm thấy thư mục"}), 404

    # Xác thực Google Drive API
    service = authenticate_google_drive()
    if not service:
        return jsonify({"error": "Không thể xác thực với Google Drive API"}), 500

    # Lấy danh sách các mục (tệp + thư mục) trong thư mục
    items = list_files_in_folder(service, folder_id)

    # Tạo danh sách với URL phù hợp
    item_list = [
        {
            "name": item["name"],
            "type": item["type"],
            "url": f"https://drive.google.com/{'drive/folders' if item['type'] == 'Folder' else 'file/d'}/{item['id']}"
        }
        for item in items
    ]

    # URL thư mục chính
    folder_url = f"https://drive.google.com/drive/folders/{folder_id}"

    return jsonify({"folder_url": folder_url, "items": item_list})

@data_bp.route('/api/v1/upload_file', methods=['POST'])
@authorize
def upload_file():
    parent_folder_id = request.args.get('folder_id')  # ID thư mục cha

    if not parent_folder_id:
        return jsonify({"error": "Không tìm thấy thư mục"}), 404

    # Kiểm tra xem có tệp nào được tải lên không
    if 'file' not in request.files:
        return jsonify({"error": "File is required"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    file_name = os.path.basename(file.filename)  # Lấy tên file mà không có thư mục

    # Xác thực Google Drive API
    service = authenticate_google_drive()
    if not service:
        return jsonify({"error": "Cannot authenticate with Google Drive API"}), 500

    try:
        # 📂 Nếu file là thư mục, tạo thư mục mới trên Drive
        if file.content_type == 'application/x-directory':  # Giả định để kiểm tra thư mục
            new_folder_id = create_folder_on_drive(service, file_name, parent_folder_id)
            if not new_folder_id:
                return jsonify({"error": "Không thể tạo thư mục trên Drive"}), 500
            return jsonify({"folder_id": new_folder_id}), 200

        else:
            # 📂 Tạo file stream để upload
            file_stream = io.BytesIO(file.read())

            # 🆙 Tải file lên Drive trong thư mục cha
            uploaded_file = upload_file_to_drive(service, file_stream, file_name, parent_folder_id)

            if uploaded_file:
                return jsonify({"file_id": uploaded_file.get('id')}), 200
            else:
                return jsonify({"error": "Error uploading file"}), 500

    except Exception as e:
        print(f"❌ Lỗi khi xử lý tệp: {e}")
        return jsonify({"error": "Error processing file"}), 500


@data_bp.route('/api/v1/bc_tdg', methods=['GET'])
def get_bc_tdg():
    """
    API endpoint để lấy danh sách các bản ghi từ bảng BCTDG.
    """
    return get_bctdg() 

@data_bp.route('/api/v1/bc_tdg/<ma_bc_tdg>', methods=['PUT'])
@authorize
def update_url(ma_bc_tdg):
    try:
        # Lấy dữ liệu từ body của yêu cầu
        data = request.get_json()

        # Gọi hàm service để cập nhật URL
        result, status_code = updateURLbctdg(ma_bc_tdg, data)

        # Trả về kết quả
        return jsonify(result), status_code

    except Exception as e:
        # Xử lý lỗi và trả về thông báo lỗi
        return jsonify({"error": str(e)}), 500
    


@data_bp.route('/api/v1/upload_bctdg', methods=['POST'])
@authorize
def upload_bctdg():
    folder_id = request.args.get('folder_id')
    if not folder_id:
        return jsonify({"error": "folder_id is required"}), 400

    if 'file' not in request.files:
        return jsonify({"error": "Files are required"}), 400

    files = request.files.getlist('file')
    if not files or all(file.filename == '' for file in files):
        return jsonify({"error": "No selected files"}), 400

    # Xác thực và kết nối với Google Drive API
    service = authenticate_google_drive()
    if not service:
        return jsonify({"error": "Cannot authenticate with Google Drive API"}), 500


    uploaded_files = []
    try:
        for file in files:
            # Tạo một đối tượng BytesIO từ tệp
            file_stream = io.BytesIO(file.read())
            
            # Gọi hàm upload_file_to_drive để tải file lên
            uploaded_file = upload_file_to_drive(service, file_stream, file.filename, folder_id)
            if uploaded_file:
                uploaded_files.append({
                    "file_name": file.filename,
                    "file_id": uploaded_file.get('id')
                })
            else:
                return jsonify({"error": f"Error uploading file {file.filename}"}), 500

        return jsonify({"uploaded_files": uploaded_files})

    except Exception as e:
        print(f"Lỗi khi xử lý tệp: {e}")
        return jsonify({"error": "Error processing files"}), 500

@data_bp.route("/api/v1/create_folder", methods=["POST"])
@authorize
def create_folder():
    data = request.json
    parent_id = data.get("parent_folder_id")
    folder_name = data.get("folder_name")

    if not folder_name:
        return jsonify({"error": "Folder name is required!"}), 400
    service = authenticate_google_drive()
    if not service:
        return jsonify({"error": "Không thể xác thực với Google Drive API"}), 500


    folder_id = create_folder_on_drive(service,folder_name, parent_id)
    return jsonify({"folder_id": folder_id})


@data_bp.route("/api/v1/delete_file", methods=["POST"])
@authorize
def delete_file():
    """API Xóa file theo ID."""
    data = request.get_json()
    file_id = data.get("file_id")

    if not file_id:
        return jsonify({"error": False, "message": "Thiếu file_id."}), 400

    service = authenticate_google_drive()
    result = delete_file_or_folder(service, file_id)

    return jsonify(result)


@data_bp.route("/api/v1/delete_folder", methods=["POST"])
@authorize
def delete_folder():
    """API Xóa thư mục theo ID."""
    data = request.get_json()
    folder_id = data.get("folder_id")

    if not folder_id:
        return jsonify({"success": False, "message": "Thiếu folder_id."}), 400

    service = authenticate_google_drive()
    result = delete_file_or_folder(service, folder_id)

    return jsonify(result)

@data_bp.route('/api/v1/minh_chung_con/<int:ma_minh_chung_con>', methods=['GET'])
def get_minh_chung_con(ma_minh_chung_con):
    try:
        data = getMC(ma_minh_chung_con)
        return jsonify({'status': 200, 'message': 'Lấy thông tin thành công', 'data': data}), 200
    except Exception as e:
        return jsonify({'status': 500, 'message': f'Lỗi server: {str(e)}'}), 500

@data_bp.route('/api/v1/minh_chung_con', methods=['POST'])
@authorize
def create_minh_chung_con_route():
    try:
        data = request.json
        ma_minh_chung = data.get("ma_minh_chung")
        ten_minh_chung = data.get("ten_minh_chung")
        so_minh_chung = data.get("so_minh_chung")
        noi_ban_hanh = data.get("noi_ban_hanh")
        ngay_ban_hanh = data.get("ngay_ban_hanh")

        # Kiểm tra thông tin bắt buộc
        if not ma_minh_chung or not ten_minh_chung or not so_minh_chung or not noi_ban_hanh or not ngay_ban_hanh:
            return jsonify({"message": "Thiếu thông tin bắt buộc!"}), 400

        # Gọi service xử lý
        response = create_minh_chung_con(
            ma_minh_chung,
            ten_minh_chung, 
            so_minh_chung, 
            noi_ban_hanh, 
            ngay_ban_hanh
        )
        

        return jsonify({'status': 200, 'message': 'Lấy thông tin thành công', 'data': response}), 200
    except Exception as e:
        return jsonify({"message": "Lỗi hệ thống!", "error": str(e)}), 500

@data_bp.route('/api/v1/minh_chung_con_bs', methods=['POST'])
@authorize
def create_minh_chung_con_bs_route():
    try:
        data = request.json
        ma_minh_chung = data.get("ma_minh_chung")
        so_thu_tu = data.get("so_thu_tu")
        ma_tieu_chi = data.get("ma_tieu_chi")
        ten_minh_chung = data.get("ten_minh_chung")
        so_minh_chung = data.get("so_minh_chung")
        noi_ban_hanh = data.get("noi_ban_hanh")
        url = data.get("url")
        ngay_ban_hanh = data.get("ngay_ban_hanh")

        # Kiểm tra thông tin bắt buộc
        if not ten_minh_chung or not ma_tieu_chi:
            return jsonify({"message": "Thiếu thông tin bắt buộc!"}), 400

        # Gọi service xử lý
        response = create_minh_chung_con_bs(
            ma_minh_chung,
            so_thu_tu, 
            ma_tieu_chi, 
            ten_minh_chung, 
            url, 
            so_minh_chung, 
            noi_ban_hanh, 
            ngay_ban_hanh
        )
        

        return jsonify({'status': 200, 'message': 'Lấy thông tin thành công', 'data': response}), 200
    except Exception as e:
        return jsonify({"message": "Lỗi hệ thống!", "error": str(e)}), 500
    
@data_bp.route('/api/v1/minh_chung_con/<int:ma_minh_chung_con>', methods=['PUT'])
@authorize
def update_MC(ma_minh_chung_con):
    # Lấy dữ liệu từ request
    data = request.get_json()

    ma_minh_chung_con = ma_minh_chung_con
    ten_minh_chung = data['ten_minh_chung']
    so_minh_chung = data['so_minh_chung'] 
    ngay_ban_hanh = data['ngay_ban_hanh']
    noi_ban_hanh = data['noi_ban_hanh']
    url_hop_minh_chung = data['url_hop_minh_chung']


    # Kiểm tra xem dữ liệu có hợp lệ không
    if not data or not ten_minh_chung or not noi_ban_hanh or not noi_ban_hanh:
        return jsonify({'status': 400, 'message': 'Thiếu thông tin cần thiết!'}), 400

    try:
        # Gọi service để cập nhật link
        updated_minh_chung_con = updateMC(ma_minh_chung_con, ten_minh_chung,so_minh_chung, ngay_ban_hanh, noi_ban_hanh, url_hop_minh_chung)

        # Kiểm tra xem bản ghi có được cập nhật không
        if not updated_minh_chung_con:
            return jsonify({'status': 404, 'message': 'Không tìm thấy Minh Chứng Con để cập nhật'}), 404

        return jsonify({
            'status': 200,
            'message': 'Cập nhật minh chứng thành công',
            'data': updated_minh_chung_con.to_dict()  # Trả về dữ liệu đã cập nhật dưới dạng dict
        }), 200
    except Exception as e:
        # Trả về lỗi nếu có bất kỳ sự cố nào
        return jsonify({'status': 500, 'message': f'Lỗi server: {str(e)}'}), 500   
    
@data_bp.route('/api/v1/minh_chung_con/<int:ma_minh_chung_con>', methods=['POST'])
@authorize
def delete_minh_chung_con(ma_minh_chung_con):
    try:
        # Gọi service để xóa minh chứng
        result = deleteMC(ma_minh_chung_con)

        if result:
            return jsonify({'status': 200, 'message': 'Xóa thành công'}), 200
        else:
            return jsonify({'status': 404, 'message': 'Không tìm thấy minh chứng'}), 404
    except Exception as e:
        return jsonify({'status': 500, 'message': f'Lỗi server: {str(e)}'}), 500
    
    
@data_bp.route('/api/v1/minh_chung', methods=['POST'])
def create_minh_chung_route():
    try:
        data = request.json
        ma_minh_chung = data.get("ma_minh_chung")
        so_thu_tu = data.get("so_thu_tu")
        ma_tieu_chi = data.get("ma_tieu_chi")
        url = data.get("url")

        # Kiểm tra thông tin bắt buộc
        if not ma_minh_chung or not so_thu_tu or not ma_tieu_chi:
            return jsonify({"message": "Thiếu thông tin bắt buộc!"}), 400

        # Gọi service xử lý
        response = create_minh_chung(
            ma_minh_chung,
            so_thu_tu, 
            ma_tieu_chi, 
            url
        )
        return jsonify({'status': 200, 'message': 'Lấy thông tin thành công', 'data': response}), 200
    except Exception as e:
        return jsonify({"message": "Lỗi hệ thống!", "error": str(e)}), 500
