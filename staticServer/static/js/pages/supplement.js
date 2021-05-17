let ID = '';
let imgList = [];
let imgType = '5';
let imgServer = '/sicd/images/';

let queryData = function() {
    $.showLoading();
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: ajaxUrl + '/appinfo/queryChronicCheck?openId=' + sessionStorage.openId,
        data: {},
        success: function (res) {
            if(res.response === 'error'){
                $.hideLoading();
                $.toast(res.error, 'forbidden');
            }else{
                let obj = res.ok;
                ID = obj.id;
                $('#firstCheckConclusion').html(obj.firstCheckConclusion)
                $('#uploaderInput').attr('disabled', false)
                getImgs()
            }
        }
    });
}
let getImgs = function(){
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: ajaxUrl + '/appinfo/findAttachmentListForApp?id=' + ID,
        data: {},
        success: function (res) {
            $.hideLoading();
            if(res.response === 'error'){
                $.toast(res.error, 'forbidden');
            }else{
                let obj = res.ok;
                imgList = obj;
                initImgs()
            }
        }
    });
}
let initImgs = function(){
    let html = ''
    imgList.forEach(item => {
        if(item.serviceType === imgType){
            html += '<li class="weui-uploader__file" style="background-image:url(' + imgServer + item.reduceFileRoute + ')" onclick=showGallery("'+ item.id +'","' + item.fileRoute + '")></li>'
        }
    })
    $('#files').html(html === '' ? '<p style="text-align:center;font-size:14px;padding:10px;color:#999">暂无附件</p>' : html)
}
$('#imgSelect').on('change', function(e){
    imgType = e.target.value;
    console.log(imgType)
    initImgs()
})

let delId = ''
let showGallery = function(id, src) {
    $('#gallery').show();
    $('#galleryImg').css('background-image', 'url(' + imgServer + src + ')');
    if(imgType === '5'){
        $('.weui-gallery__opr').show()
        delId = id
    }else{
        $('.weui-gallery__opr').hide()
        delId = ''
    }
}
$('#imgDel').on('click', function(){
    $.showLoading()
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: ajaxUrl + '/appinfo/deleteAttachmentList?id=' + delId,
        data: {},
        success: function (res) {
            $.hideLoading();
            if(res.response === 'error'){
                $.toast(res.error, 'forbidden');
            }else{
                $.toast('删除成功');
                getImgs()
                $('#gallery').hide();
                $('#galleryImg').css('background-image', 'url()');
                delId = ''
            }
        }
    });
})
$('#closeGallery').on('click', function(){
    $('#gallery').hide();
    $('#galleryImg').css('background-image', 'url()');
    delId = ''
})

let fileList = []
$('#uploaderInput').on('change', function (event) {  
    let allowTypes = ['image/jpg', 'image/jpeg', 'image/png'];
    let files = event.target.files;
    if(files.length === 0){
        return;
    }
    for (let i = 0, len = files.length; i < len; i++){
        let file = files[i];
        if(allowTypes.indexOf(file.type) === -1){
            $.toast(file.name + '(' + file.type + ') 图片格式不允许上传！', 'forbidden');
            $('#uploaderInput').val(null)
            continue;
        }
        fileList.push(files[i])

        if(fileList.indexOf(file) === -1){
            fileList.push(file)
        }
        let reader = new FileReader();
        
        reader.readAsDataURL(file);
        reader.onload = function(e) {
            let img = new Image(); 
            img.src = e.target.result;         
            img.onload = function () {
                var $preview = $('<li class="weui-uploader__file" style="position: relative; background-image:url(' + img.src + ')"><i class="weui-icon-cancel" style="position: absolute; right: 0; top: 5px; z-index: 5;" data-index="'+i+'" onclick=delUploadImg(this)></i></li>');
                $('#uploaderFiles').append($preview);
            }
        }
    }
})
let delUploadImg = function(e){
    let index = $(e).data('index');
    fileList.splice(index, 1);
    let img = $(e).parents('.weui-uploader__file');
    img.remove()

    $('#uploaderInput').val(null)
}

let saveFun = function() {
    if(!ID){
        return
    }
    if(fileList.length === 0){
        $.toast('请选择补充资料', 'forbidden');
        return
    }
    const formData = new FormData();
    for(let i = 0; i < fileList.length; i++) {
        formData.append('files[]', fileList[i]);
    }
    formData.append('chronicDiseaseId', ID);
    formData.append('serviceType', 5)
    
    $.showLoading();
    $.ajax({
        type: 'POSt',
        // dataType: 'json',
        contentType: false,
        processData: false,
        url: ajaxUrl + '/appinfo/uploadAttachmentForApp',
        data: formData,
        success: function (res) {
            $.hideLoading();
            if(res.response === 'error'){
                $.toast(res.error, 'forbidden');
            }else{
                $.toast('附件上传成功');
                getImgs()
                $('#uploaderFiles').html('')
                fileList = []
            }
        }
    });
}

$('#upload').on('click', () => {
    saveFun()
})

$('#complete').on('click', () => {
    if(!ID){
        return
    }
    if(fileList.length > 0){
        $.toast('请先上传补充材料', 'forbidden');
        return
    }
    $.confirm("请确认补充材料已上传完成。", function() {
        $.showLoading();
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: ajaxUrl + '/appinfo/saveSupplementMaterialForApp?id=' + ID,
            data: {},
            success: function (res) {
                $.hideLoading();
                if(res.response === 'error'){
                    $.toast(res.error, 'forbidden');
                }else{
                    ID = ''
                    sessionStorage.setItem('successTxt', '补充材料')
                    window.location.href = 'success.html'
                }
            }
        });
    }, function() {});
})