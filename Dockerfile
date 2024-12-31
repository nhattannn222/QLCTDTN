# Sử dụng Python base image
FROM python:3.9-slim

# Thiết lập thư mục làm việc bên trong container
WORKDIR /app

# Sao chép file requirements.txt vào container
COPY requirements.txt .

# Cài đặt các thư viện cần thiết với timeout và sử dụng mirror để tránh timeout
RUN pip install --no-cache-dir --timeout=120 -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt

# Sao chép toàn bộ mã nguồn vào container
COPY . .
# Expose port 3005
EXPOSE 3005

# Lệnh chạy ứng dụng
CMD ["python", "run.py"]
