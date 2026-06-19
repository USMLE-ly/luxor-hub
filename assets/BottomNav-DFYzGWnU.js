import{c as s,J as r,u as l,j as e,q as h}from"./index-wsipGVh9.js";import{S as d}from"./shirt-Cy3uMN49.js";import{m as i}from"./proxy-B6rGpP5l.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=s("CalendarDays",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M16 14h.01",key:"1gbofw"}],["path",{d:"M8 18h.01",key:"lrp35t"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M16 18h.01",key:"kzsmim"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=s("House",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"1d0kgt"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=s("ScanLine",[["path",{d:"M3 7V5a2 2 0 0 1 2-2h2",key:"aa7l1z"}],["path",{d:"M17 3h2a2 2 0 0 1 2 2v2",key:"4qcy5o"}],["path",{d:"M21 17v2a2 2 0 0 1-2 2h-2",key:"6vwrx8"}],["path",{d:"M7 21H5a2 2 0 0 1-2-2v-2",key:"ioqczr"}],["path",{d:"M7 12h10",key:"b7w52i"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=s("Sparkles",[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]]),u=[{label:"DNA",icon:c,path:"/dashboard"},{label:"Schedule",icon:p,path:"/outfit-calendar"},{label:"Analysis",icon:m,path:"/outfit-analysis"},{label:"Dressing Room",icon:y,path:"/dressing-room"},{label:"Closet",icon:d,path:"/closet"}];function v(){const o=r(),n=l();return e.jsx("nav",{"aria-label":"Primary",className:"fixed bottom-0 inset-x-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/50 pb-[env(safe-area-inset-bottom)]",children:e.jsx("ul",{className:"flex items-center justify-around h-14 max-w-lg mx-auto list-none m-0 p-0",children:u.map(a=>{const t=o.pathname===a.path||a.path==="/dashboard"&&o.pathname==="/style-dna"||a.path==="/dashboard"&&o.pathname==="/color-type";return e.jsx("li",{className:"flex",children:e.jsxs("button",{type:"button",onClick:()=>{h("selection"),n(a.path)},"aria-label":a.label,"aria-current":t?"page":void 0,className:"flex flex-col items-center justify-center gap-0.5 min-w-11 min-h-11 px-2 relative rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",children:[e.jsx(i.div,{animate:{scale:t?1.12:1},transition:{type:"spring",stiffness:400,damping:20},children:e.jsx(a.icon,{className:`w-[18px] h-[18px] transition-colors ${t?"text-primary":"text-muted-foreground"}`,strokeWidth:t?2.4:1.8,"aria-hidden":"true"})}),e.jsx("span",{className:`text-[9px] font-sans transition-colors ${t?"text-primary font-semibold":"text-muted-foreground"}`,children:a.label}),t&&e.jsx(i.div,{layoutId:"bottomNavDot",className:"absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary",transition:{type:"spring",stiffness:500,damping:30}})]})},a.label)})})})}export{v as B,p as C,y as S,m as a};
