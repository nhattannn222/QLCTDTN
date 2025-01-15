import { showMessage } from "./floating_message.js";

let baseUrl = document.body.getAttribute("data-base-url");
if (baseUrl !== "/qldt/") {
  baseUrl = "";
}

// Function to show the popup for file upload
export function showEditPopup(button) {
    const row = button.closest("tr"); // Get the row where the button was clicked
    
    if (!row) {
      showMessage("Không tìm thấy dòng dữ liệu!", "error");
      return;
    }
  
    const urlFolderElement = row.querySelector(".link");
    
    const urlFolder = urlFolderElement ? urlFolderElement.value : ""; // Safely get the textContent
  
    if (!urlFolder) {
      showMessage("Không tìm thấy Mã Báo Cáo!", "error");
      return;
    }
  
    // Show the popup for file upload
    showPopup(urlFolder);
}

// Function to display the popup for file upload
function showPopup(urlFolder) {
  const popup = document.getElementById("popup-container");
  const saveButton = document.getElementById("popup-save");
  const cancelButton = document.getElementById("popup-cancel");
  const fileInput = document.getElementById("file-upload");
  console.log(urlFolder);
  
  // Show the popup
  popup.style.display = "flex";

  // Save button click event for file upload
  saveButton.addEventListener("click", () => {
      const files = fileInput.files; // Get the list of selected files
      if (files.length > 0) {
          uploadFiles(urlFolder, files); // Pass the file list to uploadFiles
          hidePopup();
      } else {
          showMessage("Vui lòng chọn ít nhất một tệp để tải lên!", "error");
      }
  });

  // Cancel button click event
  cancelButton.addEventListener("click", hidePopup);

  // Hide the popup
  function hidePopup() {
      popup.style.display = "none";
      saveButton.removeEventListener("click", uploadFiles);
      cancelButton.removeEventListener("click", hidePopup);
  }
}

function uploadFiles(urlFolder, files) {
  if (!files || !(files instanceof FileList)) {
      console.error("Invalid files input:", files);
      return;
  }

  const token = getCookie("token");
  if (!token) {
      alert("Bạn chưa đăng nhập hoặc token không hợp lệ.");
      return;
  }

  const formData = new FormData();
  for (const file of files) {
      formData.append("files", file);
  }
  let folder_id = extractFolderId(urlFolder)

  const url = `${document.body.dataset.baseUrl}api/v1/upload_bctdg?folder_id=${folder_id}`;

  fetch(url, {
      method: "POST",
      headers: {
          Authorization: `Bearer ${token}`,
      },
      body: formData,
  })
      .then((response) => response.json())
      .then((data) => {
          if (data.uploaded_files) {
            showMessage("Tải tệp lên thành công!")
              setTimeout(() => {
                  location.reload(); // Reload trang sau khi tải lên thành công
              }, 1000);
          } else {
            showMessage("Tải tệp lên thất bại!", "error")
          }
      })
      .catch((error) => {
          console.error("Error uploading files:", error);
          alert("Tải tệp lên thất bại!");
      });
}

function extractFolderId(folderUrl) {
  const match = folderUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// Function to get cookie value by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
}
