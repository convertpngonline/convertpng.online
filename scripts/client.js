document.addEventListener('DOMContentLoaded', function () {
  const fileInput = document.getElementById('fileInput');
  const formatSelect = document.getElementById('formatSelect');
  const convertButton = document.getElementById('convertButton');
  const uploadStatus = document.getElementById('uploadStatus');
  const chooseFileButton = document.getElementById('chooseFileButton');
  const closeStatusButton = document.getElementById('closeStatus');

  let selectedFile = null;
  let selectedFormat = 'jpg';

  if (!fileInput || !formatSelect || !convertButton || !uploadStatus || !chooseFileButton || !navToggle || !mobileMenu || !closeStatusButton) {
    console.error('Required elements are missing.');
    return;
  }

  chooseFileButton.addEventListener('click', function () {
    fileInput.click();
  });

  fileInput.addEventListener('change', handleFileInputChange, false);

  function handleFileInputChange(e) {
    selectedFile = e.target.files[0];
    updateUploadStatus('info');
  }

  function updateUploadStatus(type) {
    uploadStatus.classList.remove('hidden');
    
    if (type === 'error') {
      uploadStatus.classList.add('bg-red-500', 'text-white');
      uploadStatus.classList.remove('bg-green-500');
      uploadStatus.querySelector('#uploadStatusMessage').textContent = `${selectedFile ? `File "${selectedFile.name}" could not be processed.` : 'No file selected.'}`;
    } else if (type === 'success') {
      uploadStatus.classList.add('bg-green-500', 'text-white');
      uploadStatus.classList.remove('bg-red-500');
      uploadStatus.querySelector('#uploadStatusMessage').textContent = `Conversation successful. Download will start shortly. please wait.`;
    } else {
      uploadStatus.classList.add('bg-blue-500', 'text-white');
      uploadStatus.classList.remove('bg-red-500', 'bg-green-500');
      uploadStatus.querySelector('#uploadStatusMessage').textContent = `File "${selectedFile ? selectedFile.name : 'not selected'}" has been selected.`;
    }
  }

  formatSelect.addEventListener('change', function () {
    selectedFormat = formatSelect.value;
  });

  convertButton.addEventListener('click', function () {
    if (selectedFile) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = function () {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const dataUrl = canvas.toDataURL(`image/${selectedFormat}`);
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `image.${selectedFormat}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          updateUploadStatus('success');
        };

        img.onerror = function () {
          updateUploadStatus('error');
        };

        img.src = e.target.result;
      };

      reader.onerror = function () {
        updateUploadStatus('error');
      };

      reader.readAsDataURL(selectedFile);
    } else {
      return
      window.location.reload()
    }
  });

  if (closeStatusButton) {
    closeStatusButton.addEventListener('click', function () {
      uploadStatus.classList.add('hidden');
    });
  }
});
