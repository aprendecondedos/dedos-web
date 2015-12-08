$(function(){
  /**
   * Inicialización de plugins
   */

  //$('[data-plugin="maxlength"]').maxlength();

  //if($('[data-plugin="switchery"]').length > 0) {
  //  $('[data-plugin="switchery"]').each(function(){
  //    new Switchery(this, {color: '#62a8ea'});
  //  });
  //}

  $('[data-name].profile').initial({
    charCount: 2
  });
  $('[data-name].classroom').initial({
    charCount: 1
  });
  // affixHandler
  $('#articleAffix').affix({
    offset: {
      top: 210
    }
  });
  $('body').scrollspy({
    target: '#articleAffix'
  });
  // SweetAlert
  // ---------
  $('.warning-confirm').on("click", function() {
    var that = $(this);
    swal({
        title: "Are you sure?",
        text: "You will not be able to recover this imaginary file!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Yes, delete it!',
        closeOnConfirm: false,
        animation: 'slide-from-bottom'
        //closeOnCancel: false
      },
      function() {
        swal({
          title: "Deleted!",
          text: "Your imaginary file has been deleted!",
          type: "success"
        }, function() {
          $(that.data("target")).submit();
        });
      });
  });
  // Dynamic form fields
  // ---------
  $(document).on('click', 'form .add-more', function(){
    var element = $( $(this).data('clone') ).clone();
    element.find('input[type="text"]:first, textarea:first').val('');
    $( $(this).data('clone-container') ).append(element);
    element.find('input[type="text"]:first, textarea:first').focus()
  });

  // Webui Popover
  // ---------
  var listContent = $('.popover-list-content').html(),
    listSettings = {
      content: listContent,
      title: '',
      padding: false
    };

  $('.popover-list').webuiPopover($.extend({}, $.components.getDefaults("webuiPopover"), listSettings));


  // Footable
  // ---------
  (function() {
    var filtering = $('#table-filtering');
    filtering.footable().on('footable_filtering', function(e) {
      var selected = $('#filteringStatus').find(':selected').val();
      e.filter += (e.filter && e.filter.length > 0) ? ' ' + selected : selected;
      e.clear = !e.filter;
    });

    // Filter status
    $('#filteringStatus').change(function(e) {
      e.preventDefault();
      filtering.trigger('footable_filter', {
        filter: $(this).val()
      });
    });

    // Search input
    $('#filteringSearch').on('input', function(e) {
      e.preventDefault();
      filtering.trigger('footable_filter', {
        filter: $(this).val()
      });
    });
  })();
});