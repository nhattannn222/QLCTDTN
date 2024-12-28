// Hàm chỉnh sửa link

const baseUrl = document.body.getAttribute('data-base-url');

export function editLink(button) {
    const tdSoMinhChung = button.closest('tr').querySelector('.so_minh_chung'); // Lấy phần tử <td> chứa so_minh_chung
    const linkText = button.closest('td').previousElementSibling.querySelector('.link-text'); // Lấy phần tử hiển thị link
    const input = button.closest('td').previousElementSibling.querySelector('.link'); // Lấy input chứa giá trị link
    const saveButton = button.closest('td').querySelector('.btn-save'); // Lấy nút save
    const row = button.closest('tr'); // Lấy dòng <tr> chứa nút edit

    // Lấy giá trị so_minh_chung từ td
    const soMinhChung = tdSoMinhChung.textContent.trim(); // Lấy và trim giá trị so_minh_chung
    
    // Hiển thị input và nút lưu, ẩn link và nút chỉnh sửa
    linkText.style.display = 'none';
    input.style.display = 'inline-block';
    saveButton.style.display = 'inline-block';
    button.style.display = 'none';

    // Đặt giá trị hiện tại của link vào input để chỉnh sửa
    input.value = linkText.querySelector('a') ? linkText.querySelector('a').href : ''; // Lấy giá trị của link nếu có

    // Gắn giá trị so_minh_chung vào input hoặc thực hiện xử lý gì đó
    input.setAttribute('data-so-minh-chung', soMinhChung); // Gắn giá trị so_minh_chung vào input để gửi sau khi lưu
}

// Hàm lưu link
export function saveLink(button) {
    const td = button.closest('td').previousElementSibling; // Lấy <td> chứa link
    const linkText = td.querySelector('.link-text'); // Lấy phần tử hiển thị link
    const input = td.querySelector('.link'); // Lấy input chứa giá trị link
    const editButton = button.closest('td').querySelector('.btn-edit'); // Lấy nút chỉnh sửa

    // Lấy giá trị so_minh_chung từ data-so-minh-chung (gắn vào input khi chỉnh sửa)
    const soMinhChung = input.getAttribute('data-so-minh-chung'); // Lấy giá trị so_minh_chung từ input

    // Kiểm tra giá trị nhập vào có phải là URL hợp lệ
    const newLink = input.value.trim();
    if (!isValidURL(newLink)) {
        alert('Vui lòng nhập một đường dẫn hợp lệ.');
        return;
    }

    // Cập nhật nội dung hiển thị
    linkText.innerHTML = newLink
        ? `<a href="${newLink}" target="_blank" class="btn">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>`
        : ''; // Nếu không có link, ẩn phần tử hiển thị

    // Hiển thị lại link và nút chỉnh sửa, ẩn input và nút lưu
    input.style.display = 'none';
    button.style.display = 'none';
    editButton.style.display = 'inline-block';
    linkText.style.display = 'inline-block';

    // Lấy token từ cookie
    const token = getCookie('token'); // Đảm bảo cookie có tên là 'token'

    // Kiểm tra nếu token không có
    if (!token) {
        alert('Bạn chưa đăng nhập hoặc token không hợp lệ.');
        return;
    }

    // Gửi yêu cầu PUT tới API để cập nhật link
    const url = `${baseUrl}/api/v1/update_link/${soMinhChung}`;
    const data = { link: newLink };

    // Gửi yêu cầu PUT bằng fetch
    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Sử dụng token từ cookie
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status == 200) {
            alert('Cập nhật link thành công.');
        } else {
            alert('Có lỗi xảy ra khi cập nhật link.');
        }
    })
    .catch(error => {
        console.error('Error updating link:', error);
        alert('Có lỗi xảy ra khi cập nhật link.');
    });
}

// Hàm kiểm tra URL hợp lệ
export function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

// Hàm lấy giá trị của cookie theo tên
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}