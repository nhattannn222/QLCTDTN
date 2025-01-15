// Hàm để điền các giá trị vào dropdown "ma_tieu_chuan"

export function populateDropdown(data) {
    const select = document.getElementById('ma_tieu_chuan');
    const uniqueMaTieuChuan = [...new Set(data.map(item => item.ma_tieu_chuan))];  // Lấy danh sách các mã tiêu chuẩn duy nhất
    let current = 1

    // Thêm các option vào select
    uniqueMaTieuChuan.forEach(maTieuChuan => {
        const option = document.createElement('option');
        option.value = maTieuChuan;
        option.textContent = current;
        select.appendChild(option);
        current++;
    });
}

// Hàm để điền các giá trị vào dropdown "ma_tieu_chi" dựa trên ma_tieu_chuan đã chọn
export function populateDropdownTieuChi(data, maTieuChuan) {
    const tieuChiDropdown = document.getElementById('ma_tieu_chi');
    tieuChiDropdown.innerHTML = '<option value="">-- Chọn tiêu chí --</option>'; // Reset dropdown

    if (!maTieuChuan) {
        tieuChiDropdown.style.display = 'none'; // Ẩn dropdown nếu không có tiêu chuẩn
        return;
    }

    // Lọc dữ liệu tieu_chis dựa trên maTieuChuan
    const selectedTieuChuan = data.find(tieuChuan => tieuChuan.ma_tieu_chuan == maTieuChuan);
    if (selectedTieuChuan && Array.isArray(selectedTieuChuan.tieu_chis)) {
        selectedTieuChuan.tieu_chis.forEach(tieuChi => {
            const option = document.createElement('option');
            option.value = tieuChi.ma_tieu_chi;
            option.textContent = tieuChi.ma_tieu_chi;
            tieuChiDropdown.appendChild(option);
        });
    }

    tieuChiDropdown.style.display = 'inline-block'; // Hiển thị dropdown tiêu chí
}
