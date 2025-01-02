import io
from flask import Blueprint, jsonify, request
from app.services.nganh import getNganh
from app.services.minh_chung_con import update_link
from app.middlewares.authorize import authorize
from googleapiclient.http import MediaIoBaseUpload
from app.services.link_drive import list_files_in_folder, authenticate_google_drive, get_folder_id_by_name, upload_file_to_drive

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
    # Lấy tên thư mục từ tham số URL
    folder_name = request.args.get('folder_name')
    if not folder_name:
        return jsonify({"error": "folder_name is required"}), 400

    # Xác thực và kết nối với Google Drive API
    service = authenticate_google_drive()
    if not service:
        return jsonify({"error": "Không thể xác thực với Google Drive API"}), 500

    # Tìm ID của thư mục dựa trên tên
    folder_id = get_folder_id_by_name(service, folder_name)
    if not folder_id:
        return jsonify({"error": "Không tìm thấy thư mục"}), 404

    # Lấy danh sách các tệp trong thư mục
    files = list_files_in_folder(service, folder_id)

    # Tạo URL của thư mục
    folder_url = f"https://drive.google.com/drive/folders/{folder_id}"

    # Trả về danh sách tệp và URL thư mục dưới dạng JSON
    file_list = [{"name": file['name'], "url": f"https://drive.google.com/file/d/{file['id']}"} for file in files]
    
    return jsonify({"folder_url": folder_url, "files": file_list})

@data_bp.route('/api/v1/upload_file', methods=['POST'])
def upload_file():
    folder_name = request.args.get('folder_name')
    if not folder_name:
        return jsonify({"error": "folder_name is required"}), 400

    if 'file' not in request.files:
        return jsonify({"error": "File is required"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Xác thực và kết nối với Google Drive API
    service = authenticate_google_drive()
    if not service:
        return jsonify({"error": "Cannot authenticate with Google Drive API"}), 500
    
    # Tìm ID của thư mục dựa trên tên
    folder_id = get_folder_id_by_name(service, folder_name)
    if not folder_id:
        return jsonify({"error": "Không tìm thấy thư mục"}), 404

    try:
        # Tạo một đối tượng BytesIO từ tệp
        file_stream = io.BytesIO(file.read())
        
        # Gọi hàm upload_file_to_drive để tải file lên
        uploaded_file = upload_file_to_drive(service, file_stream, file.filename, folder_id)
    
        if uploaded_file:
            return jsonify({"file_id": uploaded_file.get('id')})
        else:
            return jsonify({"error": "Error uploading file"}), 500

    except Exception as e:
        print(f"Lỗi khi xử lý tệp: {e}")
        return jsonify({"error": "Error processing file"}), 500