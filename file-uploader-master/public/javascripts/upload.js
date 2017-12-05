function reset_progressbar()
{
  $(".progress").fadeIn(1000);
  $("#progress_text").fadeOut(500, function () {
    $('#progress_text').text('');
  });
  $('.progress-bar').width('0%');
}

function set_progressbar()
{
  $('.progress-bar').width('100%');
  $('#progress_text').text('Click or drag n drop the image to upload a bill'); 
  $('#progress_text').fadeIn(1700);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

$("#bill_photo").on("dragover", function(event) {
    event.preventDefault();  
    event.stopPropagation();
    $("#bill_photo").attr("src","assets/placeholder_over.jpg");
    reset_progressbar();
    
});

$("html").on("dragleave", function(event) {
    event.preventDefault();  
    event.stopPropagation();
    $("#bill_photo").attr("src","assets/placeholder.jpg");
    set_progressbar();
});

$("#bill_photo").on("drop", function(event) {
    event.preventDefault();  
    event.stopPropagation();
    reset_progressbar();
    var files = event.originalEvent.dataTransfer.files;
    upload(files);
});

function select_file()
{
  $('#upload_input').click();
}

$('#upload_input').on('change', function()
{
  var files = $("#upload_input").get(0).files;
  upload(files);
});

function upload(files)
{
  if (files.length > 0){
    // create a FormData object which will be sent as the data payload in the
    // AJAX request
    var formData = new FormData();

    // loop through all the selected files and add them to the formData object
    for (var i = 0; i < files.length; i++) {
      var file = files[i];

      // add the files to formData object for the data payload
      formData.append('uploads[]', file, file.name);
    }

    $.ajax({
      url: '/upload',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function(data){
        $("#main_table").fadeOut(1000);
        $("#bill_photo").fadeTo(1000, 0, function() {
          $("#bill_photo").attr("src","uploads/" + data);
          $("#bill_photo").fadeTo(1000, 1);
          $.post("/recognition",{image: data}, function (data) {
            vm.oggetti([]);
            var jsonObj = $.parseJSON(data);
            jsonObj.forEach(function(entry) {
              vm.addOggetto(capitalizeFirstLetter(entry.name),entry.price.toFixed(2));
            });
            $("#main_table").fadeIn(1000);

            $('.progress-bar').width("100%");
            $("#progress_text").fadeOut(2000, function() {
              $('#progress_text').html('Magic done!');
              $("#progress_text").fadeIn(500);
              setTimeout(function() { 
                $("#progress_text").fadeOut(500, function () {
                  $("#progress_text").html("Click or drag n drop the image to upload another bill");
                  $("#progress_text").fadeIn(500);
                });
              }, 3000); 
            });
          });
        });

        $("#progress_text").fadeOut(2000, function() {
          $('#progress_text').html('Upload done. Now doing the vision magic');
          $("#progress_text").fadeIn(1500);
        });
      },
      xhr: function() {
        // create an XMLHttpRequest
        var xhr = new XMLHttpRequest();

        // listen to the 'progress' event
        xhr.upload.addEventListener('progress', function(evt) {

          if (evt.lengthComputable) {
            // calculate the percentage of upload completed
            var percentComplete = evt.loaded / evt.total / 1.5;
            percentComplete = parseInt(percentComplete * 100);

            // update the Bootstrap progress bar with the new percentage
            $('#progress_text').text(percentComplete + '%');
            $('.progress-bar').width(percentComplete + '%');
          }

        }, false);

        return xhr;
      }
    });

  }
}