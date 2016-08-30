
function DnDFileController(selector, onDropCallback) {
  var el_ = document.querySelector(selector);
  var overCount = 0;

  this.dragenter = function(e) {
    e.stopPropagation();
    e.preventDefault();
    overCount++;
    el_.classList.add('dropping');
  };

  this.dragover = function(e) {
    e.stopPropagation();
    e.preventDefault();
  };

  this.dragleave = function(e) {
    e.stopPropagation();
    e.preventDefault();
    if (--overCount <= 0) {
      el_.classList.remove('dropping');
      overCount = 0;
    }
  };

  this.drop = function(e) {
    e.stopPropagation();
    e.preventDefault();

    el_.classList.remove('dropping');

    onDropCallback(e.dataTransfer);
  };

  el_.addEventListener('dragenter', this.dragenter, false);
  el_.addEventListener('dragover', this.dragover, false);
  el_.addEventListener('dragleave', this.dragleave, false);
  el_.addEventListener('drop', this.drop, false);
}