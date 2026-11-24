/* ---------- Boeing 747: small UI helpers (prefix jb) ---------- */
/* the header selector now has three buttons: tighten it on narrow phones so the logo and the name next to it are never clipped (checked at 360 and 390 px) */
(function(){ try{ const st=document.createElement("style"); st.id="jbStyle";
  st.textContent="@media (max-width:430px){.top{gap:7px}.top .seg button{padding:0 8px;font-size:13px}.top .uiTheme{width:40px;height:40px}.top .brand .mark,.top .brand .mark svg{width:42px;height:42px}.top .brand h1{font-size:20px}}@media (max-width:380px){.top{gap:6px}.top .seg button{padding:0 6px;font-size:12.5px}.top .brand .mark,.top .brand .mark svg{width:38px;height:38px}.top .brand{gap:8px}}";
  document.head.appendChild(st); }catch(e){} })();
