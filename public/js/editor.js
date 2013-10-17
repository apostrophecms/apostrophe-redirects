function AposRedirects() {
  var self = this;
  self.modal = function() {
    self.$el = apos.modalFromTemplate('.apos-redirects-editor', self);
  };

  // Invoked when the modal is ready
  self.init = function(callback) {
    self.$list = self.$el.find('[data-list]');
    self.$template = self.$list.find('[data-item].apos-template');
    self.$template.remove();

    self.$el.on('click', '[data-new]', function() {
      var $item = self.addItem({});
      $item.findByName('from').focus();
      return false;
    });

    self.$el.on('click', '[data-update]', function() {
      var $item = $(this).closest('[data-item]');
      if ($item.length) {
        var from = $item.find('[name="from"]').val();
        if (from.substr(0, 1) !== '/') {
          alert('The first character of the "from" address must be /.');
          return false;
        }
        if (from === '/') {
          alert('To prevent accidental disabling of the entire site, you may not redirect / (the home page).');
          return false;
        }
        // The server treats this as an upsert operation keyed on the "from" URL, so be
        // sure to purge any duplicates browser-side too
        self.$list.find('[data-item]').each(function() {
          if (this === $item[0]) {
            return;
          }
          var $other = $(this);
          if ($other.find('[name="from"]').val() === $item.find('[name="from"]').val()) {
            $other.remove();
          }
        });
        $.jsonCall('/apos-redirects/update', {
          _id: $item.attr('data-id'),
          from: $item.find('[name="from"]').val(),
          to: $item.find('[name="to"]').val(),
          reason: $item.find('[name="reason"]').val()
        }, function(response) {
          if (response.status !== 'ok') {
            alert('An error occurred. Please try again.');
          } else {
            $item.attr('data-id', response.result._id);
          }
        });
      }
      return false;
    });

    self.$el.on('click', '[data-remove]', function() {
      var $item = $(this).closest('[data-item]');
      if ($item.length) {
        $.jsonCall('/apos-redirects/remove', { _id: $item.attr('data-id') }, function(result) {
          if (result.status !== 'ok') {
            alert('An error occurred. You may have two redirects with the same "from" URL.');
          } else {
            $item.remove();
          }
        });
      }
      return false;
    });

    return self.load(callback);
  };

  self.addItem = function(item) {
    var $newItem = apos.fromTemplate(self.$template);
    self.$list.append($newItem);
    $newItem.attr('data-id', item._id);
    _.each(item, function(val, key) {
      $newItem.findByName(key).val(val);
    });
    return $newItem;
  };

  self.load = function(callback) {
    $.getJSON('/apos-redirects/load', {}, function(response) {
      if (response.status !== 'ok') {
        return alert('An error occurred. Please try again.');
      }
      _.each(response.result, function(item) {
        self.addItem(item);
      });
      return callback(null);
    });
  };

  self.setup = function() {
    $('.apos-redirects-button').click(function() {
      self.modal();
      return false;
    });
  };

  // So it's possible to override self.setup
  apos.afterYield(function() {
    self.setup();
  });
}
