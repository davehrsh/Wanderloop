/* Wanderloop demo checkout. All prices, payment and fulfillment are simulated. */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const eur=n=>"€"+Math.round(n).toLocaleString("en-IE");
const storeKey="wanderloop-demo-v2";
let model={balance:0,trips:[],arm:"hybrid"};
try{const v=JSON.parse(localStorage.getItem(storeKey));if(v&&Array.isArray(v.trips)&&Number.isFinite(v.balance))model=v}catch{}
const arms={control:[0,0,"Control · no incentive"],match:[14,0,"Price match"],credits:[0,14,"Credits only"],hybrid:[10,4,"Hybrid discount + credits"]};
if(!arms[model.arm])model.arm="hybrid";
model.trips=model.trips.filter(t=>t.channel==="direct");
let flow=null,returnFocus=null;
const persist=()=>{try{localStorage.setItem(storeKey,JSON.stringify(model))}catch{};updateNav()};
function updateNav(){const nav=document.querySelector(".credit-button");if(nav)nav.innerHTML=icon("loop")+" Loop Credits"+(model.balance?" · "+eur(model.balance):"");const trip=document.querySelector('[data-action="trips"]');if(trip)trip.textContent="My trips"+(model.trips.length?" ("+model.trips.length+")":"")}
function applyArm(){const h=hotels.find(h=>h.id==="republique");[h.discount,h.credit]=arms[model.arm];render();updateNav()}
const original=handle,originalOpen=openModal,originalClose=closeModal;
openModal=function(html){const wasOpen=$("overlay").classList.contains("open");if(!wasOpen)returnFocus=document.activeElement;originalOpen(html);if(wasOpen)lastFocus=returnFocus;document.querySelector(".modal").scrollTop=0;};
closeModal=function(){originalClose();document.querySelector(".modal").classList.remove("checkout-modal");flow=null;if(returnFocus&&returnFocus.isConnected)returnFocus.focus();returnFocus=null};
$("closeModal").removeEventListener("click",originalClose);
$("closeModal").addEventListener("click",closeModal);
const act=(action,label,cls="secondary",id="")=>'<button type="button" class="'+cls+'" data-action="'+action+'"'+(id?' data-id="'+safe(id)+'"':'')+'>'+label+'</button>';
function begin(h,alt){
 const selected=alt?{...h,direct:h.alternate.price,discount:0,credit:0,external:null,flex:h.alternate.flex,breakfast:h.alternate.breakfast}:h;
 const base=cost(selected,"base");
 const total=cost(selected);
 flow={h: selected,channel:"direct",ci,co,nights,guests,rooms,base,total,discount:base-total,earn:credits(selected),redeem:0,guest:{first:"",last:"",email:"",phone:"",request:""},step:0,busy:false,method:"card"};
 step(0);
}
const due=()=>Math.max(0,flow.total-flow.redeem);
function summary(){
 const f=flow;
 return '<aside class="ck-summary"><div class="ck-stamp">'+"WANDERLOOP / DIRECT"+'</div><h3>'+safe(f.h.name)+'</h3><p>'+safe(f.h.room)+' · '+f.guests+' adults · '+f.rooms+' '+(f.rooms===1?"room":"rooms")+'</p><div class="ck-dates"><div><small>CHECK IN</small><b>'+labelDate(f.ci)+'</b></div><div><small>CHECK OUT</small><b>'+labelDate(f.co)+'</b></div><div><small>STAY</small><b>'+f.nights+' '+(f.nights===1?"night":"nights")+'</b></div></div><p class="ck-terms">'+(f.h.breakfast?"Breakfast included":"Room only")+' · '+(f.h.flex?"Free cancellation before simulated stay":"Non-refundable")+'</p><div class="ck-line"><span>Stay total before incentive</span><b>'+eur(f.base)+'</b></div>'+(f.discount?'<div class="ck-line positive"><span>Instant Wanderloop discount</span><b>−'+eur(f.discount)+'</b></div>':'')+(f.redeem?'<div class="ck-line positive"><span>Available credits applied</span><b>−'+eur(f.redeem)+'</b></div>':'')+'<div class="ck-line"><span>Additional demo fees</span><b>€0</b></div><div class="ck-total"><span>Pay today<small>Illustrative all-in total</small></span><strong>'+eur(due())+'</strong></div>'+(f.earn?'<div class="ck-reward">'+icon("loop")+' <div><b>Earn '+eur(f.earn)+' future credits</b><small>After your eligible stay is completed. Not deducted today.</small></div></div>':'')+'</aside>';
}
function label(t,name,type="text",required=false){return '<label class="ck-field">'+t+'<input name="'+name+'" type="'+type+'" '+(required?"required ":"")+'value="'+safe(flow.guest[name])+'" autocomplete="off" maxlength="100"></label>'}
function step(i,error=""){
 if(!flow)return;flow.step=i;const f=flow;
 const direct=f.channel==="direct",heading=["Who's travelling?","Review your stay","Complete your booking"][i];
 const trail=["Guest details","Review","Payment"].map((v,j)=>'<span class="'+(j===i?"current":j<i?"complete":"")+'"><i>'+(j<i?"✓":j+1)+'</i>'+v+'</span>').join("");
 let content="";
 if(i===0){
  content='<form id="ckGuest"><div class="ck-formhead"><h3>Lead guest</h3>'+act("ck-fill","Use sample details","link")+'</div><p>Use fictional contact details only. This demonstration does not send emails.</p><div class="ck-fields">'+label("First name","first","text",true)+label("Last name","last","text",true)+label("Email address","email","email",true)+label("Phone (optional)","phone","tel")+'</div><label class="ck-field">Special requests (optional)<textarea name="request" maxlength="300" placeholder="Arrival time, preferences…">'+safe(f.guest.request)+'</textarea></label><button class="primary ck-wide" type="submit">Continue to review '+icon("arrow")+'</button></form>';
 }else if(i===1){
  content='<h3>Check the details</h3><div class="ck-detail"><b>'+safe(f.guest.first+" "+f.guest.last)+'</b><span>'+safe(f.guest.email)+'</span>'+(f.guest.phone?'<span>'+safe(f.guest.phone)+'</span>':'')+(f.guest.request?'<small>Request: '+safe(f.guest.request)+'</small>':'')+act("ck-back","Edit guest","link")+'</div><h3>Booking conditions</h3><p>'+ (f.h.flex?"Full refund if cancelled before simulated stay completion.":"Non-refundable. Cancellation does not earn credits.")+' '+(f.h.breakfast?"Breakfast is included.":"Breakfast is not included.")+'</p>'+(direct?'<h3>Loop Credits</h3><label class="ck-wallet"><input id="ckRedeem" type="checkbox" '+(f.redeem?"checked ":"")+(model.balance<=0?"disabled ":"")+'> <span><b>Use available credits</b><small>'+eur(model.balance)+' available · future earnings cannot be used today.</small></span></label>':'<div class="notice">Partner bookings do not earn or redeem Wanderloop Credits. The partner owns the booking journey.</div>')+'<div class="notice">Demo rate and availability rechecked. No live supplier connection.</div><div class="ck-actions">'+act("ck-back","Back")+act("ck-pay","Continue to payment "+icon("arrow"),"primary")+'</div>';
 }else{
  content='<h3>Payment method</h3><p>Choose a simulated payment. No card number, CVV, bank account or real payment information is required.</p><form id="ckPayment"><label class="ck-wallet"><input type="radio" name="method" value="card" '+(f.method==="card"?"checked":"")+'> <span><b>Demo credit / debit card</b><small>Test card ending in 4242</small></span></label><label class="ck-wallet"><input type="radio" name="method" value="wallet" '+(f.method==="wallet"?"checked":"")+'> <span><b>Demo digital wallet</b><small>Simulated wallet authorization</small></span></label><label class="ck-field">Payment scenario<select name="scenario"><option value="success">Approve demo payment</option><option value="decline">Decline demo payment (test retry)</option></select></label><label class="ck-consent"><input type="checkbox" name="consent" required><span>I have reviewed the stay, total price and cancellation conditions, and understand this is a fictional booking.</span></label>'+(error?'<p class="ck-error" role="alert">'+safe(error)+'</p>':'')+'<div class="ck-actions">'+act("ck-back","Back")+'<button type="submit" class="primary">Confirm & pay '+eur(due())+'</button></div></form>';
 }
 document.querySelector(".modal").classList.add("checkout-modal");
 openModal('<div class="eyebrow">'+"WANDERLOOP / DIRECT CHECKOUT"+'</div><h2 id="modalTitle">'+heading+'</h2><div class="ck-progress" aria-label="Checkout progress">'+trail+'</div><div class="ck-grid"><section class="ck-main">'+content+'</section>'+summary()+'</div><p class="fine ck-foot">Functional prototype · No actual Wanderloop booking, charge, reservation or email will occur.</p>');
}
function makeBooking(){
 if(!flow||flow.busy)return;
 const f=flow;
 if(f.redeem>model.balance){step(1,"Credit balance changed.");return}
 f.busy=true;
 const ref="WL-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,5).toUpperCase();
 const t={ref,hotel:f.h.name,channel:f.channel,partner:f.partner,ci:f.ci,co:f.co,nights:f.nights,guests:f.guests,rooms:f.rooms,room:f.h.room,flex:f.h.flex,breakfast:f.h.breakfast,paid:due(),redeemed:f.redeem,discount:f.discount,earn:f.earn,status:"confirmed",method:f.method,created:Date.now()};
 model.balance-=f.redeem;model.trips.unshift(t);persist();
 const guest=safe(f.guest.first);
 flow=null;
 document.querySelector(".modal").classList.add("checkout-modal");
 openModal('<div class="ck-confirm"><div class="ck-success">'+icon("check")+'</div><div class="eyebrow">DEMO BOOKING CONFIRMED</div><h2 id="modalTitle">Paris awaits, '+guest+'.</h2><p>Your '+(t.channel==="direct"?"Wanderloop":safe(t.partner))+' booking has been simulated successfully. No real payment was taken.</p><div class="ck-ticket"><small>BOOKING REFERENCE</small><strong>'+t.ref+'</strong><h3>'+safe(t.hotel)+'</h3><p>'+labelDate(t.ci)+' – '+labelDate(t.co)+' · '+t.guests+' adults · '+t.rooms+' room(s)</p><div class="ck-line"><span>Demo payment</span><b>'+eur(t.paid)+'</b></div>'+(t.earn?'<div class="ck-line positive"><span>Pending credits after stay</span><b>'+eur(t.earn)+'</b></div>':'')+'</div><div class="ck-actions">'+act("receipt","Download receipt","secondary",t.ref)+act("trips","View my trips "+icon("arrow"),"primary")+'</div></div>');
 render();
}
function tripList(){
 flow=null;document.querySelector(".modal").classList.add("checkout-modal");
 openModal('<div class="eyebrow">YOUR TRAVEL NOTEBOOK / DEMO</div><h2 id="modalTitle">My trips.</h2><p>Bookings are stored in this browser, without contact or payment details. Use the controls to demonstrate the stay lifecycle.</p>'+(model.trips.length?model.trips.map(t=>'<article class="ck-trip"><div class="ck-triphead"><div><small>'+safe(t.ref)+' · '+(t.channel==="direct"?"Wanderloop":safe(t.partner))+'</small><h3>'+safe(t.hotel)+'</h3></div><span class="ck-status">'+safe(t.status)+'</span></div><p>'+labelDate(t.ci)+' – '+labelDate(t.co)+' · '+t.guests+' adults · '+eur(t.paid)+' paid in demo</p><p>'+ (t.status==="confirmed"&&t.earn?eur(t.earn)+" pending future credits":t.status==="completed"&&t.earn?eur(t.earn)+" credits earned":t.status==="cancelled"?(t.flex?"Demo payment refunded; redeemed credits restored.":"Non-refundable; no credits earned."):"")+'</p><div class="ck-actions">'+act("receipt","Receipt","secondary",t.ref)+(t.status==="confirmed"?act("complete-trip","Simulate stay completion","primary",t.ref)+act("cancel-trip","Cancel booking","link",t.ref):"")+'</div></article>').join(""):'<div class="notice">No bookings yet. Choose a hotel to begin.</div>')+'<div class="ck-actions">'+act("close-and-stays","Browse stays","primary")+act("demo-lab","Demo controls","secondary")+'</div>');
}
function wallet(){
 const pending=model.trips.filter(t=>t.status==="confirmed").reduce((s,t)=>s+t.earn,0);
 flow=null;
 openModal('<div class="eyebrow">WANDERLOOP / LOYALTY</div><h2 id="modalTitle">Make the next trip count.</h2><div class="ck-bal"><small>AVAILABLE FOR YOUR NEXT STAY</small><strong>'+eur(model.balance)+'</strong><span>'+eur(pending)+' pending from confirmed stays</span></div><h3>How it works</h3><p>Eligible direct bookings earn the displayed reward only after a simulated stay completion. Available credits reduce the payable amount on a future direct booking; future credits are never subtracted from today’s price.</p><p>Cancelled stays earn nothing. A flexible cancellation restores any redeemed balance. No expiry is modeled in this prototype.</p><div class="ck-actions">'+act("trips","My trips","primary")+act("close-and-stays","Find another stay")+'</div>');
}
function demoLab(){
 flow=null;
 openModal('<div class="eyebrow">PROTOTYPE / EXPERIMENT CONTROLS</div><h2 id="modalTitle">Explore the four treatments.</h2><p>Manually switch the illustrative incentive for 9Hotel République. The comparable partner remains €336 for the reference two-night stay. These are demo scenarios, not personalized prices or measured experiment results.</p><div class="ck-arms">'+Object.entries(arms).map(([k,a])=>'<button class="ck-arm '+(model.arm===k?"selected":"")+'" data-action="arm" data-id="'+k+'"><b>'+safe(a[2])+'</b><strong>'+eur(350-a[0])+'</strong><small>'+eur(a[1])+' future credits</small></button>').join("")+'</div><p class="fine">Reference direct contribution €25; affiliate contribution €8 only after partner completion. The demo does not establish incremental profitability.</p><div class="ck-actions">'+act("close-and-stays","See listing","primary")+act("reset-demo","Reset all demo trips & credits","secondary")+'</div>');
}
function receipt(t){
 const text=["WANDERLOOP — DEMO RECEIPT","Not a real reservation or payment.","Reference: "+t.ref,"Hotel: "+t.hotel,"Booking channel: "+(t.channel==="direct"?"Wanderloop":t.partner),"Check-in: "+t.ci,"Check-out: "+t.co,"Guests: "+t.guests,"Rooms: "+t.rooms,"Status: "+t.status,"Instant discount: "+eur(t.discount),"Credits redeemed: "+eur(t.redeemed),"Original simulated payment: "+eur(t.paid),"Future credits: "+eur(t.earn),""].join("\n");
 const u=URL.createObjectURL(new Blob([text],{type:"text/plain;charset=utf-8"}));const a=document.createElement("a");a.href=u;a.download=t.ref+"-demo-receipt.txt";a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);
}
handle=function(action,id,alt){
 const h=hotels.find(x=>x.id===id),t=model.trips.find(x=>x.ref===id);
 switch(action){
 case "book":if(h)begin(h,alt);break;
 case "external":if(h)window.location.assign(partnerUrl(h.id,h.partner));break;
 case "ck-fill":if(flow){flow.guest={first:"Alex",last:"Martin",email:"alex@example.com",phone:"",request:""};step(0)}break;
 case "ck-back":if(flow)step(Math.max(0,flow.step-1));break;
 case "ck-pay":if(flow)step(2);break;
 case "trips":tripList();break;
 case "credits":wallet();break;
 case "account":openModal('<div class="eyebrow">YOUR TRAVEL NOTEBOOK</div><h2 id="modalTitle">Guest account.</h2><p>Your demo bookings, rewards and saved stays are stored locally. No sign-in is required.</p><div class="ck-actions">'+act("trips","My trips","primary")+act("credits","Loop Credits")+act("saved","Saved places")+act("demo-lab","Demo controls")+'</div>');break;
 case "demo-lab":demoLab();break;
 case "arm":if(arms[id]){model.arm=id;persist();applyArm();demoLab()}break;
 case "reset-demo":if(confirm("Reset all simulated trips and credits in this browser?")){model={balance:0,trips:[],arm:"hybrid"};persist();applyArm();demoLab()}break;
 case "close-and-stays":closeModal();original("stays");break;
 case "receipt":if(t)receipt(t);break;
 case "complete-trip":if(t&&t.status==="confirmed"){t.status="completed";model.balance+=t.earn;persist();tripList();toast(t.earn?eur(t.earn)+" credits added":"Demo stay completed")}break;
 case "cancel-trip":if(t&&t.status==="confirmed")openModal('<div class="eyebrow">MANAGE DEMO BOOKING</div><h2 id="modalTitle">Cancel your stay?</h2><p>'+safe(t.hotel)+' · '+safe(t.ref)+'</p><p>'+(t.flex?"Your simulated payment will be refunded and redeemed credits restored.":"This is non-refundable. No payment or credit refund will be simulated.")+' No future credits will be earned.</p><div class="ck-actions">'+act("confirm-cancel","Confirm cancellation","primary",t.ref)+act("trips","Keep booking")+'</div>');break;
 case "confirm-cancel":if(t&&t.status==="confirmed"){t.status="cancelled";if(t.flex)model.balance+=t.redeemed;persist();tripList();toast("Demo booking cancelled")}break;
 default: if(action==="saved"&&$("overlay").classList.contains("open"))closeModal(); original(action,id,alt);
 }
};
document.addEventListener("submit",e=>{
 if(e.target.id==="ckGuest"){e.preventDefault();if(!flow)return;const data=new FormData(e.target);for(const k of Object.keys(flow.guest))flow.guest[k]=String(data.get(k)||"").trim();if(!flow.guest.first||!flow.guest.last){toast("Enter a first and last name.");return}step(1)}
 if(e.target.id==="ckPayment"){e.preventDefault();if(!flow||flow.busy)return;const data=new FormData(e.target);flow.method=String(data.get("method"));if(data.get("scenario")==="decline"){step(2,"Demo payment declined. Select the approval scenario and retry. No charge or booking was made.");return}makeBooking()}
});
document.addEventListener("change",e=>{if(e.target.id==="ckRedeem"&&flow){flow.redeem=e.target.checked?Math.min(model.balance,flow.total):0;step(1)}});
$("overlay").addEventListener("click",()=>{if(!$("overlay").classList.contains("open"))document.querySelector(".modal").classList.remove("checkout-modal")});
const nav=document.querySelector(".navlinks");const trips=document.createElement("button");trips.dataset.action="trips";trips.textContent="My trips";nav.insertBefore(trips,nav.lastElementChild);
applyArm();
})();