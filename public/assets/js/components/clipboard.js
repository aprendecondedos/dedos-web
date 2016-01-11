/*!
 * remark v1.0.1 (http://getbootstrapadmin.com/remark)
 * Copyright 2015 amazingsurge
 * Licensed under the Themeforest Standard Licenses
 */
$.components.register("clipboard", {
  mode: "init",
  defaults: {
    color: $.colors("primary", 600)
  },
  init: function(context) {
    if (typeof Clipboard === "undefined") return;

    var defaults = $.components.getDefaults("clipboard");

    $('[data-plugin="clipboard"]', context).each(function() {
      var clipb = new Clipboard($(this)[0]);
      clipb.on('success', function(e) {
        $(e.trigger)
                    .attr('data-original-title', $(e.trigger).data('copied'))
                    .tooltip('fixTitle')
                    .tooltip('show');
      });

    });
  }
});
