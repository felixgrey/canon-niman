function webDownload(file) {
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = URL.createObjectURL(file);
  a.download = file.name;
  document.body.appendChild(a);
  setTimeout(() => {
    a.click();
    URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
  }, 20);
}
export default webDownload;
