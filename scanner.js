(function(){
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const captureBtn = document.getElementById('capture');
    const retakeBtn = document.getElementById('retake');
    const addBtn = document.getElementById('add');
    const finishBtn = document.getElementById('finish');
    const review = document.getElementById('review');
    const scannerView = document.getElementById('scanner-view');
    const pagesDiv = document.getElementById('pages');
    const pages = [];

    const session = new URLSearchParams(window.location.search).get('session');

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
            video.srcObject = stream;
        }).catch(err => {
            alert('Camera access failed: ' + err);
        });

    captureBtn.addEventListener('click', () => {
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        const cropW = vw * 0.8;
        const cropH = vh * 0.8;
        const offsetX = vw * 0.1;
        const offsetY = vh * 0.1;
        canvas.width = cropW;
        canvas.height = cropH;
        canvas.getContext('2d').drawImage(video, offsetX, offsetY, cropW, cropH, 0, 0, cropW, cropH);
        const dataUrl = canvas.toDataURL('image/jpeg');
        pages.push(dataUrl);
        showReview();
    });

    retakeBtn.addEventListener('click', () => {
        pages.pop();
        showScanner();
    });

    addBtn.addEventListener('click', () => {
        showScanner();
    });

    finishBtn.addEventListener('click', async () => {
        const pdfDoc = await PDFLib.PDFDocument.create();
        for (const img of pages) {
            const imgBytes = await fetch(img).then(res => res.arrayBuffer());
            const jpg = await pdfDoc.embedJpg(imgBytes);
            const page = pdfDoc.addPage([jpg.width, jpg.height]);
            page.drawImage(jpg, { x: 0, y: 0, width: jpg.width, height: jpg.height });
        }
        const pdfBytes = await pdfDoc.save();
        const pdfData = 'data:application/pdf;base64,' + btoa(String.fromCharCode.apply(null, new Uint8Array(pdfBytes)));
        await fetch('upload_scan.php', { method: 'POST', body: new URLSearchParams({ session, data: pdfData }) });
        window.location.href = 'index.html?session=' + encodeURIComponent(session);
    });

    function showReview() {
        scannerView.style.display = 'none';
        review.style.display = 'block';
        updatePages();
    }

    function showScanner() {
        review.style.display = 'none';
        scannerView.style.display = 'block';
    }

    function updatePages() {
        pagesDiv.innerHTML = '';
        pages.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.style.width = '100%';
            pagesDiv.appendChild(img);
        });
    }
})();
