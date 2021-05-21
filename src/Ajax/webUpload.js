/*
  必须在点击前创建元素，否则在移动端浏览器可能不触发onchange
*/
const upload = document.createElement('input');
upload.type = 'file';
upload.style.display = 'none';
document.body.appendChild(upload);

export default async function webUpload(multiple = true, extend = {}) {
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
  } else {
    delete upload.accept;
  }

  // 激活摄像头
  if (capture) {
    if (capture === true) {
      capture = "camera";
    }
    upload.capture = capture;
  } else {
    delete upload.capture;
  }

  let resolve$2;
  const next = new Promise(resolve => resolve$2 = resolve);

  upload.onchange = function() {
    resolve$2(upload.files);
  };
  upload.click();

  let myFiles = await next;
  myFiles = Array.from(myFiles);

  if (!multiple) {
    return myFiles[0];
  }

  return myFiles;
}
