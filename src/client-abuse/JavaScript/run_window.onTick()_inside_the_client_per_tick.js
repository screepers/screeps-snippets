/* Posted December 3rd, 2017 by @semperrabbit */

/* needs to be put in util.inject.TEMPLATE in conjunction with a definition of `window.onTick()`*/
(function(){
    if(window.tickHook)
        return;
    angular.element($('body')).injector().get('Connection').onRoomUpdate(angular.element(document.getElementsByClassName("room ng-scope")).scope(), function()
    {
        if(window.onTick)
            window.onTick();
    })
    window.tickHook = true;
})();