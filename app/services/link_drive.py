import os
import logging
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.http import MediaIoBaseUpload
from googleapiclient.errors import HttpError
import io


# Phạm vi quyền truy cập
SCOPES = ['https://www.googleapis.com/auth/drive']

# Đường dẫn tới tệp token và credentials
TOKEN_PATH = os.path.join('app', 'secrets', 'token.json')
CREDENTIALS_PATH = os.path.join('app', 'secrets', 'credentials.json')

# Hàm xác thực và kết nối với Google Drive API
def authenticate_google_drive():
    creds = None
    # Kiểm tra nếu tệp token.json tồn tại
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)

    # Nếu không có token hoặc token không hợp lệ, thực hiện xác thực lại
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # Kiểm tra nếu tệp credentials.json tồn tại
            if not os.path.exists(CREDENTIALS_PATH):
                print(f"Không tìm thấy tệp credentials.json tại {CREDENTIALS_PATH}")
                return None

            # Xác thực mới nếu không có token hoặc token hết hạn
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
            creds = flow.run_local_server(port=0)

        # Lưu token mới vào tệp token.json
        with open(TOKEN_PATH, 'w') as token:
            token.write(creds.to_json())

    # Trả về dịch vụ Google Drive
    return build('drive', 'v3', credentials=creds)

def get_folder_id_by_name(service, folder_name, drive_id=None):
    query = f"name = '{folder_name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    
    # Thêm driveId nếu có (cho shared drive)
    if drive_id:
        query += f" and '{drive_id}' in parents"

    response = service.files().list(
        q=query,
        fields="files(id, name)",
        supportsAllDrives=True,  # Đảm bảo hỗ trợ tất cả shared drives
        includeItemsFromAllDrives=True,  # Bao gồm các tệp từ shared drives
        driveId=drive_id,  # Chỉ định driveId nếu là shared drive
    ).execute()

    files = response.get('files', [])
    if not files:
        print(f"Không tìm thấy thư mục với tên: {folder_name}")
        return None
    return files[0]['id']

# Hàm liệt kê tất cả tệp tin và thư mục trong thư mục Google Drive
def list_files_in_folder(service, folder_id):
    query = f"'{folder_id}' in parents and trashed = false"
    results = []
    page_token = None

    while True:
        response = service.files().list(
            q=query,
            fields="files(id, name, mimeType), nextPageToken",
            pageToken=page_token,
            includeItemsFromAllDrives=True,
            supportsAllDrives=True
        ).execute()

        files = response.get('files', [])
        for file in files:
            file_type = "Folder" if file["mimeType"] == "application/vnd.google-apps.folder" else "File"
            results.append({
                "id": file["id"],
                "name": file["name"],
                "type": file_type
            })

        page_token = response.get('nextPageToken')
        if not page_token:
            break

    return results


def get_mimetype(file_name):
    # Định nghĩa từ điển ánh xạ phần mở rộng tệp với MIME type
    mime_types = {
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.zip': 'application/zip',
        '.mp4': 'video/mp4',
        '.mp3': 'audio/mpeg',
        '.html': 'text/html',
        '.csv': 'text/csv',
        '.json': 'application/json',
        '.xml': 'application/xml',
        # Thêm các loại MIME type khác tùy theo yêu cầu
    }

    # Lấy phần mở rộng của tệp và chuyển thành chữ thường
    ext = os.path.splitext(file_name)[1].lower()

    # Trả về MIME type nếu có trong từ điển, nếu không trả về None
    return mime_types.get(ext, None)

def upload_file_to_drive(service, file_stream, file_name, folder_id):
    # Kiểm tra nếu file_stream là None
    if file_stream is None:
        print("Error: File stream is None.")
        return None

    # Đảm bảo con trỏ của file_stream ở vị trí đầu tệp
    file_stream.seek(0)

    # Không cần xác định MIME type, để Google Drive tự động nhận diện
    mimetype = get_mimetype(file_name)  # Để Google Drive tự động nhận diện MIME type

    # Tạo MediaIoBaseUpload để tải lên file từ bộ nhớ
    media = MediaIoBaseUpload(file_stream, mimetype=mimetype, resumable=True)

    # Tạo metadata cho file
    file_metadata = {
        'name': file_name,
        'parents': [folder_id],  # ID thư mục đích
    }
    
    try:
        # Gửi yêu cầu tải lên
        file = service.files().create(
            media_body=media,
            body=file_metadata,
            supportsAllDrives=True  # Đảm bảo hỗ trợ Shared Drive
        ).execute()
        
        print(f"File {file['name']} uploaded successfully to {folder_id}.")
        return file
    except Exception as e:
        logging.getLogger().exception(f"Error uploading file: {e}")
        return None


def create_folder_on_drive(service, folder_name, parent_folder_id=None):
    """
    Tạo một thư mục trên Google Drive.

    Args:
        service: Google Drive API service.
        folder_name: Tên thư mục cần tạo.
        parent_folder_id: ID của thư mục cha (nếu có).

    Returns:
        folder_id: ID của thư mục vừa tạo hoặc đã tồn tại.
    """
    try:
        # 📌 Kiểm tra xem thư mục đã tồn tại chưa
        query = f"name = '{folder_name}' and mimeType = 'application/vnd.google-apps.folder'"
        if parent_folder_id:
            query += f" and '{parent_folder_id}' in parents"
        
        existing_folders = service.files().list(q=query, fields="files(id, name)").execute()
        
        if existing_folders.get("files"):
            folder_id = existing_folders["files"][0]["id"]
            print(f"📂 Thư mục '{folder_name}' đã tồn tại với ID: {folder_id}")
            return folder_id

        # 📂 Nếu chưa có, tạo thư mục mới
        file_metadata = {
            "name": folder_name,
            "mimeType": "application/vnd.google-apps.folder",
        }
        if parent_folder_id:
            file_metadata["parents"] = [parent_folder_id]

        folder = service.files().create(
            body=file_metadata,
            fields="id",
            supportsAllDrives=True  # Hỗ trợ Shared Drive
        ).execute()

        folder_id = folder.get("id")
        print(f"✅ Thư mục '{folder_name}' đã được tạo với ID: {folder_id}")
        return folder_id

    except HttpError as error:
        print(f"❌ Lỗi khi tạo thư mục trên Google Drive: {error}")
        return None


def delete_file_or_folder(service, file_id):
    """
    Xóa file hoặc thư mục trên Google Drive (có kiểm tra tồn tại trước khi xóa).

    Args:
        service: Google Drive API service.
        file_id: ID của file hoặc thư mục cần xóa.

    Returns:
        dict: Kết quả xóa (thành công hoặc thất bại).
    """
    try:
        # 📌 Kiểm tra file có tồn tại không
        file_metadata = service.files().get(
            fileId=file_id, fields="id, name, trashed", supportsAllDrives=True
        ).execute()

        print(f"📂 Đang di chuyển vào Thùng rác: {file_metadata['name']} (ID: {file_id})...")

        # 🗑️ Di chuyển file vào Thùng rác
        service.files().update(
            fileId=file_id,
            body={"trashed": True},  # Chuyển trạng thái thành "đã xóa"
            supportsAllDrives=True,
        ).execute()

        print(f"✅ Đã chuyển vào Thùng rác: {file_metadata['name']} (ID: {file_id})")
        return {"success": True, "message": f"Đã chuyển {file_metadata['name']} vào Thùng rác!"}

    except HttpError as error:
        if error.resp.status == 404:
            print(f"❌ File không tồn tại hoặc đã bị xóa (ID: {file_id}).")
            return {"success": False, "message": "File không tồn tại hoặc đã bị xóa."}
        elif error.resp.status == 403:
            print(f"🚫 Không có quyền di chuyển file vào Thùng rác (ID: {file_id}).")
            return {"success": False, "message": "Không có quyền di chuyển file vào Thùng rác."}
        else:
            print(f"❌ Lỗi khi di chuyển file vào Thùng rác: {error}")
            return {"success": False, "message": f"Lỗi: {error}"}