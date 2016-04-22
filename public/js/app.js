$( document ).ajaxSuccess(function( event, request, settings ) {
  //Site.run();
});
$(function(){
  /**
   * Inicialización de plugins
   */
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
  // jQuery validation
  // ---------
  $('form[data-validation="true"]').formValidation({
    framework: "bootstrap",
    //button: {
    //  selector: 'form[data-validation="true"] .btn.btn-primary',
    //  disabled: 'disabled'
    //},
    icon: null
  });

  // SweetAlert
  // ---------
  $('.warning-confirm').on("click", function() {
    var self = $(this);
    swal({
        title: self.data('alert-title'),
        text: self.data('alert-text'),
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: self.data('alert-confirmbtn'),
        cancelButtonText: 'Cancelar',
        cancelButtonClass: 'cancel btn btn-lg btn-default margin-right-10',
        closeOnConfirm: false,
        animation: 'slide-from-bottom'
        //closeOnCancel: false
      },
      function() {
        swal({
          title: self.data('alert-title-success'),
          text: self.data('alert-text-success'),
          type: "success"
        }, function() {
          $(self.data("target")).submit();
        });
      });
  });
  // Dynamic form fields
  // ---------
  $(document).on('click', 'form .add-more', function() {
    var element = $($(this).data('clone')).clone();
    element.find('input[type="text"]:first, textarea:first').val('');
    $($(this).data('clone-container')).append(element);
    element.find('input[type="text"]:first, textarea:first').focus();
  });

  // Webui Popover
  // ---------
  var listContent = $('.popover-list-content').html();
  var listSettings = {
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