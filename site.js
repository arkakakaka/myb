(function(){
  var R=document.documentElement,T={ru:R.getAttribute("data-t-ru"),en:R.getAttribute("data-t-en")};
  function pick(l){
    document.querySelectorAll("[data-lang]").forEach(function(s){s.hidden=s.getAttribute("data-lang")!==l;});
    document.querySelectorAll(".lang button").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.l===l));});
    document.documentElement.lang=l; document.title=T[l];
    document.querySelectorAll("a[data-keep]").forEach(function(a){a.href=a.getAttribute("data-keep")+"#"+l;});
    if(history.replaceState) history.replaceState(null,"","#"+l);
  }
  var h=(location.hash||"").slice(1), nav=(navigator.languages&&navigator.languages[0])||navigator.language||"en";
  pick(h==="ru"||h==="en"?h:(/^ru/i.test(nav)?"ru":"en"));
  document.querySelectorAll(".lang button").forEach(function(b){b.addEventListener("click",function(){pick(b.dataset.l);});});
  window.addEventListener("hashchange",function(){var x=(location.hash||"").slice(1);if(x==="ru"||x==="en")pick(x);});
  document.querySelectorAll(".copy").forEach(function(b){b.addEventListener("click",function(){
    var t=b.getAttribute("data-copy"), done=b.getAttribute("data-done"), was=b.textContent;
    function ok(){b.textContent=done;setTimeout(function(){b.textContent=was;},1600);}
    function sel(){var c=b.parentNode.querySelector("code");var r=document.createRange();r.selectNodeContents(c);var s=getSelection();s.removeAllRanges();s.addRange(r);}
    try{navigator.clipboard.writeText(t).then(ok,sel);}catch(e){sel();}
  });});
})();
