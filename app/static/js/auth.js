// auth.js
let baseUrl = document.body.getAttribute('data-base-url');
if(baseUrl=="/") baseUrl=""
// Kiểm tra token
export function checkToken() {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (token) {
        const tokenValue = token.split('=')[1];
        return !!tokenValue; // Trả về true nếu token tồn tại
    }
    return false; // Trả về false nếu không có token
}

// login.js

export async function login(baseUrl, username, password) {
    const loginUrl = `${baseUrl}api/v1/login`;

    return fetch(loginUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tai_khoan: username, mat_khau: password }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === 200) {
                return { success: true, message: 'Đăng nhập thành công', data };
            } else {
                return { success: false, message: data.message };
            }
        })
        .catch((error) => {
            return { success: false, message: error.message };
        });
}

// Chuyển hướng đến trang đăng nhập
export function handleLogin() {
    window.location.href = `${baseUrl}login`;
}

// Đăng xuất
export function handleLogout() {
    // Xóa cookie "token"
    document.cookie = 'token=; max-age=0; path=/'; // max-age=0 sẽ làm cookie hết hạn ngay lập tức
    document.cookie = 'role=; max-age=0; path=/'; // max-age=0 sẽ làm cookie hết hạn ngay lập tức
    console.log("Cookie token đã bị xóa");

    // Cập nhật giao diện (ẩn nút Đăng nhập, hiển thị nút Đăng xuất)
    toggleLoginLogoutButtons();
    setTimeout(function() {
        location.reload(); // Làm mới trang sau 1 giây
        window.location.href = `${baseUrl}`;
    }, 1000);
}


// Điều chỉnh hiển thị nút đăng nhập/đăng xuất
export function toggleLoginLogoutButtons() {
    const isLoggedIn = checkToken();

    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    
    if (isLoggedIn) {
        loginButton.style.display = 'none'; // Ẩn nút đăng nhập
        logoutButton.style.display = 'block'; // Hiển thị nút đăng xuất
    } else {
        loginButton.style.display = 'block'; // Hiển thị nút đăng nhập
        logoutButton.style.display = 'none'; // Ẩn nút đăng xuất
        
    }
}
