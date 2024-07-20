// Get the video element from the DOM
const video = document.getElementById('video');

// Load the face-api.js models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo).catch(err => console.error('Error loading models:', err));

// Function to start video streaming
function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => console.error('Error accessing webcam:', err));
}

// Add an event listener for when the video starts playing
video.addEventListener('play', () => {
  // Create a canvas to overlay on the video
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  // Function to detect and draw face information
  const detectAndDrawFaces = async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    
    // Clear the canvas before drawing
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw detections, landmarks, and expressions
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  };

  // Run the detection function at a regular interval
  const interval = setInterval(detectAndDrawFaces, 100);

  // Optional: Clear the interval if the video is paused or stopped
  video.addEventListener('pause', () => clearInterval(interval));
  video.addEventListener('ended', () => clearInterval(interval));
});
