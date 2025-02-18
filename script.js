// Utility function to format file size
function formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const viewToggle = document.getElementById('viewToggle');
const fileList = document.getElementById('fileList');
const fileGrid = document.getElementById('fileGrid');
const progressContainer = document.querySelector('.progress-container');
const progressBar = document.getElementById('uploadProgress');
const progressText = document.querySelector('.progress-text');

// View state
let isGridView = false;

// Event Listeners
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});
dropZone.addEventListener('drop', handleFileDrop);
fileInput.addEventListener('change', handleFileSelect);
viewToggle.addEventListener('click', toggleView);

// File handling functions
function handleFileDrop(e) {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length === 0) return;
    
    const file = files[0];
    const allowedTypes = [
        'application/vnd.android.package-archive',
        'application/x-msdownload'
    ];
    
    if (!allowedTypes.includes(file.type)) {
        alert('Only .exe and .apk files are allowed');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
    }
    
    uploadFile(file);
}

function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const xhr = new XMLHttpRequest();
    
    xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
            const percent = (event.loaded / event.total) * 100;
            updateProgress(percent);
        }
    };
    
    xhr.onload = () => {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.response);
            updateFileList();
            resetProgress();
        } else {
            alert('Upload failed: ' + xhr.statusText);
            resetProgress();
        }
    };
    
    xhr.onerror = () => {
        alert('Upload failed');
        resetProgress();
    };
    
    progressContainer.style.display = 'block';
    xhr.open('POST', '/api/files');
    xhr.send(formData);
}

function updateProgress(percent) {
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `${Math.round(percent)}%`;
}

function resetProgress() {
    progressContainer.style.display = 'none';
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
}

// View functions
function toggleView() {
    isGridView = !isGridView;
    fileList.style.display = isGridView ? 'none' : 'flex';
    fileGrid.style.display = isGridView ? 'grid' : 'none';
}

function updateFileList() {
    fetch('/api/files')
        .then(response => response.json())
        .then(files => {
            renderFiles(files);
        })
        .catch(error => {
            console.error('Error fetching files:', error);
        });
}

function renderFiles(files) {
    // List view
    fileList.innerHTML = files.map(file => `
        <div class="file-item">
            <div class="file-info">
                <svg class="file-icon" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div class="file-details">
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${formatFileSize(file.size)}</span>
                </div>
            </div>
            <button class="download-button" onclick="downloadFile(${file.id})">
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
    `).join('');
    
    // Grid view
    fileGrid.innerHTML = files.map(file => `
        <div class="grid-item">
            <svg class="file-icon" viewBox="0 0 24 24" width="40" height="40">
                <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="file-details">
                <span class="file-name">${file.name}</span>
                <span class="file-size">${formatFileSize(file.size)}</span>
            </div>
            <button class="download-button" onclick="downloadFile(${file.id})">
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
    `).join('');
}

function downloadFile(id) {
    fetch(`/api/files/${id}`)
        .then(response => response.json())
        .then(file => {
            const link = document.createElement('a');
            link.href = `data:${file.type};base64,${file.data}`;
            link.download = file.name;
            link.click();
        })
        .catch(error => {
            console.error('Error downloading file:', error);
            alert('Download failed');
        });
}

// Initial load
updateFileList();
