let baseUrl = document.body.getAttribute("data-base-url");
if (baseUrl !== "/qldt/") {
  baseUrl = "";
}

import { showMessage } from "./floating_message.js";

async function fetchAPI(endpoint) {
  try {
    const token = getCookie("token");
    const response = await fetch(`${baseUrl}api/v1/${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.ok
      ? response.json()
      : Promise.reject(await response.json());
  } catch (error) {
    console.error("API fetch error:", error);
    showMessage("Lỗi khi tải dữ liệu!", "error");
    return { data: [] };
  }
}

async function showCreatePopup(saveCallback) {
  document.getElementById("popup-container_mc")?.remove();

  const popupContainer = document.createElement("div");
  popupContainer.id = "popup-container_mc";
  popupContainer.className = "popup-overlay_mc";
  popupContainer.style.display = "flex";
  popupContainer.style.justifyContent = "center";
  popupContainer.style.alignItems = "center";

  popupContainer.innerHTML = `
    <div class="popup-content_mc" style="padding: 8px; width: 520px; display: flex; flex-direction: column; max-width: 100%;">
      <h3>Tạo mới minh chứng</h3>
      <div class="popup-form_mc" style="display: flex; flex-direction: column; gap: 10px;">
        <label for="tieuChuan_mc">Tiêu chuẩn:</label>
        <select id="tieuChuan_mc" class="popup-input_mc" style="height: 40px;"></select>
        
        <div id="tieuChiContainer" style="display: none;">
          <label for="tieuChi_mc">Tiêu chí:</label>
          <select id="tieuChi_mc" class="popup-input_mc" style="height: 40px;"></select>
        </div>
        
        <div id="minhChungContainer" style="display: none;">
          <label for="minhChung_mc">Minh chứng:</label>
          <select id="minhChung_mc" class="popup-input_mc" style="height: 40px;"></select>
        </div>

        <!-- Input Fields for Minh Chứng -->
        <div id="minhChungInputs" style="display: none;">
          <label for="tenMinhChung_mc">Tên minh chứng:</label>
          <input id="tenMinhChung_mc" class="popup-input_mc" type="text" style="height: 40px;">
          
          <label for="soMinhChung_mc">Số minh chứng:</label>
          <input id="soMinhChung_mc" class="popup-input_mc" type="text" style="height: 40px;">
          
          <label for="noiBanHanh_mc">Nơi ban hành:</label>
          <input id="noiBanHanh_mc" class="popup-input_mc" type="text" style="height: 40px;">
          
          <label for="ngayBanHanh_mc">Ngày ban hành:</label>
          <input id="ngayBanHanh_mc" class="popup-input_mc" type="text" style="height: 40px;">
        </div>

        <div class="popup-buttons_mc" style="display: flex; gap: 10px; justify-content: center;">
          <button id="popup-save_mc" class="popup-save_mc">Lưu</button>
          <button id="popup-cancel_mc" class="popup-cancel_mc">Hủy</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(popupContainer);
  const tieuChuanSelect = document.getElementById("tieuChuan_mc");
  const tieuChiSelect = document.getElementById("tieuChi_mc");
  const minhChungSelect = document.getElementById("minhChung_mc");
  const minhChungInputs = document.getElementById("minhChungInputs");
  const tieuChiContainer = document.getElementById("tieuChiContainer");
  const minhChungContainer = document.getElementById("minhChungContainer");
  const pathSegments = window.location.pathname.split("/");
  const maNganh = pathSegments[pathSegments.length - 1];
  const tieuChuanList = await fetchAPI(`tieu_chuan/${maNganh}`);

  tieuChuanSelect.innerHTML =
    '<option value="">Chọn tiêu chuẩn</option>' +
    tieuChuanList.data
      .map(
        (tc) =>
          `<option value="${tc.ma_tieu_chuan}">${tc.ten_tieu_chuan}</option>`
      )
      .join("");

  tieuChuanSelect.addEventListener("change", async function () {
    tieuChiSelect.innerHTML = '<option value="">Chọn tiêu chí</option>';
    tieuChiContainer.style.display = "none";
    minhChungSelect.innerHTML = '<option value="">Chọn minh chứng</option>';
    minhChungContainer.style.display = "none";
    minhChungInputs.style.display = "none";

    if (this.value) {
      const tieuChiList = await fetchAPI(`tieu_chi/${this.value}`);
      if (tieuChiList.data.length > 0) {
        tieuChiSelect.innerHTML += tieuChiList.data
          .map((tc) => {
            let tenTieuChi = tc.ten_tieu_chi || tc.ma_tieu_chi;

            // Kiểm tra và loại bỏ [1], [2],... ở đầu chuỗi
            let match = tenTieuChi.match(/^\[\d+\]\s*/);
            if (match) {
              tenTieuChi = tenTieuChi.replace(match[0], "");
            }

            return `<option value="${tc.ma_tieu_chi}">${tenTieuChi}</option>`;
          })
          .join("");
        tieuChiContainer.style.display = "block";
      }
    }
  });

  tieuChiSelect.addEventListener("change", async function () {
    minhChungSelect.innerHTML = '<option value="">Chọn minh chứng</option>';
    minhChungContainer.style.display = "none";
    minhChungInputs.style.display = "none";

    if (this.value) {
      const minhChungList = await fetchAPI(`minh_chung/${this.value}`);
      if (minhChungList.data.length > 0) {
        minhChungSelect.innerHTML += minhChungList.data
          .map((mc) => {
            let tenMinhChung = mc.ten_minh_chung || mc.ma_minh_chung;

            // Kiểm tra và loại bỏ [1], [2],... ở đầu chuỗi
            let match = tenMinhChung.match(/^\[\d+\]\s*/);
            if (match) {
              tenMinhChung = tenMinhChung.replace(match[0], "");
            }
            return `<option value="${mc.ma_minh_chung}">${tenMinhChung}</option>`;
          })
          .join("");
        minhChungContainer.style.display = "block";
      }
    }
  });

  minhChungSelect.addEventListener("change", function () {
    // Display input fields after Minh chứng is selected
    if (this.value) {
      minhChungInputs.style.display = "block";
    } else {
      minhChungInputs.style.display = "none";
    }
  });

  document.getElementById("popup-save_mc").onclick = () => {
    const newData = {
      tieu_chuan_id: tieuChuanSelect.value,
      tieu_chi_id: tieuChiSelect.value,
      minh_chung_id: minhChungSelect.value,
      ten_minh_chung: document.getElementById("tenMinhChung_mc").value,
      so_minh_chung: document.getElementById("soMinhChung_mc").value,
      noi_ban_hanh: document.getElementById("noiBanHanh_mc").value,
      ngay_ban_hanh: document.getElementById("ngayBanHanh_mc").value,
    };

    if (!newData.minh_chung_id) {
      showMessage("Vui lòng chọn minh chứng!", "error");
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
      body: JSON.stringify({
        ma_minh_chung: data.minh_chung_id,
        ten_minh_chung: data.ten_minh_chung,
        so_minh_chung: data.so_minh_chung,
        noi_ban_hanh: data.noi_ban_hanh,
        ngay_ban_hanh: data.ngay_ban_hanh,
      }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Tạo mới thất bại!");

    showMessage("Tạo mới minh chứng thành công!", "success");
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
  if (floatingButton) {
    floatingButton.onclick = () => {
      createMC();
    };
  }
}
