let baseUrl = document.body.getAttribute("data-base-url");
if (baseUrl !== "/qldt/") {
  baseUrl = "";
}

import { showMessage } from "./floating_message.js";

function showPopup(saveCallback, maMinhChung, maFolder, currentLink = "") {
  // Xóa popup-container cũ nếu tồn tại
  const existingPopup = document.getElementById("popup-container");
  if (existingPopup) {
    existingPopup.remove();
  }

  // Tạo lại popup-container
  const popupContainer = document.createElement("div");
  popupContainer.id = "popup-container";
  popupContainer.className = "popup-overlay";
  popupContainer.style.display = "flex"; // Hoặc "block" tùy thuộc vào cách bạn muốn hiển thị

  // Nội dung của popup
  popupContainer.innerHTML = `
    <div class="popup-content">
      <h3>Chỉnh sửa link</h3>
      <div id="no-links-message" style="display: none; color: red; font-size: 16px; margin-bottom: 10px;">
        Không có liên kết nào để chọn.
      </div>
      <div id="popup-link-list" class="popup-link-list"></div>
      <div class="file-upload-section" style="margin-top: 15px;">
        <label for="file-upload" style="display: block; margin-bottom: 5px;">Tải tệp lên:</label>
        <input type="file" id="file-upload" multiple style="margin-bottom: 10px;" />
        <label for="folder-upload" style="display: block; margin-bottom: 5px;">Tải thư mục lên:</label>
        <input type="file" id="folder-upload" webkitdirectory multiple style="margin-bottom: 10px;" />
        <button id="upload-button" class="popup-upload">Tải lên</button>
      </div>
      <div class="popup-buttons">
        <button id="popup-save" class="popup-save">Lưu</button>
        <button id="popup-delete" class="popup-delete">Xóa</button>
        <button id="popup-cancel" class="popup-cancel">Hủy</button>
      </div>
    </div>
  `;

  document.body.appendChild(popupContainer);

  // Gắn sự kiện cho các nút trong popup
  const saveButton = document.getElementById("popup-save");
  const deleteButton = document.getElementById("popup-delete");
  const cancelButton = document.getElementById("popup-cancel");

  let selectedLinks = []; // Lưu danh sách các liên kết được chọn
  let folderUrl = ""; // Lưu URL của thư mục

  fetch(`${baseUrl}api/v1/get_links?folder_id=${maFolder}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.items.length === 0) {
        document.getElementById("no-links-message").style.display = "block";
        document.getElementById("popup-link-list").style.display = "none";
        saveButton.disabled = true;
      } else {
        document.getElementById("no-links-message").style.display = "none";
        document.getElementById("popup-link-list").style.display = "block";
        saveButton.disabled = false;
      }

      folderUrl = data.folder_url || "";

      document.getElementById("popup-link-list").innerHTML = "";

      const isCurrentFolder = currentLink === folderUrl;

      data.items.forEach((link) => {
        const linkItem = document.createElement("div");
        linkItem.classList.add("link-item");
        linkItem.textContent =
          link.type == "File" ? `Tệp: ${link.name}` : `Folder: ${link.name}`;

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

        document.getElementById("popup-link-list").appendChild(linkItem);
      });
    })
    .catch((error) => {
      console.error("Error fetching Google Drive links:", error);
      showMessage("Không thể tải danh sách liên kết từ Google Drive.", "error");
    });

  const handleUpload = async () => {
    const folderInput = document.getElementById("folder-upload");
    const fileInput = document.getElementById("file-upload");

    // Kiểm tra nếu không có file nào được chọn
    if (
      (!folderInput || !folderInput.files || folderInput.files.length === 0) &&
      (!fileInput || !fileInput.files || fileInput.files.length === 0)
    ) {
      showMessage("Vui lòng chọn file hoặc thư mục để tải lên!", "error");
      return;
    }

    let rootFolderId = maFolder; // Thư mục gốc trên Google Drive

    try {
      // Xử lý thư mục (nếu có)
      if (folderInput.files.length > 0) {
        await handleFolderUpload(folderInput.files, rootFolderId);
      }

      // Xử lý file riêng lẻ (nếu có)
      if (fileInput.files.length > 0) {
        await handleFileUpload(fileInput.files, rootFolderId);
      }

      showPopup(saveCallback, maMinhChung, rootFolderId);
      folderInput.value = "";
      fileInput.value = "";
    } catch (error) {
      console.error("❌ Lỗi trong quá trình tải lên:", error);
      showMessage("Có lỗi xảy ra khi tải file/thư mục lên.", "error");
    }
  };

  /** 🗂️ Xử lý upload thư mục */
  const handleFolderUpload = async (folderFiles, rootFolderId) => {
    const { folderMap, filesToUpload } = await processFiles(folderFiles);

    // Tạo thư mục trên Google Drive
    await createFoldersOnDrive(folderMap, rootFolderId);

    // Upload file vào thư mục tương ứng
    await uploadFilesToDrive(filesToUpload, folderMap, rootFolderId);
  };

  /** 📂 Xử lý upload file riêng lẻ */
  const handleFileUpload = async (singleFiles, rootFolderId) => {
    const filesToUpload = Array.from(singleFiles).map((file) => ({
      file,
      folderPath: "", // Không có thư mục con
    }));

    // Upload file vào thư mục gốc
    await uploadFilesToDrive(filesToUpload, {}, rootFolderId);
  };

  /** 🔍 Xử lý danh sách file từ thư mục */
  const processFiles = async (folderFiles) => {
    const folderMap = {};
    let filesToUpload = [];

    for (let file of folderFiles) {
      const relativePath = file.webkitRelativePath;
      const pathParts = relativePath.split("/");
      pathParts.pop(); // Loại bỏ tên file, chỉ giữ thư mục
      const folderPath = pathParts.join("/");

      if (folderPath && !folderMap[folderPath]) {
        folderMap[folderPath] = null; // Đánh dấu thư mục cần tạo
      }

      filesToUpload.push({ file, folderPath });
    }

    return { folderMap, filesToUpload };
  };

  /** 🏗️ Tạo thư mục trên Google Drive */
  const createFoldersOnDrive = async (folderMap, rootFolderId) => {
    let folderPathList = Object.keys(folderMap);
    folderPathList.sort((a, b) => a.split("/").length - b.split("/").length);

    for (const folderPath of folderPathList) {
      if (!folderPath.trim()) continue;

      const pathParts = folderPath.split("/");
      let parentFolderId = rootFolderId;
      let currentPath = "";

      for (const folderName of pathParts) {
        if (!folderName.trim()) continue;

        currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;

        if (!folderMap[currentPath]) {
          const response = await fetch(`${baseUrl}api/v1/create_folder`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              parent_folder_id: parentFolderId,
              folder_name: folderName.trim(),
            }),
          });

          const data = await response.json();
          if (data.folder_id) {
            folderMap[currentPath] = data.folder_id;
            parentFolderId = data.folder_id;
          } else {
            showMessage(`❌ Không thể tạo thư mục "${folderName}".`, "error");
            return;
          }
        } else {
          parentFolderId = folderMap[currentPath];
        }
      }
    }
  };

  /** 📤 Upload file lên Google Drive */
  const uploadFilesToDrive = async (filesToUpload, folderMap, rootFolderId) => {
    let uploadPromises = filesToUpload.map(({ file, folderPath }) => {
      let parentFolderId = rootFolderId;

      if (folderPath) {
        let fullPath = folderPath
          .split("/")
          .map((_, idx, arr) => arr.slice(0, idx + 1).join("/"))
          .reverse();

        for (const path of fullPath) {
          if (folderMap[path]) {
            parentFolderId = folderMap[path];
            break;
          }
        }
      }

      const formData = new FormData();
      formData.append("file", file);

      return fetch(`${baseUrl}api/v1/upload_file?folder_id=${parentFolderId}`, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.file_id) {
            showMessage(
              `✅ Tải file "${file.name}" lên thành công!`,
              "success"
            );
          } else {
            showMessage(`❌ Tải file "${file.name}" thất bại!`, "error");
          }
        })
        .catch((error) => {
          console.error(`⚠️ Lỗi khi tải file "${file.name}":`, error);
          showMessage(`Lỗi khi tải file "${file.name}" lên.`, "error");
        });
    });

    await Promise.all(uploadPromises);
  };

  if (!document.getElementById("upload-button").dataset.listenerAdded) {
    document.getElementById("upload-button").addEventListener("click", handleUpload);
    document.getElementById("upload-button").dataset.listenerAdded = "true"; // Đánh dấu đã thêm sự kiện
  }

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

  if (!saveButton.dataset.listenerAdded) {
    saveButton.addEventListener("click", onSave);
    saveButton.dataset.listenerAdded = "true"; // Đánh dấu đã thêm sự kiện
  }

  const onDelete = () => {
    console.log(selectedLinks);

    if (selectedLinks.length === 0) {
      showMessage("Vui lòng chọn ít nhất một liên kết để xóa!", "error");
      return;
    }

    const confirmDelete = confirm(
      "Bạn có chắc chắn muốn xóa các liên kết đã chọn?"
    );
    if (!confirmDelete) return;

    selectedLinks.forEach((link) => {
      const fileId = extractFileId(link);
      if (fileId) {
        deleteLinkAPI(fileId);
      } else {
        showMessage(`Không thể xác định fileId từ link: ${link}`, "error");
      }
    });

    hidePopup();
  };

  if (!deleteButton.dataset.listenerAdded) {
    deleteButton.addEventListener("click", onDelete);
    deleteButton.dataset.listenerAdded = "true"; // Đánh dấu đã thêm sự kiện
  }

  if (!cancelButton.dataset.listenerAdded) {
    cancelButton.addEventListener("click", hidePopup);
    cancelButton.dataset.listenerAdded = "true"; // Đánh dấu đã thêm sự kiện
  }
  
  function extractFileId(url) {
    const match = url.match(/(?:\/d\/|\/folders\/)([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
}

  function deleteLinkAPI(fileId) {
    const token = getCookie("token");
    if (!token) {
      showMessage("Bạn chưa đăng nhập hoặc token không hợp lệ.", "error");
      return;
    }

    const apiUrl = `${baseUrl}api/v1/delete_file`;
    const requestData = { file_id: fileId };

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showMessage(`Xóa thành công file ID: ${fileId}`, "success");
          setTimeout(() => {
            location.reload();
          }, 1000);
        } else {
          showMessage(`Xóa thất bại: ${data.message}`, "error");
        }
      })
      .catch((error) => {
        console.error("Lỗi khi gọi API xóa:", error);
        showMessage("Có lỗi xảy ra khi xóa!", "error");
      });
  }

  function hidePopup() {
    const popup = document.getElementById("popup-container");
    if (popup) {
      popup.remove(); // Thay đổi từ hidePopup thành remove
    }
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

  // Xóa popup-container cũ nếu tồn tại
  const existingPopup = document.getElementById("popup-container");
  if (existingPopup) {
    existingPopup.remove();
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
        // setTimeout(() => {
        //   location.reload();
        // }, 1000);
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
