function domLoaded(e){window.addEventListener("DOMContentLoaded",(t=>e(t)))}const findOne=(...e)=>document.querySelector(...e),findNodes=(...e)=>document.querySelectorAll(...e),find=(...e)=>Array.from(document.querySelectorAll(...e)),findNearby=(e,t,o,n)=>(void 0===o&&(o=".shopify-section"),console.log("findNearby",e,t,o,n),Array.from(e.closest(o).querySelectorAll(t))),findNext=(e,t,o)=>{const n=Array.from(e.parentElement.children),r=n.indexOf(e),i=Array.from(e.parentElement.querySelectorAll(t));let l;for(let e of i){const t=n.indexOf(e);if("prev"==o&&t<r)l=e;else{if("prev"==o&&t>=r)break;if(t>r){l=e;break}}}return l};function scrollWithOffsetY(e,t){void 0===t&&(t=-1*document.querySelector("header").offsetHeight);const o=e.getBoundingClientRect().top+window.pageYOffset+t;window.scrollTo({top:o,behavior:"smooth"})}function recalcBtnSvg(){const e=find(".btn");console.log("found buttons",e);for(let t of e){if(t.clientWidth<140)continue;let e=t.querySelector(".inner-path"),o=t.querySelector(".outer-path");if(!e||!o)continue;let n=e.getAttribute("d").split(" "),r=o.getAttribute("d").split(" ");n.forEach(((e,o)=>{if("h"!=e||void 0===n[o+1])return;let r=t.clientWidth-27;n[o+1]<0&&(r*=-1),n[o+1]=r})),r.forEach(((e,o)=>{if("h"!=e||void 0===r[o+1])return;let n=t.clientWidth-20;r[o+1]<0&&(n*=-1),r[o+1]=n})),e.setAttribute("d",n.join(" ")),o.setAttribute("d",r.join(" ")),t.querySelector("#svg-btn").style.left=70-t.clientWidth/2+"px"}}

domLoaded(() => {
    find("[data-input-wrap]").forEach((wrap) => {
        let el = wrap.querySelector(wrap.dataset.inputWrap);
        el.addEventListener("change", () => wrap.classList.toggle("has-value", el.value.length));
        el.addEventListener("focus", () => wrap.classList.add("active"));
        el.addEventListener("blur", () => wrap.classList.remove("active"));
    });

    find("[data-search-field]").forEach(async (el) => {
        el.closest("form").addEventListener("submit", async (e) => {
            e.preventDefault();
            window.player.unMute();
            fetch('/v/'+el.value).then(async (response) => {
                let data = await response.json();
                findOne("audio#vocals").src = data.vocals;
                findOne("audio#bg").src = data.bg;
                let curTime = player.getCurrentTime();
                find("audio").forEach(a => {
                    a.currentTime = curTime;
                    a.play();
                });
                window.player.mute();
            });

            let player = window.player;
            window.player.loadVideoById(el.value);
            findOne('#ytplayer').scrollIntoView();
            
            
            console.log(window.player)

            window.player.addEventListener("onStateChange", (e) => {
                console.log("youtube state", e)
                if (e.data === YT.PlayerState.PLAYING) {
                    let curTime = player.getCurrentTime();
                    find("audio").forEach(a => {
                        a.currentTime = curTime;
                        a.play();
                    });
                } else {
                    find("audio").forEach(a => a.pause())
                }
            })
        })
    })

    find("audio[data-vol-control]").forEach((player) => {
        const volControl = player.dataset.volControl;
        if (!volControl) return;
        const slider = findOne(volControl);
        slider.addEventListener("change", (e)=> {
            console.log(slider.id + " change", slider.value, slider.value/100);
            player.volume = slider.value / 100;
        })
        
        slider.dispatchEvent(new Event("change"));

        
    })
})


