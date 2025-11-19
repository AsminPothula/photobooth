const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const strip = document.getElementById('photostrip');
const countdown = document.getElementById('countdown');
const startBtn = document.getElementById('start-btn');
const redoBtn = document.getElementById('redo-btn');
const saveBtn = document.getElementById('save-btn');

let photos = [];

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => alert("Camera access denied."));

startBtn.onclick = async () => {
  photos = [];
  for (let i = 0; i < 3; i++) {
    await showCountdown(3);
    const photo = capturePhoto();
    photos.push(photo);
  }

  const stripImage = await mergePhotos(photos);
  strip.src = stripImage;
  strip.style.top = '0px'; // make it fall  

  redoBtn.disabled = false;
  saveBtn.disabled = false;
};

redoBtn.onclick = () => location.reload();

saveBtn.onclick = () => {
  const a = document.createElement('a');
  a.href = strip.src;
  a.download = 'photostrip.png';
  a.click();
};

function showCountdown(seconds) {
  return new Promise(resolve => {
    countdown.style.display = 'block';
    let count = seconds;
    countdown.textContent = count;

    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        countdown.style.display = 'none';
        resolve();
      } else {
        countdown.textContent = count;
      }
    }, 1000);
  });
}

function capturePhoto() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  return canvas.toDataURL('image/png');
}

function mergePhotos(images) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 378;
    canvas.height = 1072;
    const ctx = canvas.getContext('2d');

    const template = new Image();
    template.src = 'assets/design2.png';

    const positions = [56, 327, 592]; // Y-coordinates of the 3 photo slots
    const photoWidth = 305;
    const photoHeight = 220;
    const photoX = 41; // Horizontal offset to center the photo inside the slot

    let loaded = 0;

    images.forEach((imgSrc, i) => {
      const img = new Image();
      img.src = imgSrc;

      img.onload = () => {
        ctx.drawImage(img, photoX, positions[i], photoWidth, photoHeight);
        loaded++;
        if (loaded === images.length) {
          // Draw your transparent PNG on top after photos are in place
          template.onload = () => {
            ctx.drawImage(template, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/png'));
          };
        }
      };

      img.onerror = () => {
        console.error("Photo failed to load");
        loaded++;
      };
    });
  });
}
