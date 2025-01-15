let baseUrl = document.body.getAttribute("data-base-url");
if (baseUrl !== "/qldt/") {
  baseUrl = "";
}

import { showMessage } from "./floating_message.js";

function showPopup(saveCallback, maMinhChung, maFolder, currentLink = "") {
  const popup = document.getElementById("popup-container");
  const saveButton = document.getElementById("popup-save");
  const cancelButton = document.getElementById("popup-cancel");
  const linkListContainer = document.getElementById("popup-link-list");
  const noLinksMessage = document.getElementById("no-links-message");
  const fileInput = document.getElementById("file-upload");
  const uploadButton = document.getElementById("upload-button");

  let selectedLinks = []; // Lưu danh sách các liên kết được chọn
  let folderUrl = ""; // Lưu URL của thư mục

  fetch(`${baseUrl}api/v1/get_links?folder_id=${maFolder}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.files.length === 0) {
        noLinksMessage.style.display = "block";
        linkListContainer.style.display = "none";
        saveButton.disabled = true;
      } else {
        noLinksMessage.style.display = "none";
        linkListContainer.style.display = "block";
        saveButton.disabled = false;
      }

      folderUrl = data.folder_url || "";

      linkListContainer.innerHTML = "";

      const isCurrentFolder = currentLink === folderUrl;

      data.files.forEach((link) => {
        const linkItem = document.createElement("div");
        linkItem.classList.add("link-item");
        linkItem.textContent = `Tên tệp: ${link.name}`;

        if (isCurrentFolder) {
          linkItem.classList.add("selected");
          selectedLinks.push(link.url);
        } else if (currentLink && currentLink.includes(link.url)) {
          linkItem.classList.add("selected");
          selectedLinks.push(link.url);
        }

        linkItem.addEventListener("click", () => {
          if (linkItem.classList.contains("selected")) {
            linkItem.classList.remove("selected");
            selectedLinks = selectedLinks.filter((url) => url !== link.url);
          } else {
            linkItem.classList.add("selected");
            selectedLinks.push(link.url);
          }
        });

        linkListContainer.appendChild(linkItem);
      });

      popup.style.display = "flex";
    })
    .catch((error) => {
      console.error("Error fetching Google Drive links:", error);
      showMessage("Không thể tải danh sách liên kết từ Google Drive.", "error");
    });

  const handleUpload = () => {
    const files = fileInput.files;
    if (files.length > 0) {
      const urlParams = new URL(window.location.href);
      const pathParts = urlParams.pathname.split("/");
      const maNganh = pathParts[pathParts.length - 1];

      if (!maNganh || isNaN(maNganh)) {
        showMessage("Mã ngành không hợp lệ!", "error");
        return;
      }

      const apiUrl = `${baseUrl}api/v1/upload_file?folder_id=${maFolder}`;
      const uploadPromises = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const uploadPromise = fetch(apiUrl, {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.file_id) {
              showMessage(`Tải file "${file.name}" lên thành công!`, "success");
            } else {
              showMessage(`Tải file "${file.name}" lên thất bại!`, "error");
            }
          })
          .catch((error) => {
            console.error(`Error uploading file "${file.name}":`, error);
            showMessage(`Có lỗi xảy ra khi tải file "${file.name}" lên.`, "error");
          });

        uploadPromises.push(uploadPromise);
      }

      // Chờ tất cả các file được tải lên
      Promise.all(uploadPromises)
        .then(() => {
          showPopup(saveCallback, maMinhChung, maFolder);
          fileInput.value = "";
        })
        .catch((error) => {
          console.error("Error during file uploads:", error);
          showMessage("Có lỗi xảy ra khi tải lên các tệp.", "error");
        });
    } else {
      showMessage("Vui lòng chọn ít nhất một file để tải lên!", "error");
    }
  };

  uploadButton.addEventListener("click", handleUpload);

  const onSave = () => {
    let finalLink = "";
    if (selectedLinks.length === 1) {
      finalLink = selectedLinks[0];
    } else if (selectedLinks.length > 1) {
      finalLink = folderUrl;
    }

    if (finalLink) {
      saveCallback(finalLink);
      hidePopup();
    } else {
      showMessage("Vui lòng chọn ít nhất một liên kết!", "error");
    }
  };

  saveButton.addEventListener("click", onSave);
  cancelButton.addEventListener("click", hidePopup);

  function hidePopup() {
    popup.style.display = "none";
    saveButton.removeEventListener("click", onSave);
    cancelButton.removeEventListener("click", hidePopup);
    uploadButton.removeEventListener("click", handleUpload);
  }
}

// Gắn sự kiện cho nút "Edit"
export function editLink(button) {
  const row = button.closest("tr");
  const maMinhChungCon = row
    .querySelector(".ma_minh_chung_con")
    .textContent.trim();
  let maFolder = row.querySelector(".folderUrl").textContent.trim();
  const regex = /\/folders\/([a-zA-Z0-9_-]+)/;
  const match = maFolder.match(regex);

  if (match && match[1]) {
    maFolder = match[1];
  } else {
    showMessage("Không tìm thấy mã thư mục.", "error");
    return;
  }

  const linkText =
    row.querySelector(".link-text").querySelector("a")?.href || "";
  const maMinhChung = row
    .querySelector(".ma_minh_chung_data")
    .textContent.trim();

  if (!maMinhChungCon) {
    showMessage("Không tìm thấy mã minh chứng con!", "error");
    return;
  }

  if (!maMinhChung) {
    showMessage("Không tìm thấy mã minh chứng!", "error");
    return;
  }

  showPopup(
    (newLink) => {
      saveLinkAPI(maMinhChungCon, newLink);
    },
    maMinhChung,
    maFolder,
    linkText
  );
}

// Hàm gửi API để lưu link
function saveLinkAPI(maMinhChungCon, newLink) {
  const token = getCookie("token");
  if (!token) {
    showMessage("Bạn chưa đăng nhập hoặc token không hợp lệ.", "error");
    return;
  }

  const url = `${baseUrl}/api/v1/update_link/${maMinhChungCon}`;
  const data = { link: newLink };

  fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === 200) {
        showMessage(data.message, "success");
        setTimeout(() => {
          location.reload();
        }, 1000);
      } else {
        showMessage("Cập nhật thất bại!", "error");
      }
    })
    .catch((error) => {
      console.error("Error updating link:", error);
      showMessage("Cập nhật thất bại!", "error");
    });
}

// Hàm lấy giá trị của cookie theo tên
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}
