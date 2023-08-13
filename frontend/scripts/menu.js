$(document).ready(function() {

  // Variables
  var $nav = $('.navbar'),
      $popoverLink = $('[data-popover]'),
      $document = $(document)

  function init() {
    $popoverLink.on('click', openPopover)
    $document.on('click', closePopover)
  }

  function openPopover(e) {
    e.preventDefault()
    closePopover();
    var popover = $($(this).data('popover'));
    popover.toggleClass('open')
    e.stopImmediatePropagation();
  }

  function closePopover(e) {
    if($('.popover.open').length > 0) {
      $('.popover').removeClass('open')
    }
  }

  init();
});

var navmenu =
'<ul class="navbar-list">' +
  '<li class="navbar-item"><a class="navbar-link" href="https://home.bearloves.rocks">Home</a></li>' +
  '<li class="navbar-item">' +
    '<a class="navbar-link" href="#" data-popover="#pagesPopover">budget-tracker</a>' +
    '<div id="pagesPopover" class="popover">' +
      '<ul class="popover-list">' +
        '<li class="popover-item">' +
          '<a class="popover-link" href="/">Budget</a>' +
        '</li>' +
        '<li class="popover-item">' +
          '<a class="popover-link" href="/transactions.html">Transactions</a>' +
        '</li>' +
        '<li class="popover-item">' +
          '<a class="popover-link" href="/target.html">Target</a>' +
        '</li>' +
        '<li class="popover-item">' +
          '<a class="popover-link" href="/login.html">Login</a>' +
        '</li>' +
      '</ul>' +
    '</div>' +
  '</li>' +
  '<li class="navbar-item">' +
    '<a class="navbar-link" href="#" data-popover="#aboutPopover">About</a>' +
    '<div id="aboutPopover" class="popover">' +
      '<ul class="popover-list">' +
        '<li class="popover-item">' +
          '<a class="popover-link" href="/about.html#">Overview</a>' +
        '</li>' +
        '<li class="popover-item">' +
          '<a class="popover-link" href="/about.html#ingest">Ingest</a>' +
        '</li>' +
        '<li class="popover-item">' +
          '<a class="popover-link" href="/about.html#data">Database</a>' +
        '</li>' +
        '<li class="popover-item">' +
          '<a class="popover-link" href="/about.html#backend">Backend</a>' +
        '</li>' +
        '<li class="popover-item">' +
          '<a class="popover-link" href="/about.html#access">Access</a>' +
        '</li>' +
        '<li class="popover-item">' +
          '<a class="popover-link" href="https://github.com/pdav5883/budget-tracker">Github</a>' +
        '</li>' +
      '</ul>' +
    '</div>' +
  '</li>' +

'</ul>';
