/* Posted Jan 20 @ 3:03AM by @semperrabbit */
/* Comment: This code can be found here: github.com/semperrabbit/loan-browser-ext/blob/master/dist/util.LoAN.inject.js
And the code it imports can be found here. This will still function as a regular TamperMonkey script: github.com/semperrabbit/loan-browser-ext/blob/master/dist/alliance-overlay.user.js */
/* Comment: TamperMonkey inject works in Chrome for Android too. Just witnessed it today. Previously successful in Chrome, Firefox, and Steam client in both live and private servers. */
/* Comment: ty to @maxion for catching it, but in the Steam client, clicking on an alliance link in the leaderboard would take you to the LoAN page without prividing you a way to return to the game. links now open LoAN in a new window. changes can be found at the link below. No changes to your codebase is required, only a close and reopen of the client to take affect. github.com/semperrabbit/loan-browser-ext/commit/5ffefdd2141d841a5acc6461c04f1e631a95aaf5 */
/* Comment: Adjusted alliance colors in map view to match LoAN website colors. Change can be seen here: https://github.com/semperrabbit/loan-browser-ext/commit/59a20b523daa560ec1d52483045a6deb1c3b2ac2
No changes are required on your part other than closing and opening your browser if injected. */

/**
require('util.LoAN.inject');
This module will attempt to load the LoAN tampermonkey code each time you have a global reset.
*/

global.injectLoAN = function(){
    var output = `<SCRIPT>
if(!window.LoANInjected){
    window.LoANInjected = true;
    xhr=new XMLHttpRequest();
    xhr.open('GET', 'https://raw.githubusercontent.com/semperrabbit/loan-browser-ext/master/dist/alliance-overlay.user.js', true);
    xhr.onreadystatechange=function(){
      if(xhr.readyState===XMLHttpRequest.DONE&&xhr.status===200){
        let src=document.createElement('script');
        src.lang='javascript';
        src.innerHTML=xhr.responseText;
        document.head.appendChild(src);
        console.log('resp',xhr.responseText);
      }
    };
    xhr.send();
}
</SCRIPT>`
    console.log(output.split('\n').join(';'));

}

global.forceInjectLoAN = ()=>{global.LoANInjected = false; injectLoAN();}

injectLoAN();