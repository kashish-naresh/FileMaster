function initPdfTools() {
  // PDF to Text
  document
    .getElementById("pdf-to-text-btn")
    ?.addEventListener("click", async function () {
      const inputFile = document.getElementById("pdf-to-text-input").files[0];
      if (!inputFile) {
        alert("Please select a PDF file first");
        return;
      }
      await extractTextFromPdf(inputFile);
    });

  // PDF Compressor
  document
    .getElementById("compress-pdf-btn")
    ?.addEventListener("click", async function () {
      const inputFile = document.getElementById("pdf-compress-input").files[0];
      if (!inputFile) {
        alert("Please select a PDF file first");
        return;
      }
      const level = document.getElementById("pdf-compression-level").value;
      await compressPdf(inputFile, level);
    });

  // PDF to Images
  document
    .getElementById("pdf-to-image-btn")
    ?.addEventListener("click", async function () {
      const inputFile = document.getElementById("pdf-to-image-input").files[0];
      if (!inputFile) {
        alert("Please select a PDF file first");
        return;
      }
      const format = document.getElementById("pdf-to-image-format").value;
      await convertPdfToImages(inputFile, format);
    });

  // Implementation functions
  async function extractTextFromPdf(file) {
    const resultDiv = document.getElementById("pdf-to-text-result");
    resultDiv.innerHTML =
      '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div> Processing...';

    try {
      // Dynamically load PDF.js if not already loaded
      if (typeof pdfjsLib === "undefined") {
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js"
        );
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js";
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText +=
          textContent.items.map((item) => item.str).join(" ") + "\n\n";
      }

      resultDiv.querySelector("textarea").value = fullText;
    } catch (error) {
      resultDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
  }

  async function compressPdf(file, level) {
    const resultDiv = document.getElementById("pdf-compress-result");
    resultDiv.innerHTML =
      '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div> Processing...';

    try {
      // Dynamically load PDF-lib if not already loaded
      if (typeof PDFLib === "undefined") {
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"
        );
      }

      const pdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);

      // Set compression based on level
      const quality = level === "high" ? 0.3 : level === "medium" ? 0.6 : 0.8;
      pdfDoc.setProducer("FileMaster PDF Compressor");

      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        // Add more compression options here
      });

      const compressedSize = (compressedBytes.byteLength / 1024).toFixed(2);
      const originalSize = (file.size / 1024).toFixed(2);
      const ratio = (
        ((file.size - compressedBytes.byteLength) / file.size) *
        100
      ).toFixed(2);

      const blob = new Blob([compressedBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const fileName = "compressed_" + file.name;

      resultDiv.innerHTML = `
                <div class="alert alert-success">
                    PDF compressed! Reduced by ${ratio}% (${originalSize}KB → ${compressedSize}KB)
                    <a href="${url}" download="${fileName}" class="btn btn-sm btn-success ms-2">Download PDF</a>
                </div>
            `;
    } catch (error) {
      resultDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
  }

  async function convertPdfToImages(file, format) {
    const resultDiv = document.getElementById("pdf-to-image-result");
    resultDiv.innerHTML =
      '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div> Processing...';

    try {
      // Dynamically load PDF.js if not already loaded
      if (typeof pdfjsLib === "undefined") {
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js"
        );
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js";
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const images = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        images.push(canvas.toDataURL("image/" + format));
      }

      // Create ZIP file of all images
      if (typeof JSZip === "undefined") {
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"
        );
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"
        );
      }

      const zip = new JSZip();
      images.forEach((img, index) => {
        const base64Data = img.split(",")[1];
        zip.file(`page_${index + 1}.${format}`, base64Data, { base64: true });
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const fileName = file.name.replace(".pdf", "") + "_pages.zip";

      resultDiv.innerHTML = `
                <div class="alert alert-success">
                    Converted ${images.length} pages to ${format.toUpperCase()}!
                    <a href="${url}" download="${fileName}" class="btn btn-sm btn-success ms-2">Download ZIP</a>
                </div>
                <div class="mt-3">
                    ${images
                      .map(
                        (img, i) => `
                        <img src="${img}" class="img-thumbnail me-2 mb-2" style="max-height: 150px;" alt="Page ${
                          i + 1
                        }">
                    `
                      )
                      .join("")}
                </div>
            `;
    } catch (error) {
      resultDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
  }

  async function loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}
