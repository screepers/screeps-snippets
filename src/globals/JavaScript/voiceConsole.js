/* Original post December 25th, 2016 by @stybbe */
/* Fixed post August 30th, 2017 by @semperrabbit*/

// The function below was developed late last year by @stybbe, published in
//  Screeps Slack's #share-thy-code channel. No license was applied; all  
//  rights remain with the author. Minor fixes were made by @SemperRabbit 
//  to get it working again.

// NOTE: that this code works in chrome and firefox (albiet quietly
//  in firefox) but not the steam client.

global.defaultVoice = "US English Female"; // can be changed
// see https://responsivevoice.org/text-to-speech-languages/
// for options
global.voiceConsole = function voiceConsole(text){
    console.log(`<span style="color:green; font-style: italic;">${text}</span>
                 <script>
                    if (!window.speakText){
                        window.speakText = function(gameTime, text) {
                            var id = gameTime + "-" + text;
                            if(!window.voiceHash){
                                window.voiceHash={};
                            } 
                            
                            if (!window.voiceHash[id]){
                                window.voiceHash[id]=true;
                            responsiveVoice.setDefaultVoice("${defaultVoice}");
                                responsiveVoice.speak(text);
                            }
                        }
                    }
                 
                    if (document.getElementById("responsiveVoice")){
                        window.speakText("${Game.time}", "${text}");
                    }else{
                        var script = document.createElement("script");
                        script.type = "text/javascript";
                        script.id = "responsiveVoice";
                        script.onload = function() {
                            responsiveVoice.setDefaultVoice("${defaultVoice}");
                            console.log("responsiveVoice has initialized");
                            window.speakText("${Game.time}", "${text}");
                        };
                        script.src = "https://code.responsivevoice.org/responsivevoice.js";
                        document.getElementsByTagName("head")[0].appendChild(script);
                        setTimeout("responsiveVoice.init()", 1000);
                    }
                </script>`
                .replace(/(\r\n|\n|\r)\t+|(\r\n|\n|\r) +|(\r\n|\n|\r)/gm,""));
}