/* Posted February 18th, 2017 by @semperrabbit */

document.injectScriptTag = function injectScriptTag(url){
    return new Promise(function(good, bad){
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                let src=document.createElement('script');
                src.lang='javascript';
                src.innerHTML=xhr.responseText;
                document.head.appendChild(src);
                console.log('resp',xhr.responseText);
                good({status: this.status, responseText: xhr.responseText});
            } else {
                bad({ status: this.status, statusText: xhr.statusText });
            }
        };
        xhr.onerror = function () {
            bad({ status: this.status, statusText: xhr.statusText });
        };
        xhr.send();
    });
};
