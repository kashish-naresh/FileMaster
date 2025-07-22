function initImageTools() {
  // Image Format Converter
  document
    .getElementById("convert-image-btn")
    ?.addEventListener("click", function () {
      const inputFile = document.getElementById("image-convert-input").files[0];
      if (!inputFile) {
        alert("Please select an image file first");
        return;
      }
      const outputFormat = document.getElementById("image-output-format").value;
      convertImageFormat(inputFile, outputFormat);
    });

  // Image to PDF
  document
    .getElementById("image-to-pdf-btn")
    ?.addEventListener("click", function () {
      const inputFiles = document.getElementById("image-to-pdf-input").files;
      if (inputFiles.length === 0) {
        alert("Please select at least one image file");
        return;
      }
      const orientation = document.getElementById("pdf-orientation").value;
      convertImagesToPdf(inputFiles, orientation);
    });

  // Image Compressor
  document
    .getElementById("compress-image-btn")
    ?.addEventListener("click", function () {
      const inputFile = document.getElementById("image-compress-input")
        .files[0];
      if (!inputFile) {
        alert("Please select an image file first");
        return;
      }
      const quality =
        document.getElementById("image-compression-level").value / 100;
      compressImage(inputFile, quality);
    });

  // Actual implementation functions
  function convertImageFormat(file, outputFormat) {
    const resultDiv = document.getElementById("image-convert-result");
    resultDiv.innerHTML =
      '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div> Processing...';

    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          function (blob) {
            const url = URL.createObjectURL(blob);
            const fileName =
              file.name.replace(/\.[^/.]+$/, "") + "." + outputFormat;

            resultDiv.innerHTML = `
                        <div class="alert alert-success">
                            Conversion complete! 
                            <a href="${url}" download="${fileName}" class="btn btn-sm btn-success ms-2">Download ${outputFormat.toUpperCase()}</a>
                        </div>
                        <div class="text-center mt-2">
                            <img src="${url}" class="img-fluid rounded" style="max-height: 200px;" alt="Converted image">
                        </div>
                    `;
          },
          "image/" + outputFormat,
          0.92
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function compressImage(file, quality) {
    const resultDiv = document.getElementById("image-compress-result");
    resultDiv.innerHTML =
      '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div> Processing...';

    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          function (blob) {
            const url = URL.createObjectURL(blob);
            const fileName = "compressed_" + file.name;
            const originalSize = (file.size / 1024).toFixed(2);
            const compressedSize = (blob.size / 1024).toFixed(2);
            const ratio = (((file.size - blob.size) / file.size) * 100).toFixed(
              2
            );

            resultDiv.innerHTML = `
                        <div class="alert alert-success">
                            Compression complete! Reduced by ${ratio}% (${originalSize}KB → ${compressedSize}KB)
                            <a href="${url}" download="${fileName}" class="btn btn-sm btn-success ms-2">Download</a>
                        </div>
                        <div class="row mt-2">
                            <div class="col-md-6 text-center">
                                <p class="mb-1"><strong>Original</strong> (${originalSize}KB)</p>
                                <img src="${URL.createObjectURL(
                                  file
                                )}" class="img-fluid rounded" style="max-height: 150px;" alt="Original image">
                            </div>
                            <div class="col-md-6 text-center">
                                <p class="mb-1"><strong>Compressed</strong> (${compressedSize}KB)</p>
                                <img src="${url}" class="img-fluid rounded" style="max-height: 150px;" alt="Compressed image">
                            </div>
                        </div>
                    `;
          },
          file.type,
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function convertImagesToPdf(files, orientation) {
    const resultDiv = document.getElementById("image-to-pdf-result");
    resultDiv.innerHTML =
      '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div> Processing...';

    // Using jsPDF for actual PDF generation
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = function () {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: orientation === "landscape" ? "landscape" : "portrait",
        unit: "mm",
      });

      Promise.all(
        Array.from(files).map((file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function (e) {
              resolve(e.target.result);
            };
            reader.readAsDataURL(file);
          });
        })
      ).then((images) => {
        images.forEach((imgData, i) => {
          if (i > 0) doc.addPage();
          doc.addImage(imgData, "JPEG", 10, 10, 180, 0);
        });

        const pdfUrl = URL.createObjectURL(doc.output("blob"));
        const fileName = "converted_" + Date.now() + ".pdf";

        resultDiv.innerHTML = `
                    <div class="alert alert-success">
                        PDF created with ${files.length} images! 
                        <a href="${pdfUrl}" download="${fileName}" class="btn btn-sm btn-success ms-2">Download PDF</a>
                    </div>
                `;
      });
    };
    document.head.appendChild(script);
  }
}
