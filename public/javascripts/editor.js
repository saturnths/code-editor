var editor = ace.edit("editor");
editor.getSession().setMode(new (require("ace/mode/javascript").Mode));
editor.setTheme("ace/theme/idle_fingers");
editor.$blockScrolling = Infinity;
editor.setShowPrintMargin(false);

var socket = new BCSocket(null, {reconnect: true});
var share = new sharejs.Connection(socket);
var id = window.location.pathname.split("/").pop();
var doc = share.get('docs', id);
doc.subscribe();
doc.whenReady(function () {
  if (!doc.type) doc.create('text');
  if (doc.type && doc.type.name === 'text') {
    doc.attachAceEditor(editor.getSession());
  }
});

$('#language').on('change', function() {
  var language = $(this).find('option:selected').val().toLowerCase();
  editor.getSession().setMode(new (require('ace/mode/'+language).Mode));
});

$('#theme').on('change', function() {
  var theme = $(this).find('option:selected').val();
  if (theme === 'Dark') {
    editor.setTheme("ace/theme/idle_fingers");
  } else if (theme === 'Light') {
    editor.setTheme("ace/theme/textmate");
  }
});
