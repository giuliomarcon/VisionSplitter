function select_file()
{
  $('#upload_input').click();
  $('#progress_text').text('0%');
  $('.progress-bar').width('0%');
}

$('#upload_input').on('change', function()
{
  var files = $("#upload_input").get(0).files;

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
        $("#bill_photo").fadeTo(1000, 0, function() {
          $("#bill_photo").attr("src","uploads/" + data);
          $("#bill_photo").fadeTo(1000, 1);
        });

        $("#progress_text").fadeOut(2000, function() {
          $('#progress_text').html('Upload done. Now doing the vision magic');
          $("#progress_text").fadeIn(1000);
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

            if (percentComplete == 66)
            {

            }
          }

        }, false);

        return xhr;
      }
    });

  }
});