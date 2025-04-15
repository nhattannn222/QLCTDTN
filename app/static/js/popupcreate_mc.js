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
    <button class="popup-close-circle" id="popup-cancel_mc" ">×</button>  
    <h3 style="font-size: 22px; margin-bottom: 16px;">
        Tạo mới minh chứng
      </h3>
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

// Hàm lấy giá trị của cookie theo tên
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

const token = getCookie("token");
const role = getCookie("role"); // Lấy quyền người dùng từ cookie

if (token && role) {
  // Create a container for floating buttons
  const floatingContainer = document.createElement("div");
  floatingContainer.id = "floating-container";

  // First floating button (for creating new evidence)
  const floatingButton1 = document.createElement("button");
  floatingButton1.id = "floating-create-mc";
  floatingButton1.textContent = "+";
  floatingButton1.className = "floating-button_mc";
  floatingButton1.onclick = () => {
    createMC(); // This button triggers the function to create new evidence
  };
  floatingContainer.appendChild(floatingButton1);

  // Second floating button (for showing requests)
  const floatingButton2 = document.createElement("button");
  floatingButton2.id = "floating-show-requests";
  floatingButton2.textContent = "📋";
  floatingButton2.className = "floating-button_mc";
  floatingButton2.onclick = () => {
    showRequestPopup();
  };
  floatingContainer.appendChild(floatingButton2);

  // Third floating button for creating new request (only for Manager)
  if (role === "manager") {
    const floatingButton3 = document.createElement("button");
    floatingButton3.id = "floating-create-request";
    floatingButton3.textContent = "📝";
    floatingButton3.className = "floating-button_mc";
    floatingButton3.onclick = () => {
      showCreateRequestPopup(); // Nút tạo yêu cầu cho Manager
    };
    floatingContainer.appendChild(floatingButton3);
  }

  // Append the container to the body
  document.body.appendChild(floatingContainer);

  // Add style for the floating buttons
  const style = document.createElement("style");
  style.innerHTML = `
    #floating-container {
      position: fixed;
      bottom: 20px;
      right: 20px;  /* Adjust position of the container */
      display: flex;
      flex-direction: column;  /* Arrange buttons vertically */
      gap: 10px;  /* Space between buttons */
    }

    .floating-button_mc {
      width: 50px;
      height: 50px;
      background-color: #ad171c;
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
      transition: background-color 0.3s ease;
    }

    .floating-button_mc:hover {
      background-color: #760508;
    }

    #floating-create-mc {
      order: 1;
    }

    #floating-show-requests {
      order: 2;
    }

    #floating-create-request {
      order: 3;  /* Nút này chỉ có khi là Manager */
    }
  `;
  document.head.appendChild(style);
}

// Hiển thị popup danh sách yêu cầu
async function showRequestPopup() {
  document.getElementById("popup-container_requests")?.remove();

  const popupContainer = document.createElement("div");
  popupContainer.id = "popup-container_requests";
  popupContainer.className = "popup-overlay_mc";
  popupContainer.style.display = "flex";
  popupContainer.style.justifyContent = "center";
  popupContainer.style.alignItems = "center";

  try {
    const response = await fetch(`${baseUrl}/yeu_cau`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Lỗi khi lấy dữ liệu yêu cầu");

    const requestList = await response.json();

    popupContainer.innerHTML = `
    <div class="popup-content_mc" style="padding: 16px; width: 1200px; display: flex; flex-direction: column; align-items: center;   max-width: 100%; font-size: 16px;">
      <button class="popup-close-circle" id="popup-close_requests" ">×</button>
      <h3 style="font-size: 22px; margin-bottom: 16px; ">
        Danh sách yêu cầu
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 16px;">
        <thead>
          <tr>
            <th>Tài khoản yêu cầu</th>
            <th>Nội dung</th>
            <th>Ngày yêu cầu</th>
            <th>Ngày xử lý</th>
            <th style="width: 120px;">Trạng thái</th> <!-- Thêm width cho cột Trạng thái -->
            <th>Ảnh yêu cầu</th>
            <th>Ảnh đã xử lý</th>
            ${role !== "manager" ? `<th>Tài khoản xử lý</th>` : ""}
            ${role !== "manager" ? `<th>Hành động</th>` : ""}
          </tr>
        </thead>
        <tbody>
          ${requestList.data.length === 0
            ? "<tr><td colspan='9' style='text-align: center;'>Không có yêu cầu nào.</td></tr>"
            : requestList.data.map((request) => `
              <tr>
                <td>${request.tai_khoan_yeu_cau}</td>
                <td>${request.noi_dung}</td>
                <td>${new Date(request.ngay_yeu_cau).toLocaleString()}</td>
                <td>${request.ngay_xu_li ? new Date(request.ngay_xu_li).toLocaleString() : "Chưa xử lý"}</td>
                <td style="width: 120px;">${request.trang_thai=="chua_xu_li"?"Chưa xử lí":"Đã xử lí"}</td> <!-- Thêm width cho cột Trạng thái -->
                <td>
                  <img src="${request.duong_dan_den_anh_yeu_cau}" 
                       alt="Ảnh yêu cầu" 
                       style="width: 120px; height: auto; cursor: pointer;" 
                       onclick="zoomImage('${request.duong_dan_den_anh_yeu_cau}')">
                </td>
                <td>
                  ${request.duong_dan_den_anh_da_xu_li
                    ? `<img src="${request.duong_dan_den_anh_da_xu_li}" alt="Ảnh đã xử lý" 
                          style="width: 120px; height: auto; cursor: pointer;" 
                          onclick="zoomImage('${request.duong_dan_den_anh_da_xu_li}')">`
                    : request.trang_thai === "chua_xu_li" && role === "admin"
                    ? ` 
                        <input type="file" id="upload_${request.ma_yeu_cau}" accept="image/*" style="display: none;">
                        <button class="popup-upload_mc" data-id="${request.ma_yeu_cau}">Tải ảnh</button>
                        <span id="file_name_${request.ma_yeu_cau}" style="margin-left: 8px;"></span>
                      ` : "Chưa xử lý"
                  }
                </td>
                ${role !== "manager" ? `
                  <td>
                    ${request.tai_khoan_xu_li ? request.tai_khoan_xu_li : "Chưa xử lý"}
                  </td>` : ""}
                ${role !== "manager" ? `
                  <td>
                    ${role === "admin" && request.trang_thai === "chua_xu_li"
                      ? `<button class="popup-save_mc" data-id="${request.ma_yeu_cau}">Cập nhật</button>`
                      : ""
                    }
                  </td>` : ""}
              </tr>
            `).join("")
          }
        </tbody>
      </table>
    </div>
  `;

    document.body.appendChild(popupContainer);
    document.getElementById("popup-close_requests").onclick = hideRequestPopup;

    // Gán sự kiện cho tất cả nút upload
    document.querySelectorAll(".popup-upload_mc").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        document.getElementById(`upload_${id}`).click();
      });
    });

    // Gán sự kiện cho tất cả input file
    document.querySelectorAll("input[type='file']").forEach((input) => {
      input.addEventListener("change", function () {
        const id = this.id.split("_")[1];
        document.getElementById(`file_name_${id}`).textContent =
          this.files[0]?.name || "";
      });
    });

    // Gán sự kiện cho tất cả nút lưu
    document.querySelectorAll(".popup-save_mc").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        handleUpload(id);
      });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    popupContainer.innerHTML = `
      <div class="popup-content_mc" style="padding: 16px; width: 900px; display: flex; flex-direction: column; max-width: 100%; font-size: 16px;">
        <h3 style="font-size: 22px; margin-bottom: 16px; font-weight: bold;">
          Danh sách yêu cầu
        </h3>
        <p style="color: red;">Không thể lấy dữ liệu yêu cầu. Vui lòng thử lại sau.</p>
        <button id="popup-close_requests" class="popup-close_mc" style="margin-top: 10px; padding: 8px 16px; font-size: 16px;">Đóng</button>
      </div>
    `;
    document.body.appendChild(popupContainer);
  }
}

async function handleUpload(maYeuCau) {
  console.log(`🔹 Bắt đầu tải ảnh cho yêu cầu ID: ${maYeuCau}`);

  const fileInput = document.getElementById(`upload_${maYeuCau}`);
  if (!fileInput || !fileInput.files.length) {
    alert("❌ Vui lòng chọn một tệp ảnh trước khi lưu.");
    return;
  }

  const file = fileInput.files[0];
  console.log(`📂 Tên file: ${file.name}, Dung lượng: ${file.size} bytes`);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("ma_yeu_cau", maYeuCau);

  try {
    console.log("📡 Đang gửi ảnh đến API...");

    const response = await fetch(`${baseUrl}/xu_li_yeu_cau/${maYeuCau}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    console.log(`📡 Phản hồi từ API: ${response.status}`);

    if (!response.ok) {
      throw new Error("❌ Lỗi khi tải lên ảnh. Mã lỗi: " + response.status);
    }

    const result = await response.json();
    console.log("✅ Ảnh đã được tải lên thành công:", result);

    alert("✅ Ảnh xử lý đã được lưu thành công!");
    showRequestPopup(); // Cập nhật lại danh sách yêu cầu
  } catch (error) {
    console.error("❌ Có lỗi xảy ra khi tải lên ảnh:", error);
    alert("❌ Lỗi khi tải lên ảnh. Vui lòng thử lại.");
  }
}

function showCreateRequestPopup() {
  const popupContainer = document.createElement("div");
  popupContainer.id = "popup-container-create-request";
  popupContainer.className = "popup-overlay_mc";
  popupContainer.style.display = "flex";
  popupContainer.style.justifyContent = "center";
  popupContainer.style.alignItems = "center";

  popupContainer.innerHTML = `
    <div class="popup-content_mc" style="padding: 16px; width: 500px; display: flex; flex-direction: column; max-width: 100%; font-size: 16px;">
    <button class="popup-close-circle" id="popup-close-create-request" ">×</button>      
    <h3 style="font-size: 22px; ">Tạo yêu cầu mới</h3>
      <form id="create-request-form" enctype="multipart/form-data">
        <label for="request-content">Nội dung yêu cầu:</label>
        <textarea id="request-content" name="request-content" required></textarea>

        <label for="request-file">Tải lên file:</label>
        <input type="file" id="request-file" name="request-file" accept="image/*,application/pdf"/>

        <div class="submit-wrapper">
          <button type="submit" class="submit-request-btn">Tạo yêu cầu</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(popupContainer);

  // Đóng popup
  document.getElementById("popup-close-create-request").onclick = function () {
    document.getElementById("popup-container-create-request").remove();
  };

  // Gửi yêu cầu tạo yêu cầu mới
  document.getElementById("create-request-form").onsubmit = async function (
    event
  ) {
    event.preventDefault();

    const content = document.getElementById("request-content").value;
    const fileInput = document.getElementById("request-file");
    const file = fileInput.files[0]; // Lấy file người dùng chọn

    if (!content) {
      alert("Vui lòng nhập nội dung yêu cầu.");
      return;
    }

    const formData = new FormData();
    formData.append("noi_dung", content);
    if (file) formData.append("file", file);

    try {
      // Lấy base URL và token từ môi trường hoặc localStorage

      const response = await fetch(`${baseUrl}/tao_yeu_cau`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData, // Sử dụng FormData để gửi cả nội dung và file
      });

      if (!response.ok) throw new Error("Lỗi khi tạo yêu cầu.");

      const result = await response.json();
      alert("✅ Yêu cầu đã được tạo thành công!");
      document.getElementById("popup-container-create-request").remove(); // Đóng popup sau khi tạo thành công
    } catch (error) {
      console.error("Lỗi:", error);
      alert("❌ Không thể tạo yêu cầu. Vui lòng thử lại.");
    }
  };
}

window.zoomImage = function (imageSrc) {
  // Xóa modal cũ nếu có
  let existingModal = document.getElementById("zoomModal");
  if (existingModal) {
    document.body.removeChild(existingModal);
  }

  // Tạo modal zoom
  const zoomModal = document.createElement("div");
  zoomModal.id = "zoomModal";
  zoomModal.style.position = "fixed";
  zoomModal.style.top = "0";
  zoomModal.style.left = "0";
  zoomModal.style.width = "100%";
  zoomModal.style.height = "100%";
  zoomModal.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  zoomModal.style.display = "flex";
  zoomModal.style.justifyContent = "center";
  zoomModal.style.alignItems = "center";
  zoomModal.style.zIndex = "1000";

  // Ảnh được zoom
  const zoomImg = document.createElement("img");
  zoomImg.src = imageSrc;
  zoomImg.style.maxWidth = "90%";
  zoomImg.style.maxHeight = "90%";
  zoomImg.style.borderRadius = "8px";
  zoomImg.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
  zoomImg.style.cursor = "zoom-out";
  zoomImg.style.transition = "transform 0.2s ease-in-out";

  let scale = 1; // Mức zoom ban đầu

  // Xử lý zoom bằng cuộn chuột
  zoomModal.addEventListener("wheel", (event) => {
    event.preventDefault();
    scale += event.deltaY * -0.01;
    scale = Math.min(Math.max(1, scale), 3);
    zoomImg.style.transform = `scale(${scale})`;
  });

  // Đóng modal khi click ra ngoài ảnh
  zoomModal.addEventListener("click", (event) => {
    if (event.target === zoomModal) {
      document.body.removeChild(zoomModal);
    }
  });

  // Nhấn ESC để đóng ảnh
  function closeOnEsc(event) {
    if (event.key === "Escape") {
      document.body.removeChild(zoomModal);
      document.removeEventListener("keydown", closeOnEsc);
    }
  }
  document.addEventListener("keydown", closeOnEsc);

  // Gắn ảnh vào modal và thêm modal vào DOM
  zoomModal.appendChild(zoomImg);
  document.body.appendChild(zoomModal);
};

// Ẩn popup
function hideRequestPopup() {
  document.getElementById("popup-container_requests")?.remove();
}
