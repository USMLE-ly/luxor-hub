import{c as r,r as u}from"./index-wsipGVh9.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=r("Cloud",[["path",{d:"M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z",key:"p7xjir"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=r("Droplets",[["path",{d:"M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z",key:"1ptgy4"}],["path",{d:"M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97",key:"1sl1rz"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=r("MapPin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]),n="luxor-user-location",g=30*60*1e3;function k(){const[d,c]=u.useState({lat:40.7128,lon:-74.006,city:"New York",loading:!0});return u.useEffect(()=>{(async()=>{try{const a=localStorage.getItem(n);if(a){const t=JSON.parse(a);if(Date.now()-t.timestamp<g){c({lat:t.lat,lon:t.lon,city:t.city,loading:!1});return}}}catch{}let e=40.7128,o=-74.006,l=!1;if(navigator.geolocation)try{const a=await new Promise((t,i)=>navigator.geolocation.getCurrentPosition(t,i,{timeout:5e3}));e=a.coords.latitude,o=a.coords.longitude,l=!0}catch{}if(!l)try{const a=await fetch("https://ipapi.co/json/",{signal:AbortSignal.timeout(4e3)});if(a.ok){const t=await a.json();if(t.latitude&&t.longitude){e=t.latitude,o=t.longitude;const i=t.city||"Your area";c({lat:e,lon:o,city:i,loading:!1}),localStorage.setItem(n,JSON.stringify({lat:e,lon:o,city:i,timestamp:Date.now()}));return}}}catch{}let s="Your area";try{const a=await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${e}&longitude=${o}&localityLanguage=en`,{signal:AbortSignal.timeout(4e3)});if(a.ok){const t=await a.json();s=t.city||t.locality||t.principalSubdivision||"Your area"}}catch{}c({lat:e,lon:o,city:s,loading:!1}),localStorage.setItem(n,JSON.stringify({lat:e,lon:o,city:s,timestamp:Date.now()}))})()},[]),d}export{m as C,S as D,w as M,k as u};
