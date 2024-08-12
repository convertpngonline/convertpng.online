document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('fileInput');
    const formatSelect = document.getElementById('formatSelect');
    const convertButton = document.getElementById('convertButton');
    const uploadStatus = document.getElementById('uploadStatus');
    const chooseFileButton = document.getElementById('chooseFileButton');
    const closeStatusButton = document.getElementById('closeStatus');

    let selectedFiles = [];
    let selectedFormat = 'jpg';

    if (!fileInput || !formatSelect || !convertButton || !uploadStatus || !chooseFileButton || !closeStatusButton) {
        console.error('Required elements are missing.');
        return;
    }

    chooseFileButton.addEventListener('click', function () {
        fileInput.click();
    });

    fileInput.addEventListener('change', handleFileInputChange, false);

    function handleFileInputChange(e) {
        selectedFiles = Array.from(e.target.files);
        updateUploadStatus('info');
    }

    function updateUploadStatus(type) {
        uploadStatus.classList.remove('hidden');

        if (type === 'error') {
            uploadStatus.classList.add('bg-red-500', 'text-white');
            uploadStatus.classList.remove('bg-green-500');
            uploadStatus.querySelector('#uploadStatusMessage').textContent = `${selectedFiles.length > 0 ? `Files could not be processed.` : 'No files selected.'}`;
        } else if (type === 'success') {
            uploadStatus.classList.add('bg-green-500', 'text-white');
            uploadStatus.classList.remove('bg-red-500');
            uploadStatus.querySelector('#uploadStatusMessage').textContent = `Conversion successful. Download will start shortly. Please wait.`;
        } else {
            uploadStatus.classList.add('bg-blue-500', 'text-white');
            uploadStatus.classList.remove('bg-red-500', 'bg-green-500');
            uploadStatus.querySelector('#uploadStatusMessage').textContent = `${selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected.` : 'No files selected.'}`;
        }
    }

    formatSelect.addEventListener('change', function () {
        selectedFormat = formatSelect.value;
    });

    convertButton.addEventListener('click', function () {
        if (selectedFiles.length > 0) {
            if (selectedFiles.length === 1) {
                convertSingleFile(selectedFiles[0]);
            } else {
                convertMultipleFiles(selectedFiles);
            }
        } else {
            updateUploadStatus('error');
        }
    });

    function convertSingleFile(file) {
        if (selectedFormat === 'svg' && file.type === 'image/svg+xml') {
            // Directly download SVG files
            const a = document.createElement('a');
            a.href = URL.createObjectURL(file);
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            updateUploadStatus('success');
        } else {
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

            reader.readAsDataURL(file);
        }
    }

    function convertMultipleFiles(files) {
        const zip = new JSZip();

        Promise.all(files.map(file => {
            return new Promise((resolve, reject) => {
                if (selectedFormat === 'svg' && file.type === 'image/svg+xml') {
                    file.text().then(svgText => {
                        zip.file(file.name, svgText);
                        resolve();
                    }).catch(() => reject());
                } else {
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
                            const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
                            zip.file(`${file.name.split('.')[0]}.${selectedFormat}`, base64Data, { base64: true });
                            resolve();
                        };

                        img.onerror = function () {
                            reject();
                        };

                        img.src = e.target.result;
                    };

                    reader.onerror = function () {
                        reject();
                    };

                    reader.readAsDataURL(file);
                }
            });
        })).then(() => {
            zip.generateAsync({ type: 'blob' }).then(function (content) {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(content);
                a.download = 'images.zip';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                updateUploadStatus('success');
            });
        }).catch(() => {
            updateUploadStatus('error');
        });
    }

    if (closeStatusButton) {
        closeStatusButton.addEventListener('click', function () {
            uploadStatus.classList.add('hidden');
        });
    }
});