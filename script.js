document.addEventListener("DOMContentLoaded", function () {
  // Initialize all tool modules
  if (typeof initImageTools === "function") initImageTools();
  if (typeof initPdfTools === "function") initPdfTools();
  if (typeof initDocumentTools === "function") initDocumentTools();
  if (typeof initTextTools === "function") initTextTools();
  if (typeof initAudioTools === "function") initAudioTools();

  // Image compression level display (kept here as it's UI-only)
  const compressionSlider = document.getElementById("image-compression-level");
  const compressionValue = document.getElementById("compression-value");
  if (compressionSlider && compressionValue) {
    compressionSlider.addEventListener("input", function () {
      compressionValue.textContent = this.value + "%";
    });
  }
});
