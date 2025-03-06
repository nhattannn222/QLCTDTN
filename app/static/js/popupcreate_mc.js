let baseUrl = document.body.getAttribute("data-base-url");
if (baseUrl !== "/qldt/") {
  baseUrl = "";
}

import { showMessage } from "./floating_message.js";

function showCreatePopup(saveCallback) {
  document.getElementById("popup-container_mc")?.remove();

  const popupContainer = document.createElement("div");
  popupContainer.id = "popup-container_mc";
  popupContainer.className = "popup-overlay_mc";
  popupContainer.style.display = "flex";

  popupContainer.innerHTML = `
    <div class="popup-content_mc">
      <h3>Tạo mới minh chứng</h3>
      <div class="popup-form_mc" style="display: flex; gap: 20px;">
        <div class="popup-column_mc">
          <label for="maMinhChung_mc">Mã minh chứng:</label>
          <input type="text" id="maMinhChung_mc" class="popup-input_mc">

          <label for="soThuTu_mc">Số thứ tự:</label>
          <input type="text" id="soThuTu_mc" class="popup-input_mc">

          <label for="maTieuChi_mc">Mã tiêu chí:</label>
          <input type="text" id="maTieuChi_mc" class="popup-input_mc">

          <label for="soMinhChungCon_mc">Số minh chứng:</label>
          <input type="text" id="soMinhChungCon_mc" class="popup-input_mc">
        </div>

        <div class="popup-column_mc">
          <label for="tenMinhChung_mc">Tên minh chứng:</label>
          <textarea id="tenMinhChung_mc" class="popup-input_mc"></textarea>

          <label for="ngayBanHanh_mc">Ngày ban hành:</label>
          <input type="text" id="ngayBanHanh_mc" class="popup-input_mc">

          <label for="noiBanHanh_mc">Nơi ban hành:</label>
          <input type="text" id="noiBanHanh_mc" class="popup-input_mc">

          <label for="url_mc">URL:</label>
          <input type="text" id="url_mc" class="popup-input_mc">
        </div>
      </div>

      <div class="popup-buttons_mc">
        <button id="popup-save_mc" class="popup-save_mc">Lưu</button>
        <button id="popup-cancel_mc" class="popup-cancel_mc">Hủy</button>
      </div>
    </div>
  `;

  document.body.appendChild(popupContainer);

  document.getElementById("popup-save_mc").onclick = () => {
    const newData = {
      ma_minh_chung: document.getElementById("maMinhChung_mc").value.trim(),
      so_thu_tu: document.getElementById("soThuTu_mc").value.trim(),
      ma_tieu_chi: document.getElementById("maTieuChi_mc").value.trim(),
      so_minh_chung: document.getElementById("soMinhChungCon_mc").value.trim(),
      ten_minh_chung: document.getElementById("tenMinhChung_mc").value.trim(),
      ngay_ban_hanh: document.getElementById("ngayBanHanh_mc").value.trim(),
      noi_ban_hanh: document.getElementById("noiBanHanh_mc").value.trim(),
      url: document.getElementById("url_mc").value.trim(),
    };

    if (!newData.ten_minh_chung) {
      showMessage("Tên minh chứng không được để trống!", "error");
      return;
    }

    saveCallback(newData);
    hidePopup();
  };

  document.getElementById("popup-cancel_mc").onclick = hidePopup;
}

function hidePopup() {
  document.getElementById("popup-container_mc")?.remove();
}

export async function createMC() {
  showCreatePopup(saveMinhChung);
}

async function saveMinhChung(data) {
  const token = getCookie("token");
  if (!token) {
    showMessage("Bạn chưa đăng nhập hoặc token không hợp lệ.", "error");
    return;
  }

  try {
    const response = await fetch(`${baseUrl}api/v1/minh_chung_con`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Tạo mới thất bại!");
    }

    showMessage("Tạo mới minh chứng thành công!", "success");
    console.log(result);
    
    setTimeout(() => {
      //location.reload();
    }, 1000);
    hidePopup();
  } catch (error) {
    console.error("Lỗi khi tạo minh chứng:", error);
    showMessage("Lỗi khi tạo minh chứng!", "error");
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}


const token = getCookie("token");

if (token) {
  const floatingButton = document.createElement("button");
  floatingButton.id = "floating-create-mc";
  floatingButton.textContent = "+";
  floatingButton.className = "floating-button_mc";
  floatingButton.onclick = createMC;
  document.body.appendChild(floatingButton);

  // CSS for Floating Button
  const style = document.createElement("style");
  style.innerHTML = `
    .floating-button_mc {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    }
    .floating-button_mc:hover {
      background-color: #0056b3;
    }
  `;
  document.head.appendChild(style);
}
