// GimmeCookies 30 Dec 2018 at 13:59

/**
 * Clear the in-game console
 * Usage: `clear()` in the console
 */
global.clear = function() {
  console.log(
    "<script>angular.element(document.getElementsByClassName('fa fa-trash ng-scope')[0].parentNode).scope().Console.clear()</script>"
  );
};
