/* Blend Buddies – word pictures. Each picture is a real photograph in images/, used offline via a relative path (no network fetch).
   API: window.BBPictures.has(word), .svg(word) -> inner SVG markup, .list() -> all words with a picture.
   Photo sources, authors and licenses are listed in PHOTO_CREDITS.md and images/manifest.json. */
(function () {
  'use strict';
  var WORDS = ["fox", "box", "fix", "six", "wax", "ax", "mix", "lynx", "books", "book", "kicks", "kick", "licks", "lick", "looks", "look", "forks", "fork", "rakes", "rake", "walks", "walk", "packs", "pack", "snacks", "snack", "locks", "lock", "bakes", "bake", "cooks", "cook", "shakes", "shake", "blinks", "blink", "talks", "talk", "parks", "park", "rocks", "rock", "makes", "make", "knocks", "knock", "hooks", "hook", "ducks", "duck", "cakes", "cake", "socks", "sock", "weeks", "week", "cheeks", "cheek", "chicks", "chick", "links", "link", "blocks", "block", "bricks", "brick", "sticks", "stick", "sick", "whack"];
  var set = {};
  WORDS.forEach(function (w) { set[w] = true; });
  function key(w) { return String(w || '').toLowerCase(); }
  function has(w) { return Object.prototype.hasOwnProperty.call(set, key(w)); }
  window.BBPictures = {
    has: has,
    svg: function (w) {
      w = key(w);
      if (!has(w)) return '';
      return '<image href="images/' + w + '.webp" width="200" height="200" preserveAspectRatio="xMidYMid slice"/>';
    },
    list: function () { return WORDS.slice(); }
  };
})();
