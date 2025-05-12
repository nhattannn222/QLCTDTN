let baseUrl = document.body.getAttribute("data-base-url");
if (baseUrl !== "/qldt/") {
  baseUrl = "";
}

import { showMessage } from "./floating_message.js";

function showPopup(saveCallback, minhChungData) {
  document.getElementById("popup-container_mc")?.remove();

  const popupContainer = document.createElement("div");
  popupContainer.id = "popup-container_mc";
  popupContainer.className = "popup-overlay_mc";
  popupContainer.style.display = "flex";

  popupContainer.innerHTML = `
    <div class="popup-content_mc">
      <button class="popup-close-circle" id="popup-cancel_mc" ">×</button>
      <h3>Chỉnh sửa minh chứng</h3>
      <div class="popup-form_mc">
        <label for="urlHopMinhChung_mc">URL Hộp minh chứng:</label>
        <input type="text" id="urlHopMinhChung_mc" class="popup-input_mc" value="${
          minhChungData.url_hop_minh_chung || ""
        }">


        <label for="soMinhChungCon_mc">Số minh chứng:</label>
        <input type="text" id="soMinhChungCon_mc" class="popup-input_mc" value="${
          minhChungData.so_minh_chung || ""
        }">

        <label for="tenMinhChung_mc">Tên minh chứng:</label>
        <textarea id="tenMinhChung_mc" class="popup-input_mc">${
          minhChungData.ten_minh_chung || ""
        }</textarea>

        <label for="ngayBanHanh_mc">Ngày ban hành:</label>
        <input type="text" id="ngayBanHanh_mc" class="popup-input_mc" value="${
          minhChungData.ngay_ban_hanh || ""
        }">

        <label for="noiBanHanh_mc">Nơi ban hành:</label>
        <input type="text" id="noiBanHanh_mc" class="popup-input_mc" value="${
          minhChungData.noi_ban_hanh || ""
        }">
      </div>

      <div class="popup-buttons_mc">
        <button id="popup-save_mc" class="popup-save_mc">Lưu MC</button>
        <button id="popup-delete_mc" class="popup-delete_mc">Xóa MC</button>
      </div>
    </div>
  `;

  document.body.appendChild(popupContainer);

  // Nút Lưu
  document.getElementById("popup-save_mc").onclick = () => {
    const updatedData = {
      ma_minh_chung_con: minhChungData.ma_minh_chung_con,
      so_minh_chung: document.getElementById("soMinhChungCon_mc").value.trim(),
      ten_minh_chung: document.getElementById("tenMinhChung_mc").value.trim(),
      ngay_ban_hanh: document.getElementById("ngayBanHanh_mc").value.trim(),
      noi_ban_hanh: document.getElementById("noiBanHanh_mc").value.trim(),
      url_hop_minh_chung: document.getElementById("urlHopMinhChung_mc").value.trim(),
    };

    if (!updatedData.ten_minh_chung) {
      showMessage("Tên minh chứng không được để trống!", "error");
      return;
    }

    saveCallback(updatedData);
    hidePopup();
  };

  // Nút Xóa
  document.getElementById("popup-delete_mc").onclick = () => {
    if (confirm("Bạn có chắc chắn muốn xóa minh chứng này?")) {
      deleteMinhChung(minhChungData.ma_minh_chung_con);
      hidePopup();
    }
  };

  // Nút Hủy
  document.getElementById("popup-cancel_mc").onclick = hidePopup;
}

function hidePopup() {
  document.getElementById("popup-container_mc")?.remove();
}

async function deleteMinhChung(maMinhChungCon) {
  try {
    const token = getCookie("token");
    if (!token) {
      showMessage("Bạn chưa đăng nhập hoặc token không hợp lệ.", "error");
      return;
    }
    const response = await fetch(
      `${baseUrl}/api/v1/minh_chung_con/${maMinhChungCon}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      showMessage("Lỗi khi xóa minh chứng!", "error");
    }

    showMessage(`Đã xóa minh chứng con: ${maMinhChungCon}`, "success");
  } catch (error) {
    console.error("Lỗi khi xóa minh chứng:", error);
    showMessage("Lỗi khi xóa minh chứng!", "error");
  }
}

export async function editMC(button) {
  const row = button.closest("tr");
  const maMinhChungCon = row
    .querySelector(".ma_minh_chung_con")
    .textContent.trim();

  if (!maMinhChungCon) {
    showMessage("Không tìm thấy mã minh chứng con!", "error");
    return;
  }

  try {
    const response = await fetch(
      `${baseUrl}/api/v1/minh_chung_con/${maMinhChungCon}`
    );
    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Không thể lấy dữ liệu minh chứng con!"
      );
    }

    if (!result.data) {
      throw new Error("Dữ liệu trả về không hợp lệ!");
    }

    showPopup(updateMinhChung, result.data);
  } catch (error) {
    console.error("Lỗi khi lấy minh chứng con:", error);
    showMessage("Lỗi khi lấy dữ liệu minh chứng con!", "error");
  }
}

async function updateMinhChung(data) {
  const token = getCookie("token");
  if (!token) {
    showMessage("Bạn chưa đăng nhập hoặc token không hợp lệ.", "error");
    return;
  }
  try {
    // Kiểm tra nếu không có `so_minh_chung`, đặt mặc định là chuỗi rỗng
    if (!data.ma_minh_chung_con) {
      showMessage("Mã minh chứng con không hợp lệ!", "error");
      return;
    }
    console.log(data);
    

    const response = await fetch(
      `${baseUrl}/api/v1/minh_chung_con/${data.ma_minh_chung_con}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Cập nhật thất bại!");
    }

    showMessage("Cập nhật thành công!", "success");
    // setTimeout(() => {
    //   location.reload();
    // });
    hidePopup();
  } catch (error) {
    console.error("Lỗi khi cập nhật minh chứng:", error);
    showMessage("Lỗi khi cập nhật minh chứng!", "error");
  }
}

// Hàm lấy giá trị của cookie theo tên
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}
