const uploadId = 'upload-' + Date.now();

export default async function webUpload(multiple = true, extend = {}) {

  /*
    每次都用新元素，防止属性污染。
  */
  const upload = document.createElement('input');
  upload.type = 'file';
  upload.style.display = 'none';
  upload.id = uploadId;

  const oldUpload = document.querySelector('#' + uploadId);
  if (oldUpload) {
    document.body.replaceChild(upload, oldUpload);
  } else {
    document.body.appendChild(upload);
  }

  // 多选
  upload.multiple = multiple;

  const {
    accept,
    capture = false
  } = extend;

  // 特定文件类型
  // "image/*" "video/* "audio/*"
  if (accept) {
    upload.accept = accept;
  }

  // 激活摄像头
  if (capture) {
    if (capture === true) {
      capture = "camera";
    }
    upload.capture = capture;
  }

  let resolve$2;
  const next = new Promise(resolve => resolve$2 = resolve);

  upload.onchange = function() {
    resolve$2(upload.files);
    document.body.removeChild(upload);
  };

  /*
    先加入DOM，再触发事件，否则可能不响应；
  */
  setTimeout(() => {
    upload.click();
  }, 20);

  let myFiles = await next;
  myFiles = Array.from(myFiles);

  if (!multiple) {
    return myFiles[0];
  }

  return myFiles;
}
