// filter.js
import { renderPage } from "./render.js";

// Hàm lọc dữ liệu minh chứng
export function filterMinhChung(data, ma_tieu_chuan, ma_tieu_chi) {
  if (!ma_tieu_chuan) {
    return;
  }

  let filteredData = data; // Bắt đầu từ dữ liệu gốc

  if (ma_tieu_chuan) {
    filteredData = filteredData.filter(
      (tieuChuan) => tieuChuan.ma_tieu_chuan == ma_tieu_chuan
    );
  }

  if (ma_tieu_chi) {
    filteredData = filteredData
      .map((tieuChuan) => {
        return {
          ...tieuChuan,
          tieu_chis: tieuChuan.tieu_chis.filter(
            (tieuChi) => tieuChi.ma_tieu_chi == ma_tieu_chi
          ),
        };
      })
      .filter((tieuChuan) => tieuChuan.tieu_chis.length > 0);
  }

  document.getElementById("reset-filter-btn").style.display = "inline-block";
  let currentPage = 1; // Reset về trang đầu tiên khi lọc
  renderPage(filteredData, currentPage, 1);
}

export function filterByLink(data, filterStatus) {
  // Check if a filter status is provided
  if (filterStatus) {
    // Filter data based on link status
    let filteredData = data
      .map((item) => {
        // Filter tieu_chis inside the item
        let filteredTieuChis = item.tieu_chis.map((tieuChi) => {
          // Filter minh_chungs inside tieuChi
          let filteredMinhChungs = tieuChi.minh_chungs.map((minhChung) => {
            // Filter minh_chung_cons inside minhChung
            let filteredMinhChungCons = minhChung.minh_chung_cons.filter(
              (minhChungCon) => {
                if (filterStatus === "da_gan_link") {
                  return minhChungCon.link && minhChungCon.link.trim() !== ""; // Link has content
                } else if (filterStatus === "chua_gan_link") {
                  return !minhChungCon.link || minhChungCon.link.trim() === ""; // Link is empty
                }
                return false; // If no valid filter status, return false
              }
            );

            return { ...minhChung, minh_chung_cons: filteredMinhChungCons };
          });

          // Return tieuChi with filtered minhChungs
          return { ...tieuChi, minh_chungs: filteredMinhChungs };
        });

        // Return item with filtered tieuChis
        return { ...item, tieu_chis: filteredTieuChis };
      })
      .filter((item) => {
        // Remove item if no valid minh_chung_con after filtering
        return item.tieu_chis.some((tieuChi) =>
          tieuChi.minh_chungs.some(
            (minhChung) => minhChung.minh_chung_cons.length > 0
          )
        );
      });

    let currentPage = 1;

    // Render filtered data
    renderPage(filteredData, currentPage, 1);
    const resetFilterBtn = document.getElementById("reset-filter-btn");
    if (resetFilterBtn) {
      resetFilterBtn.style.display = "inline-block";
    }
  } else {
    // If no filter is selected, show all data
    renderPage(data);

    // Hide reset filter button if no filter is applied
    const resetFilterBtn = document.getElementById("reset-filter-btn");
    if (resetFilterBtn) {
      resetFilterBtn.style.display = "none";
    }
  }
}
export function resetFilter(data, currentPage) {
    // Reset dropdowns
    document.getElementById("ma_tieu_chuan").value = "";
    document.getElementById("ma_tieu_chi").value = "";
    document.getElementById("ma_tieu_chi").style.display = "none"; // Ẩn dropdown tiêu chí
  
    // Reset radio buttons
    const radioButtons = document.querySelectorAll('input[name="link_status"]');
    radioButtons.forEach(radio => {
      radio.checked = false; // Uncheck all radio buttons
    });
  
    // Hide reset filter button
    document.getElementById("reset-filter-btn").style.display = "none";
  
    // Restore original data
    let filteredData = data; // Khôi phục dữ liệu gốc
    currentPage = 1; // Reset về trang đầu tiên
  
    // Render the data again
    renderPage(filteredData, currentPage, 1);
  }
  