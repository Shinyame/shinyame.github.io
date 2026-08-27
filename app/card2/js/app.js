const qs=id=>document.getElementById(id)

const DEFAULTS = {
  players:32,
  time:25,
  break:0
}

const CSP = [
 {rank:"1st",point:15,lose:0,min:2},
 {rank:"2nd",point:12,lose:1,min:3},
 {rank:"3–4",point:10,lose:1,min:8},
 {rank:"5–8",point:8,lose:2,min:13},
 {rank:"9–16",point:6,lose:3,min:26},
 {rank:"17–32",point:5,lose:3,min:41},
 {rank:"33–48",point:4,lose:4,min:56},
]

function nextHour(d){
  d=new Date(d)
  if(d.getMinutes()>0)d.setHours(d.getHours()+1)
  d.setMinutes(0,0,0)
  return d
}

const fmt=d=>d.toTimeString().slice(0,5)

function calc(){
  const p = Number(qs("players").value) || DEFAULTS.players
  const t = Number(qs("time").value) || DEFAULTS.time
  const b = Number(qs("break").value) || DEFAULTS.break
  const useCSP = qs("csp").checked

  const maxR = Math.ceil(Math.log2(p))
  const minR = Math.max(1,maxR-1)

  const start = nextHour(new Date())
  const endMin = new Date(start.getTime()+(minR*t+(minR-1)*b)*60000)
  const endMax = new Date(start.getTime()+(maxR*t+(maxR-1)*b)*60000)

  let html = `
    <p><b>Players:</b> ${p}</p>
    <p><b>Rounds:</b> ${minR} – ${maxR}</p>
    <p><b>Start:</b> ${fmt(start)}</p>
    <p><b>End:</b> ${fmt(endMin)} – ${fmt(endMax)}</p>
  `

  if(useCSP) html+=renderCSP(p,maxR)

  qs("result").innerHTML=html
  qs("result").style.display="block"
}

function renderCSP(p,r){
  let h="<div class='csp-box'><b>CSP Points</b>"
  CSP.forEach(e=>{
    if(p>=e.min){
      const win=r-e.lose
      h+=`<p>${e.rank}: ${e.point} CSP (${win}W-${e.lose}L)</p>`
    }
  })
  return h+"</div>"
}

/* Dark mode persist */
const dark = localStorage.getItem("dark")==="1"
document.body.classList.toggle("dark",dark)
qs("dark").checked=dark
qs("dark").onchange=e=>{
  localStorage.setItem("dark",e.target.checked?"1":"0")
  document.body.classList.toggle("dark")
}
