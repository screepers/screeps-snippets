/* Posted February 11th, 2017 by @semperrabbit */

global.injectNAME = function(){//*
    if(!global.NAMEInjected) {
        global.NAMEInjected = true;
        var output = `<SPAN>Trying to inject NAME code!</SPAN>
<SCRIPT>

</SCRIPT>`
	    console.log(output.replace(/(\r\n|\n|\r)\t+|(\r\n|\n|\r) +|(\r\n|\n|\r)/gm, ''));
    }
//*/
}

global.forceInjectNAME = ()=>{global.NAMEInjected = false; injectNAME();}

injectNAME();