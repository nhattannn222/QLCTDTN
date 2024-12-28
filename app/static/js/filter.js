// filter.js
import { renderPage } from './render.js';

// Hàm lọc dữ liệu minh chứng
export function filterMinhChung(data, ma_tieu_chuan, ma_tieu_chi) {
    if (!ma_tieu_chuan) {
        return;
    }

    let filteredData = data; // Bắt đầu từ dữ liệu gốc

    if (ma_tieu_chuan) {
        filteredData = filteredData.filter(tieuChuan => tieuChuan.ma_tieu_chuan == ma_tieu_chuan);
    }

    if (ma_tieu_chi) {
        filteredData = filteredData.map(tieuChuan => {
            return {
                ...tieuChuan,
                tieu_chis: tieuChuan.tieu_chis.filter(tieuChi => tieuChi.ma_tieu_chi == ma_tieu_chi)
            };
        }).filter(tieuChuan => tieuChuan.tieu_chis.length > 0);
    }
    
    document.getElementById('reset-filter-btn').style.display = 'inline-block';
    let currentPage = 1; // Reset về trang đầu tiên khi lọc
    renderPage(filteredData, currentPage, 1);
}

// Hàm reset lọc
export function resetFilter(data, currentPage) {
    document.getElementById('ma_tieu_chuan').value = "";
    document.getElementById('ma_tieu_chi').value = "";
    document.getElementById('ma_tieu_chi').style.display = 'none'; // Ẩn dropdown tiêu chí

    document.getElementById('reset-filter-btn').style.display = 'none';
    let filteredData = data; // Khôi phục dữ liệu gốc
    currentPage = 1; // Reset về trang đầu tiên
    renderPage(filteredData, currentPage, 1);
}
