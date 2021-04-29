export default async function webUpload(multiple = true) {
  const upload = global.document.createElement('input');
  upload.type = 'file';
  upload.multiple = multiple;

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