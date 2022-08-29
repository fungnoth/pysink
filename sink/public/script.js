function domLoaded(e){window.addEventListener("DOMContentLoaded",(t=>e(t)))}const findOne=(...e)=>document.querySelector(...e),findNodes=(...e)=>document.querySelectorAll(...e),find=(...e)=>Array.from(document.querySelectorAll(...e)),findNearby=(e,t,o,n)=>(void 0===o&&(o=".shopify-section"),console.log("findNearby",e,t,o,n),Array.from(e.closest(o).querySelectorAll(t))),findNext=(e,t,o)=>{const n=Array.from(e.parentElement.children),r=n.indexOf(e),i=Array.from(e.parentElement.querySelectorAll(t));let l;for(let e of i){const t=n.indexOf(e);if("prev"==o&&t<r)l=e;else{if("prev"==o&&t>=r)break;if(t>r){l=e;break}}}return l};function scrollWithOffsetY(e,t){void 0===t&&(t=-1*document.querySelector("header").offsetHeight);const o=e.getBoundingClientRect().top+window.pageYOffset+t;window.scrollTo({top:o,behavior:"smooth"})}function recalcBtnSvg(){const e=find(".btn");console.log("found buttons",e);for(let t of e){if(t.clientWidth<140)continue;let e=t.querySelector(".inner-path"),o=t.querySelector(".outer-path");if(!e||!o)continue;let n=e.getAttribute("d").split(" "),r=o.getAttribute("d").split(" ");n.forEach(((e,o)=>{if("h"!=e||void 0===n[o+1])return;let r=t.clientWidth-27;n[o+1]<0&&(r*=-1),n[o+1]=r})),r.forEach(((e,o)=>{if("h"!=e||void 0===r[o+1])return;let n=t.clientWidth-20;r[o+1]<0&&(n*=-1),r[o+1]=n})),e.setAttribute("d",n.join(" ")),o.setAttribute("d",r.join(" ")),t.querySelector("#svg-btn").style.left=70-t.clientWidth/2+"px"}}

try {
    window.searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
    if (!window.searchHistory) throw Error("cannot find searchHistory")
} catch {
    window.searchHistory = {};
}

function onYouTubePlayerAPIReady() {    
    window.player = new YT.Player('ytplayer', {height: '100%', width: '100%'});
    window.player.addEventListener("onStateChange", syncPlayers)
}

function syncPlayers() {
    const curState = window.player.getPlayerState();
    const curTime = window.player.getCurrentTime();
    find("audio").forEach(audio => {
        audio.currentTime = curTime ? curTime : 0;
        if (curState === YT.PlayerState.PLAYING) {
            audio.play();
        } else {
            audio.pause();
        }
    });
}
function loadVideo(vid) {
    find("audio").forEach(a => a.src = "");
    window.player.unMute();
    fetch(`/v/${vid}`).then(async (response) => {
        let data = await response.json();
        findOne("audio#vocals").src = data.vocals;
        findOne("audio#bg").src = data.bg;
        syncPlayers();
        window.player.mute();
    });

    window.player.loadVideoById(vid);
    findOne('#ytplayer').scrollIntoView()
}

function showSearchResult(data) {
    let template = findOne("template#search-result-item");
    let container = findOne("#search-result");
    container.innerHTML = null;
    data.forEach( row => {
        let el = template.content.children[0].cloneNode(true);
        container.appendChild(el);
        console.log(el.dataset, el)
        el.dataset.vid = row.vid;
        el.querySelector(".title").innerHTML = row.title;
        el.querySelector(".thumbnail").src = row.thumbnail_url;
        el.addEventListener("click", () => loadVideo(el.dataset.vid))
    })


    
}

domLoaded(() => {
    find("[data-input-wrap]").forEach((wrap) => {
        let el = wrap.querySelector(wrap.dataset.inputWrap);
        ["change", "input"].forEach(eventName => 
            el.addEventListener(eventName, () => wrap.classList.toggle("has-value", el.value.length))
        ) ;
        el.addEventListener("focus", () => wrap.classList.add("active"));
        el.addEventListener("blur", () => wrap.classList.remove("active"));
    });

    find("[data-search-field]").forEach(async (el) => {
        el.closest("form").addEventListener("submit", async (e) => {
            e.preventDefault();
            let searchUrl = `/q/${el.value}`;
            if (window.searchHistory[el.value]) {
                searchUrl += "?"+ new URLSearchParams({id: window.searchHistory[el.value]}).toString();
            }
            const response = await fetch(searchUrl);
            const searchResult = await response.json();
            window.searchHistory[el.value] = searchResult["search_id"];
            showSearchResult(searchResult.data);
            localStorage.setItem("searchHistory", JSON.stringify(window.searchHistory));

            // findOne('#ytplayer').scrollIntoView();
        })
    })

    find("audio[data-vol-control]").forEach((player) => {
        const volControl = player.dataset.volControl;
        const slider = findOne(volControl);
        ["input", "change"].forEach( (eventName) => slider.addEventListener(eventName, (e)=> {
            player.volume = slider.value / 100;
        }))
        
        slider.dispatchEvent(new Event("change"));

        
    })
})


