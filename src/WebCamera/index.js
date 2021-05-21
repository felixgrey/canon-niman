const defaultConfig = {
  container: null,
}

const defaultConstraints = {
  audio: true,
  video: {
    facingMode: "user",
  },
};

const defaultOptions = {
  // TODO
};

const mimeTypes = [
  'video/mp4;codecs="avc1.42E01E, mp4a.40.2"',
  "video/webm;codecs=vp8",
  "video/webm;codecs=daala",
  "video/webm;codecs=h264",
  "audio/webm;codecs=opus",

  "video/mpeg",
  "video/webm",
  "audio/webm",
];

export function dataURLtoBlob(dataurl) {
  let arr = dataurl.split(',')
  let mime = arr[0].match(/:(.*?);/)[1]
  let suffix = mime.split('/')[1] || '';
  let bstr = atob(arr[1])
  let n = bstr.length
  let u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], {
    type: mime
  })
}


function getFileName(blob, index) {
  let name = 'file' + index;
  let ext = '';
  const type = blob.type || '';
  if (type.includes('video')) {
    name = 'video' + index;
    ext = '.mp4';
  } else if (type.includes('image')) {
    name = 'image' + index;
    ext = '.png';
  } else if (type.includes('audio')) {
    name = 'audio' + index;
    ext = '.mp3';
  }
  return `${name}${ext}`;
}

export function toFiles(blobs, callback = getFileName) {
  return blobs.map((blob, i) => {
    return new File([blob], getFileName(blob, i));
  });
}

export function dataURLtoFile(base64) {
  return toFiles([dataURLtoBlob(base64)])[0];
}

//访问用户媒体设备的兼容方法
async function getUserMedia(constraints = {}) {

  const newConstraints = {
    ...defaultConstraints,
    ...constraints,
  };
  if (constraints.video !== null && typeof constraints.video === 'object') {
    newConstraints.video = {
      ...defaultConstraints.video,
      ...constraints.video
    };
  }
  constraints = newConstraints;

  return new Promise((success, error) => {
    if (navigator.mediaDevices === undefined) {
      navigator.mediaDevices = {};
    }

    if (navigator.mediaDevices.getUserMedia) {
      //最新的标准API
      navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error);
    } else if (navigator.webkitGetUserMedia) {
      //webkit核心浏览器
      navigator.webkitGetUserMedia(constraints, success, error)
    } else if (navigator.mozGetUserMedia) {
      //firfox浏览器
      navigator.mozGetUserMedia(constraints, success, error);
    } else if (navigator.getUserMedia) {
      //旧版API
      navigator.getUserMedia(constraints, success, error);
    } else {
      error('not support camra');
    }
  });
}

export default class WebCamera {
  constructor(config = {}) {
    this.config = {
      ...defaultConfig,
      ...config,
    };
    this.toFiles = toFiles;
  }

  onCameraChange() {};

  // 摄影中
  shooting = false;

  // 播放中
  playing = false;

  // 视频
  videos = [];

  // 相片
  photos = [];

  _checkAble() {
    if (!this.container || !this.video || !this.stream) {
      return false;
    }
    return true;
  }

  // 连接设备
  async connect(container = this.config.container, constraints = {}, options = {}) {

    if (typeof container === 'string') {
      this.container = document.getElementById(container);
    } else {
      this.container = container;
    }

    if (this.container) {
      const {
        offsetWidth,
        offsetHeight,
      } = this.container;

      if (!constraints.hasOwnProperty('video')) {
        constraints.video = {};
      }
      if (typeof constraints.video === 'object') {
        if (!constraints.video.hasOwnProperty('width')) {
          constraints.video.width = offsetWidth;
        }
        if (!constraints.video.hasOwnProperty('height')) {
          constraints.video.height = offsetHeight;
        }
      }

      this.constraints = constraints;
      this.stream = await getUserMedia(constraints);

      this.video = document.createElement('video');
      this.video.style.width = '100%';
      this.video.style.height = '100%';

      this.video.onloadedmetadata = (e) => {
        this.video.play();
      };
      this.container.appendChild(this.video);

      this.videoPlayer = document.createElement('video');
      this.videoPlayer.style.display = 'none';
      this.container.appendChild(this.videoPlayer);
      this.videoPlayer.onended = () => this.stop();

      if ("srcObject" in this.video) {
        this.video.srcObject = this.stream;
      } else {
        this.video.src = window.URL.createObjectURL(this.stream);
      }

      this.options = {
        ...defaultOptions,
        ...options,
      };
    }
    this.onCameraChange();
    return this.stream;
  }

  // 开始录像
  startShooting(save = true) {
    if (!this._checkAble() || !window.MediaRecorder) {
      return;
    }

    let theResolve;
    this.videotape = new Promise((resolve) => {
      theResolve = resolve;
    });

    this.mediaRecorder = new MediaRecorder(this.stream, {
      ...this.options
    });
    const chunks = [];
    let mimeType = "video/x-matroska;codecs=avc1,opus";
    this.mediaRecorder.ondataavailable = (e) => {
      mimeType = e.data.type || mimeType;
      chunks.push(e.data);
    };

    this.mediaRecorder.onstop = () => {
      const binData = new Blob(chunks, {
        type: mimeType
      });
      theResolve(binData);
      if (save) {
        this.videos.push(binData);
      }
      this.onCameraChange();
    }

    this.mediaRecorder.start();
    this.shooting = true;
    this.onCameraChange();
  }

  isShooting() {
    return this.shooting;
  };

  isPlaying() {
    return this.playing;
  };

  // 停止录像
  async endShooting() {
    if (!this.videotape) {
      return null;
    }

    const videotape = this.videotape;
    this.videotape = null;

    this.shooting = false;
    this.mediaRecorder.stop();
    this.mediaRecorder = null;
    return videotape;
  }

  // 播放录像
  async play(theBlob = this.videos[0]) {
    if (!this._checkAble() || !window.MediaSource) {
      return;
    }

    const {
      offsetWidth,
      offsetHeight
    } = this.video;

    this.video.style.display = 'none';

    this.videoPlayer.style.width = offsetWidth + 'px';
    this.videoPlayer.style.height = offsetHeight + 'px';
    this.videoPlayer.src = URL.createObjectURL(new File([theBlob], "video"));
    this.videoPlayer.style.display = 'block';

    this.playing = true;
    this.videoPlayer.play();

    this.calledStop = new Promise(r => this.stoped = r);
    this.onCameraChange();
    return this.calledStop;
  }

  // 停止播放
  stop() {
    if (!this._checkAble() || !this.playing) {
      return;
    }
    this.videoPlayer.pause();
    this.playing = false;
    this.videoPlayer.style.display = 'none';
    this.video.style.display = 'block';
    if (this.stoped) {
      this.stoped();
      this.stoped = null;
    }
    this.onCameraChange();
  }

  // 照相
  snapshot(mimeType = "image/jpeg", save = true, base64 = true) {
    if (!this._checkAble()) {
      return;
    }
    const {
      offsetWidth,
      offsetHeight,
    } = this.video;
    const {
      video: {
        width = offsetWidth,
        height = offsetHeight,
      } = {}
    } = this.constraints;

    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(this.video, 0, 0, width, height);
    const photoUrl = canvas.toDataURL();
    const photo = dataURLtoBlob(photoUrl);
    if (save) {
      this.photos.push(photo);
    }
    this.onCameraChange();
    if (base64) {
      return photoUrl;
    }
    return photo;
  }

  // 拿到所有视频
  getVideos(file = true) {
    if (file) {
      return toFiles(this.videos);
    }
    return [...this.videos];
  }

  // 拿到所有照片
  getPhotos(file = true) {
    if (file) {
      return toFiles(this.photos);
    }
    return [...this.photos];
  }
}
WebCamera.toFiles = toFiles;
WebCamera.dataURLtoBlob = dataURLtoBlob
