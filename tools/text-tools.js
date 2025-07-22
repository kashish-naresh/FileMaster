function initTextTools() {
  // Image to Text (OCR)
  document
    .getElementById("image-to-text-btn")
    ?.addEventListener("click", function () {
      const inputFile = document.getElementById("image-to-text-input").files[0];
      if (!inputFile) {
        alert("Please select an image file first");
        return;
      }
      extractTextFromImage(inputFile);
    });

  // Audio to Text
  document
    .getElementById("audio-to-text-btn")
    ?.addEventListener("click", function () {
      const inputFile = document.getElementById("audio-to-text-input").files[0];
      if (!inputFile) {
        alert("Please select an audio file first");
        return;
      }
      const language = document.getElementById("audio-language").value;
      transcribeAudio(inputFile, language);
    });

  // Video to Text
  document
    .getElementById("video-to-text-btn")
    ?.addEventListener("click", function () {
      const inputFile = document.getElementById("video-to-text-input").files[0];
      if (!inputFile) {
        alert("Please select a video file first");
        return;
      }
      const language = document.getElementById("video-language").value;
      extractTextFromVideo(inputFile, language);
    });

  // Implementation functions
  function extractTextFromImage(file) {
    const resultDiv = document.getElementById("image-to-text-result");
    resultDiv.innerHTML =
      '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div> Processing...';

    Tesseract.recognize(
      file,
      "eng", // Default to English
      { logger: (m) => console.log(m) }
    )
      .then(({ data: { text } }) => {
        resultDiv.querySelector("textarea").value = text;
      })
      .catch((err) => {
        resultDiv.innerHTML = `<div class="alert alert-danger">OCR Error: ${err.message}</div>`;
      });
  }

  function transcribeAudio(file, language) {
    // Would require Web Speech API or a service
  }

  function extractTextFromVideo(file, language) {
    // Would require video processing and speech recognition
  }
}
