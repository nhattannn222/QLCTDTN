// render.js
const baseUrl = document.body.getAttribute("data-base-url");
import { editLink } from "./link_management.js";
import { editMC } from "./minhchung.js";

// Hàm renderPage
export function renderPage(data, currentPage, itemsPerPage) {
  const container = document.querySelector("#tables-container");
  const pagination = document.querySelector("#pagination");
  container.innerHTML = ""; // Xóa nội dung hiện tại
  pagination.innerHTML = ""; // Xóa các nút phân trang hiện tại

  // Tính toán dữ liệu cho trang hiện tại
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = data.slice(startIndex, endIndex);

  // Hiển thị các tiêu chuẩn trong trang hiện tại
  currentItems.forEach((item) => {
    renderTables([item]); // Gọi hàm renderTables cho từng item
  });

  // Hiển thị nút phân trang
  renderPagination(data, currentPage, itemsPerPage);

  window.scrollTo(0, 0); // Cuộn lên đầu trang
}

// Hàm renderPagination
export function renderPagination(data, currentPage, itemsPerPage) {
  const pagination = document.querySelector("#pagination");
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Nút Previous
  const prevButton = document.createElement("button");
  prevButton.textContent = "Trước";
  prevButton.disabled = currentPage === 1; // Vô hiệu hóa nếu đang ở trang đầu
  prevButton.addEventListener("click", () => {
    currentPage--;
    renderPage(data, currentPage, itemsPerPage);
    attachEditSaveEvents();
    attachEditMCSaveEvents();
  });
  pagination.appendChild(prevButton);

  // Nút số trang
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    pageButton.classList.toggle("active", i === currentPage); // Đánh dấu trang hiện tại
    pageButton.addEventListener("click", () => {
      currentPage = i;

      renderPage(data, currentPage, itemsPerPage);
      attachEditSaveEvents();
      attachEditMCSaveEvents();
    });
    pagination.appendChild(pageButton);
  }

  // Nút Next
  const nextButton = document.createElement("button");
  nextButton.textContent = "Sau";
  nextButton.disabled = currentPage === totalPages; // Vô hiệu hóa nếu đang ở trang cuối
  nextButton.addEventListener("click", () => {
    currentPage++;
    renderPage(data, currentPage, itemsPerPage);
    attachEditSaveEvents();
    attachEditMCSaveEvents();
  });
  pagination.appendChild(nextButton);
}

// Hàm renderTables
export function renderTables(data) {
  const userRole = document.cookie
    .split("; ")
    .find((row) => row.startsWith("role="))
    ?.split("=")[1];
  const container = document.querySelector("#tables-container");
  data.forEach((tieuChuan) => {
    const table = document.createElement("table");
    table.classList.add("table", "table-bordered", "table-striped");

    // Dòng tiêu đề của bảng (các cột)
    const titleRow = document.createElement("tr");
    checkToken()
      ? (titleRow.innerHTML = `
                <th>Tiêu chí</th>
                <th>Số TT</th>
                <th>Mã minh chứng</th>
                <th>Minh chứng con</th>
                <th>Tên minh chứng</th>
                <th>Số, ngày ban hành, hoặc thời điểm khảo sát, điều tra, phỏng vấn, quan sát,…</th>
                <th>Nơi ban hành hoặc nhóm, cá nhân thực hiện</th>
                <th>Link</th>
                <th>Sửa link</th>
                ${userRole === "admin" ? "<th>Sửa</th>" : ""}`)
      : (titleRow.innerHTML = `
                <th>Tiêu chí</th>
                <th>Số TT</th>
                <th>Mã minh chứng</th>
                <th>Minh chứng con</th>
                <th>Tên minh chứng</th>
                <th>Số, ngày ban hành, hoặc thời điểm khảo sát, điều tra, phỏng vấn, quan sát,…</th>
                <th>Nơi ban hành hoặc nhóm, cá nhân thực hiện</th>
                <th>Link</th>
            `);
    table.appendChild(titleRow);

    // Dòng hiển thị tiêu chuẩn (title)
    const headerRow = document.createElement("tr");
    const headerCell = document.createElement("td");
    headerCell.setAttribute(
      "colspan",
      checkToken() ? (userRole === "admin" ? "10" : "9") : "8"
    );
    headerCell.textContent = tieuChuan.ten_tieu_chuan; // Hiển thị tiêu đề từ JSON
    headerCell.style.fontSize = "18px";
    headerCell.style.fontWeight = "bold";
    headerRow.appendChild(headerCell);
    table.appendChild(headerRow);

    // Kiểm tra nếu tieuChis tồn tại và là mảng
    if (Array.isArray(tieuChuan.tieu_chis)) {
      tieuChuan.tieu_chis.forEach((tieuChi) => {
        const tieuChiRow = document.createElement("tr");
        const totalRowspan =
          tieuChi.minh_chungs?.reduce((total, item) => {
            return (
              total + (item.minh_chung_cons ? item.minh_chung_cons.length : 1)
            );
          }, 1) || 1;

        const tieuChiCell = document.createElement("td");
        tieuChiCell.setAttribute("rowspan", totalRowspan);
        tieuChiCell.textContent = tieuChi.ma_tieu_chi;
        tieuChiCell.classList.add("criteria");
        tieuChiRow.appendChild(tieuChiCell);

        const moTaCell = document.createElement("td");
        moTaCell.setAttribute("colspan", userRole === "admin" ? "9" : "8");
        moTaCell.textContent = tieuChi.mo_ta;
        moTaCell.style.textAlign = "left";
        moTaCell.style.fontSize = "16px";
        tieuChiRow.appendChild(moTaCell);
        table.appendChild(tieuChiRow);

        // Kiểm tra nếu minhChungs tồn tại và là mảng
        if (Array.isArray(tieuChi.minh_chungs)) {
          tieuChi.minh_chungs.forEach((minhChung) => {
            if (minhChung.minh_chung_cons) {
              minhChung.minh_chung_cons.forEach((minhChungCon, index) => {
                const minhChungConRow = document.createElement("tr");
                if (index === 0) {
                  const sttCell = document.createElement("td");
                  const minhChungConCodeCell = document.createElement("td");
                  sttCell.style.width = "50px"; // Giảm chiều rộng cho ô STT
                  minhChungConCodeCell.style.width = "100px"; // Giảm chiều rộng cho ô mã minh chứng
                  sttCell.rowSpan = minhChung.minh_chung_cons.length;
                  minhChungConCodeCell.rowSpan =
                    minhChung.minh_chung_cons.length;
                  sttCell.textContent = minhChung.so_thu_tu;
                  minhChungConCodeCell.textContent = minhChung.ma_minh_chung;
                  minhChungConRow.appendChild(sttCell);
                  minhChungConRow.appendChild(minhChungConCodeCell);
                }
                let rowHTML = "";

                if (checkToken()) {
                  rowHTML = `
    <tr>
        <span class="ma_minh_chung_data" style="display: none;">${
          minhChung.ma_minh_chung
        }</span>
        <span class="folderUrl" style="display: none;">${minhChung.url}</span>
        <span class="ma_minh_chung_con" style="display: none;">${
          minhChungCon.ma_minh_chung_con
        }</span>
        <td class="so_minh_chung">${minhChungCon.so_minh_chung}</td>
        <td style="font-size: 12px; text-align: start;">${
          minhChungCon.ten_minh_chung
        }</td>
        <td style="width: 150px;">${minhChungCon.ngay_ban_hanh}</td>
        <td style="font-size: 12px;">${minhChungCon.noi_ban_hanh}</td>
        <td style="width: 170px; text-align: center;">
            <span class="link-text">
                ${
                  minhChungCon.link
                    ? `<a href="${minhChungCon.link}" target="_blank" class="btn">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i>
                      </a>`
                    : ""
                }
            </span>
            <input type="text" value="${
              minhChungCon.link || ""
            }" class="link" style="display: none;" />
        </td>
        <td>
            <button class="btn-edit" style="margin-left: 5px;">
                <i class="fa-solid fa-pen"></i> <!-- Biểu tượng bút -->
            </button>
        </td>
  `;

                  if (userRole === "admin") {
                    rowHTML += `
        <td>
            <button class="btn-view" style="margin-left: 5px;">
                <i class="fa-solid fa-eye"></i> <!-- Biểu tượng mắt -->
            </button>
        </td>
    `;
                  }

                  rowHTML += `</tr>`;
                } else {
                  rowHTML = `
    <tr>
        <td>${minhChungCon.so_minh_chung}</td>
        <td style="font-size: 12px; text-align: start;">${
          minhChungCon.ten_minh_chung
        }</td>
        <td style="width: 150px;">${minhChungCon.ngay_ban_hanh}</td>
        <td style="font-size: 12px;">${minhChungCon.noi_ban_hanh}</td>
        <td style="width: 170px; text-align: center;">
            <span class="link-text">
                ${
                  minhChungCon.link
                    ? `<a href="${minhChungCon.link}" target="_blank" class="btn">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i>
                      </a>`
                    : ""
                }
            </span>
            <input type="text" value="${
              minhChungCon.link || ""
            }" class="link" style="display: none;" />
        </td>
    </tr>
  `;
                }

                minhChungConRow.innerHTML += rowHTML;
                table.appendChild(minhChungConRow);
              });
            }
          });
        }
      });
    }
    container.appendChild(table);
  });
}

export function renderNganh() {
  fetch(`${baseUrl}api/v1/nganh`)
    .then((response) => response.json())
    .then((data) => {
      // Kiểm tra nếu dữ liệu trả về có danh sách ngành
      if (data.status === 200 && data.data) {
        const container = document.getElementById("nganh-buttons-container");

        // Lấy ma_nganh từ URL hiện tại
        const pathSegments = window.location.pathname.split("/");
        const lastSegment = pathSegments.filter(Boolean).pop(); // Lấy phần tử cuối không rỗng

        const currentMaNganh = /^\d+$/.test(lastSegment) ? lastSegment : null; // Kiểm tra nếu là số

        console.log(currentMaNganh); // Kết quả: "2" hoặc null nếu không phải số

        data.data.forEach((nganh) => {
          const button = document.createElement("button");
          button.textContent = `Ngành ${nganh.ten_nganh}`;
          if (nganh.ma_nganh == currentMaNganh) {
            button.style.backgroundColor = "#ad171c"; // Màu nền
            button.style.color = "white"; // Màu chữ
          }
          if ((currentMaNganh == 0 || !currentMaNganh) && nganh.ma_nganh == 1) {
            button.style.backgroundColor = "#ad171c"; // Màu nền
            button.style.color = "white"; // Màu chữ
          }
          button.onclick = () => {
            // Xóa màu nền của tất cả các button
            document.querySelectorAll("button").forEach((btn) => {
              btn.style.backgroundColor = ""; // Reset màu nền
              btn.style.color = ""; // Reset màu chữ
            });

            button.style.backgroundColor = "#ad171c"; // Màu nền
            button.style.color = "white"; // Màu chữ

            // Điều hướng đến ma_nganhconst currentPath = window.location.pathname;
            const currentPath = window.location.pathname;
            const newPath = currentPath.includes("/mcbs/")
              ? `${baseUrl}mcbs/${nganh.ma_nganh}`
              : `${baseUrl}${nganh.ma_nganh}`;

            window.location.href = newPath;
          };
          container.appendChild(button);
        });
      } else {
        console.error("Không có dữ liệu ngành");
      }
    })
    .catch((error) => {
      console.error("Lỗi khi gọi API:", error);
    });
}

export function checkToken() {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="));
  if (token) {
    const tokenValue = token.split("=")[1];
    return !!tokenValue; // Trả về true nếu token tồn tại
  }
  return false; // Trả về false nếu không có token
}

// Hàm render bộ lọc
export function renderFilter(hasToken) {
  const linkStatusContainer = document.getElementById("link_status");
  const maTieuChuanDropdown = document.getElementById("ma_tieu_chuan");
  const maTieuChiDropdown = document.getElementById("ma_tieu_chi");

  if (hasToken) {
    // Hiển thị bộ lọc "Đã gắn link" và "Chưa gắn link"
    linkStatusContainer.style.display = "block";
    maTieuChuanDropdown.style.display = "none";
    maTieuChiDropdown.style.display = "none";
  } else {
    // Hiển thị bộ lọc theo tiêu chuẩn
    linkStatusContainer.style.display = "none";
    maTieuChuanDropdown.style.display = "block";
    maTieuChiDropdown.style.display = "none"; // Ẩn tiêu chí mặc định
  }
}

export function attachEditSaveEvents() {
  const editButtons = document.querySelectorAll(".btn-edit");
  editButtons.forEach((button) => {
    button.addEventListener("click", function () {
      editLink(button); // Gọi hàm editLink
    });
  });
}

export function attachEditMCSaveEvents() {
  const editMCButtons = document.querySelectorAll(".btn-view");
  editMCButtons.forEach((button) => {
    button.addEventListener("click", function () {
      editMC(button); // Gọi hàm editLink
    });
  });
}

export function renderBCTDG(data) {
  const container = document.querySelector("#bctdg-container");

  // Kiểm tra xem bảng đã tồn tại trong container hay chưa
  const existingTable = container.querySelector("table");
  if (existingTable) {
    // Cập nhật nội dung bảng nếu dữ liệu thay đổi
    updateTableContent(existingTable, data);
    return; // Dừng tại đây nếu bảng đã tồn tại
  }

  // Tạo bảng mới nếu chưa tồn tại
  const table = document.createElement("table");
  table.classList.add("tablebctdg", "table-bordered", "table-striped");

  // Dòng tiêu đề của bảng (các cột)
  const titleRow = document.createElement("tr");
  titleRow.innerHTML = `
    <th>Mã Báo Cáo</th>
    <th>Tên Ngành</th>
    <th>URL</th>
    ${
      checkToken()
        ? `<th style="width: auto; white-space: nowrap;">Cập nhật file</th>`
        : ""
    }
  `;
  table.appendChild(titleRow);

  // Duyệt qua dữ liệu và thêm vào bảng
  data.forEach((bcTdg) => {
    const nganhRow = createRow(bcTdg);
    table.appendChild(nganhRow);
  });

  container.appendChild(table);
}

// Hàm tạo một hàng mới
function createRow(bcTdg) {
  const nganhRow = document.createElement("tr");

  const maBcTdgCell = document.createElement("td");
  maBcTdgCell.textContent = bcTdg.ma_bc_tdg;
  maBcTdgCell.classList.add("ma_bc_tdg");
  nganhRow.appendChild(maBcTdgCell);

  const tenNganhCell = document.createElement("td");
  tenNganhCell.textContent = bcTdg.ten_nganh || "Không xác định";
  nganhRow.appendChild(tenNganhCell);

  const urlCell = document.createElement("td");
  urlCell.style.textAlign = "center";
  urlCell.innerHTML = `
    <span class="link-text">
      ${
        bcTdg.url
          ? `<a href="${bcTdg.url}" target="_blank" class="btn">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>`
          : ""
      }
    </span>
    <input type="text" value="${
      bcTdg.url || ""
    }" class="link" style="display: none;" />
  `;
  nganhRow.appendChild(urlCell);

  if (checkToken()) {
    const editButtonCell = document.createElement("td");
    editButtonCell.innerHTML = `
      <button class="btn-edit" style="margin-left: 5px;">
        <i class="fa-solid fa-pen"></i> <!-- Biểu tượng bút -->
      </button>
      <button class="btn-save" style="margin-left: 5px; display: none;">
        <i class="fa-solid fa-save"></i> <!-- Biểu tượng lưu -->
      </button>
    `;
    nganhRow.appendChild(editButtonCell);
  }

  return nganhRow;
}

// Hàm cập nhật nội dung bảng hiện có
function updateTableContent(table, data) {
  const rows = table.querySelectorAll("tr:not(:first-child)"); // Bỏ qua dòng tiêu đề
  rows.forEach((row) => row.remove()); // Xóa tất cả các hàng cũ

  // Thêm dữ liệu mới
  data.forEach((bcTdg) => {
    const newRow = createRow(bcTdg);
    table.appendChild(newRow);
  });
}
