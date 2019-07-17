/* Posted January 26th, 2017 by @semperrabbit */
/**
 * Inject alliance data into Memory.alliances in the form of Memory.alliances[alliance][player].
 * The code will auto-update every 6 hrs of your leaving the client open.
 * 
 * Usage:
 *  saveAlliancesInMemory();
 * Memory usage after calling: 
 *  if(Memory.alliances[alliance][player]) {
 *      console.log(player + ' is in alliance ' + alliance);
 *  } else {
 *      console.log(player + ' is not in alliance ' + alliance);
 *  }
 * 
 * Special thanks to akusnayesa for teaching me how Promises *really* work.
 * 
 * @author SemperRabbit
 */
global.saveAlliancesInMemory = function saveAlliancesInMemory(){
    if(!global.alliancesSavedInMemory) {
        global.alliancesSavedInMemory = true;
        var script = `<SPAN>Saving alliance data to Memory...</SPAN><SCRIPT>
if(!document.alliancesSavedInMemory) {
    if(!window.loadAlliancesIntoMemory) {
        window.loadAlliancesIntoMemory = function loadAlliancesIntoMemory() {
            new Promise(function(good, bad) {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D'http%3A%2F%2Fwww.leagueofautomatednations.com%2Falliances.js'&format=json", true);
                xhr.onload = function () {
                    if (xhr.status >= 200 && xhr.status < 300) { good(JSON.parse(xhr.responseText).query.results.json);
                    } else {
                        bad({ status: this.status, statusText: xhr.statusText });
                    }
                };
                xhr.onerror = function () {
                    bad({ status: this.status, statusText: xhr.statusText });
                };
                xhr.send();
            }).then(allianceData => {
                const alliances = {};
                Object.keys(allianceData).forEach(a=>{
                    alliances[a] = {};
                    allianceData[a].members.forEach(p=>alliances[a][p]=true);
                });
                angular.element($('body')).injector().get('Connection').setMemoryByPath(null, 'alliances', alliances);
                console.log(allianceData);
                console.log("Alliance data loaded from LOAN.");
                return allianceData;
            });
        };
    }
    window.loadAlliancesIntoMemory();
    setInterval(loadAlliancesIntoMemory, 1000 * 60 * 60 * 6);
    document.alliancesSavedInMemory = true;
}
</SCRIPT>`;
        console.log(_(script).split('\n').map(s=>s.trim()).join(''));
    }
}