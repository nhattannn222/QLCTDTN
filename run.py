from app import create_app

# Tạo ứng dụng Flask từ hàm create_app trong app/__init__.py
app = create_app()

if __name__ == '__main__':
    # Chạy ứng dụng Flask với chế độ debug
    app.run(debug=True, host='0.0.0.0', port=3005)
