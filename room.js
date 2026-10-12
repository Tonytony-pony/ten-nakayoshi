/* ぬいぐるみの へや：ななめ上から 見た キューブの へやと、もようがえ アイテム。
   へやは 10×10 の ゆかと たかさ 7 の かべ。すべて おなじ 図法（アイソメトリック）で かくので
   アイテムどうしの かくどが かならず そろう。 */
(function(){
'use strict';

var S = 19, OX = 180, OY = 170, H = 7, N = 10;
function fx(n){ return Math.round(n * 10) / 10; }
function P(u, v, z){ return [OX + (u - v) * 0.866 * S, OY + (u + v) * 0.5 * S - (z || 0) * S]; }
function pts(arr){ return arr.map(function(p){ var q = P(p[0], p[1], p[2]); return fx(q[0]) + ',' + fx(q[1]); }).join(' '); }
var EDGE = ' stroke="rgba(90,58,74,.28)" stroke-width="1" stroke-linejoin="round"';
function poly(arr, fill, edge){ return '<polygon points="' + pts(arr) + '" fill="' + fill + '"' + (edge === false ? '' : EDGE) + '/>'; }
function mat(a){ return 'matrix(' + a.map(fx).join(',') + ')'; }

/* へいめんの ざひょうを へやの めんに はりつける へんかん */
var M_LEFT  = mat([0.866*S, -0.5*S, 0, S, OX - 0.866*S*N, OY + 0.5*S*N - H*S]); /* ひだりの かべ x:0(てまえ)→10(おく) y:うえ→した */
var M_RIGHT = mat([0.866*S,  0.5*S, 0, S, OX, OY - H*S]);                     /* みぎの かべ x:0(おく)→10(てまえ) */
function mFloor(z){ return mat([0.866*S, 0.5*S, -0.866*S, 0.5*S, OX, OY - (z || 0) * S]); }
function mPlaneV(v0){ return mat([0.866*S, 0.5*S, 0, S, OX - 0.866*S*v0, OY + 0.5*S*v0]); } /* x:u y:-z */
function onLeft(inner){ return '<g transform="' + M_LEFT + '">' + inner + '</g>'; }
function onRight(inner){ return '<g transform="' + M_RIGHT + '">' + inner + '</g>'; }
function onFloor(inner, z){ return '<g transform="' + mFloor(z) + '">' + inner + '</g>'; }

function shade(hex, p){
  var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  function f(c){ return Math.round(p < 0 ? c * (1 + p) : c + (255 - c) * p); }
  return 'rgb(' + f(r) + ',' + f(g) + ',' + f(b) + ')';
}
function box(u0, v0, z0, du, dv, dz, col){
  var u1 = u0 + du, v1 = v0 + dv, z1 = z0 + dz;
  return poly([[u0,v1,z0],[u1,v1,z0],[u1,v1,z1],[u0,v1,z1]], shade(col, -0.08)) +
         poly([[u1,v0,z0],[u1,v1,z0],[u1,v1,z1],[u1,v0,z1]], shade(col, -0.2)) +
         poly([[u0,v0,z1],[u1,v0,z1],[u1,v1,z1],[u0,v1,z1]], shade(col, 0.12));
}
function cyl(u, v, z0, r, h, side, top){
  var b = P(u, v, z0), rx = 1.2247 * r * S, ry = 0.7071 * r * S, yt = b[1] - h * S;
  return '<path d="M' + fx(b[0]-rx) + ' ' + fx(yt) + ' L' + fx(b[0]-rx) + ' ' + fx(b[1]) +
         ' A' + fx(rx) + ' ' + fx(ry) + ' 0 0 0 ' + fx(b[0]+rx) + ' ' + fx(b[1]) + ' L' + fx(b[0]+rx) + ' ' + fx(yt) + 'Z" fill="' + side + '"' + EDGE + '/>' +
         '<ellipse cx="' + fx(b[0]) + '" cy="' + fx(yt) + '" rx="' + fx(rx) + '" ry="' + fx(ry) + '" fill="' + top + '"' + EDGE + '/>';
}
/* ゆかに たつ え（したの まんなかが きじゅん） */
function sprite(u, v, z, w, h, inner){
  var p = P(u, v, z);
  return '<g transform="translate(' + fx(p[0] - w/2) + ' ' + fx(p[1] - h) + ')">' + inner + '</g>';
}
function starPts(cx, cy, R, r){
  var out = [];
  for (var i = 0; i < 10; i++){
    var a = -Math.PI/2 + i * Math.PI/5, rr = i % 2 ? r : R;
    out.push(Math.round((cx + Math.cos(a)*rr)*100)/100 + ',' + Math.round((cy + Math.sin(a)*rr)*100)/100);
  }
  return out.join(' ');
}
function star(cx, cy, R, r, fill, extra){ return '<polygon points="' + starPts(cx, cy, R, r) + '" fill="' + fill + '"' + (extra||'') + '/>'; }
function crescent(cx, cy, R, fill){
  return '<path d="M' + cx + ' ' + (cy-R) + ' A' + R + ' ' + R + ' 0 0 0 ' + cx + ' ' + (cy+R) + ' A' + (R*0.55) + ' ' + R + ' 0 0 1 ' + cx + ' ' + (cy-R) + 'Z" fill="' + fill + '"/>';
}

/* ---------- もよう ---------- */
function flower(cx, cy, col){
  var s = '';
  for (var i = 0; i < 5; i++){
    var a = i * Math.PI * 2 / 5;
    s += '<circle cx="' + fx((cx + Math.cos(a)*0.09)*100)/100 + '" cy="' + fx((cy + Math.sin(a)*0.09)*100)/100 + '" r="0.07" fill="' + col + '"/>';
  }
  return s + '<circle cx="' + cx + '" cy="' + cy + '" r="0.05" fill="#ffe58a"/>';
}
var DEFS = '<style>.iso *{vector-effect:non-scaling-stroke}</style><defs>' +
  '<pattern id="p_base_wall" width="1" height="7" patternUnits="userSpaceOnUse"><rect width="1" height="7" fill="#fbf4ef"/><rect x="0.48" width="0.04" height="7" fill="#f4e9e2"/></pattern>' +
  '<pattern id="p_base_floor" width="3" height="1" patternUnits="userSpaceOnUse"><rect width="3" height="1" fill="#eadbc8"/><rect y="0.96" width="3" height="0.04" fill="#d8c4ab"/><rect x="1.5" width="0.04" height="1" fill="#dfccb4"/></pattern>' +
  '<pattern id="p_an_wall" width="1.4" height="1.4" patternUnits="userSpaceOnUse"><rect width="1.4" height="1.4" fill="#fff8e8"/>' + flower(0.35, 0.35, '#ffb7cf') + flower(1.05, 1.05, '#a8dcc8') + '</pattern>' +
  '<pattern id="p_an_floor" width="3" height="0.9" patternUnits="userSpaceOnUse"><rect width="3" height="0.9" fill="#e6c49c"/><rect y="0.86" width="3" height="0.04" fill="#c9a27a"/><rect x="1.5" width="0.04" height="0.9" fill="#d4ae84"/></pattern>' +
  '<pattern id="p_sw_wall" width="1.6" height="1.6" patternUnits="userSpaceOnUse"><rect width="1.6" height="1.6" fill="#ffe4ec"/>' +
    '<path d="M0.4 0.62 C0.22 0.5 0.25 0.32 0.4 0.36 C0.55 0.32 0.58 0.5 0.4 0.62Z" fill="#ff7f9a"/><ellipse cx="0.4" cy="0.34" rx="0.09" ry="0.035" fill="#7cc98a"/>' +
    '<circle cx="1.2" cy="1.2" r="0.06" fill="#fff"/><circle cx="1.2" cy="0.4" r="0.04" fill="#fff"/><circle cx="0.4" cy="1.2" r="0.05" fill="#ffc2d6"/></pattern>' +
  '<pattern id="p_sw_floor" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="#6e4127"/><rect x="0.05" y="0.05" width="0.9" height="0.9" fill="#8f5a38"/><rect x="1.05" y="1.05" width="0.9" height="0.9" fill="#8f5a38"/><rect x="1.05" y="0.05" width="0.9" height="0.9" fill="#9d6a48"/><rect x="0.05" y="1.05" width="0.9" height="0.9" fill="#9d6a48"/></pattern>' +
  '<pattern id="p_st_wall" width="2.2" height="2.2" patternUnits="userSpaceOnUse"><rect width="2.2" height="2.2" fill="#2f3a6b"/>' +
    star(0.5, 0.6, 0.14, 0.06, '#ffe58a') + star(1.6, 1.5, 0.1, 0.045, '#fff6c8') + '<circle cx="1.5" cy="0.4" r="0.035" fill="#cdd6ff"/><circle cx="0.7" cy="1.7" r="0.03" fill="#cdd6ff"/></pattern>' +
  '<pattern id="p_st_floor" width="1.6" height="1.6" patternUnits="userSpaceOnUse"><rect width="1.6" height="1.6" fill="#3a4280"/><rect width="1.6" height="0.05" fill="#4c56a3"/><rect width="0.05" height="1.6" fill="#4c56a3"/><circle cx="0.8" cy="0.8" r="0.04" fill="#8f9ae0"/></pattern>' +
  '<radialGradient id="g_glow"><stop offset="0" stop-color="#fff6c8" stop-opacity=".75"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></radialGradient>' +
  '<linearGradient id="g_gold" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ffe9a0"/><stop offset="1" stop-color="#e0a92e"/></linearGradient>' +
'</defs>';

/* ---------- テーマ・おきば ---------- */
var THEMES = [
  {id:'animal', name:'どうぶつの くに', icon:'🐰'},
  {id:'sweets', name:'おかしの くに',   icon:'🍰'},
  {id:'star',   name:'ほしぞらの くに', icon:'🌙'}
];
var SLOTS = [
  {id:'wall',   name:'かべがみ',   icon:'🎨'},
  {id:'floor',  name:'ゆか',       icon:'🟫'},
  {id:'rug',    name:'ラグ',       icon:'🧶'},
  {id:'window', name:'まど',       icon:'🌤️'},
  {id:'deco',   name:'かべかざり', icon:'🕰️'},
  {id:'bed',    name:'ベッド',     icon:'🛏️'},
  {id:'sofa',   name:'ソファ',     icon:'🛋️'},
  {id:'table',  name:'テーブル',   icon:'🍵'},
  {id:'light',  name:'ライト',     icon:'💡'},
  {id:'small',  name:'こもの',     icon:'🌷'}
];
/* かべ・ゆか だけは「なし」に できない */
var NEED = {wall:'base_wall', floor:'base_floor'};

/* ---------- かべの アイテム ---------- */
function winAnimal(){
  return onLeft('<g transform="translate(6.25 3)">' +
    '<rect x="-2.2" y="-1.85" width="4.4" height="0.12" rx="0.06" fill="#e8a0b8"/>' +
    '<rect x="-1.85" y="-1.6" width="3.7" height="3.2" rx="0.25" fill="#c99b6b"/>' +
    '<rect x="-1.65" y="-1.4" width="3.3" height="2.8" rx="0.15" fill="#bfe6ff"/>' +
    '<circle cx="1.05" cy="-0.8" r="0.3" fill="#ffe58a"/>' +
    '<path d="M-1.65 0.6 Q-0.85 0 0.05 0.6 Q0.85 0.1 1.65 0.5 L1.65 1.4 L-1.65 1.4Z" fill="#9fdc8f"/>' +
    '<circle cx="-1" cy="0.95" r="0.09" fill="#ff9cbd"/><circle cx="-0.4" cy="1.1" r="0.09" fill="#fff"/><circle cx="0.6" cy="0.9" r="0.09" fill="#ffe58a"/><circle cx="1.2" cy="1.1" r="0.09" fill="#ff9cbd"/>' +
    '<rect x="-0.06" y="-1.4" width="0.12" height="2.8" fill="#c99b6b"/><rect x="-1.65" y="-0.06" width="3.3" height="0.12" fill="#c99b6b"/>' +
    '<path d="M-2.05 -1.8 L-1.15 -1.8 Q-1.45 -0.3 -1.05 1.4 L-2.05 1.4Z" fill="#ffc2d6"/>' +
    '<path d="M2.05 -1.8 L1.15 -1.8 Q1.45 -0.3 1.05 1.4 L2.05 1.4Z" fill="#ffc2d6"/>' +
    '<rect x="-2" y="1.55" width="4" height="0.2" rx="0.05" fill="#b98552"/></g>');
}
function winSweets(){
  var chips = '';
  for (var i = 0; i < 10; i++){
    var a = i * Math.PI / 5 + 0.3;
    chips += '<circle cx="' + fx(Math.cos(a)*1.45*100)/100 + '" cy="' + fx(Math.sin(a)*1.45*100)/100 + '" r="0.12" fill="#7a4a2c"/>';
  }
  return onLeft('<g transform="translate(6.25 3)">' +
    '<circle r="1.7" fill="#e3b071"/>' + chips +
    '<circle r="1.2" fill="#ffd6e6"/>' +
    '<circle cx="-0.35" cy="0.2" r="0.35" fill="#fff"/><circle cx="0.05" cy="0" r="0.42" fill="#fff"/><circle cx="0.45" cy="0.25" r="0.33" fill="#fff"/>' +
    star(-0.55, -0.6, 0.18, 0.08, '#ffe58a') + '<circle cx="0.6" cy="-0.55" r="0.1" fill="#ff9cbd"/>' +
    '<rect x="-0.06" y="-1.2" width="0.12" height="2.4" fill="#e3b071"/><rect x="-1.2" y="-0.06" width="2.4" height="0.12" fill="#e3b071"/></g>');
}
function winStar(){
  return onLeft('<g transform="translate(6.25 3)">' +
    '<path d="M-1.75 1.5 L-1.75 -0.4 A1.75 1.75 0 0 1 1.75 -0.4 L1.75 1.5Z" fill="#7c8ad6"/>' +
    '<path d="M-1.5 1.3 L-1.5 -0.35 A1.5 1.5 0 0 1 1.5 -0.35 L1.5 1.3Z" fill="#1d2450"/>' +
    crescent(0.75, -0.55, 0.45, '#ffe58a') +
    star(-0.9, -0.5, 0.12, 0.05, '#fff6c8') + star(-0.4, 0.6, 0.09, 0.04, '#ffe58a') + star(0.9, 0.75, 0.1, 0.045, '#fff6c8') + '<circle cx="-1" cy="0.9" r="0.05" fill="#cdd6ff"/>' +
    '<rect x="-0.05" y="-1.75" width="0.1" height="3.05" fill="#7c8ad6"/>' +
    '<rect x="-2" y="1.45" width="4" height="0.2" rx="0.05" fill="#5b6bb5"/></g>');
}
function winShooting(){
  return onLeft('<g transform="translate(6.25 3)">' +
    '<rect x="-2.1" y="-1.8" width="4.2" height="3.5" rx="0.3" fill="url(#g_gold)"/>' +
    '<rect x="-1.85" y="-1.55" width="3.7" height="3" rx="0.18" fill="#2a2f6b"/>' +
    '<rect x="-1.85" y="0.6" width="3.7" height="0.85" fill="#4a3f8f"/>' +
    '<path d="M1.1 -0.9 L-1.3 0.7" stroke="#fff6c8" stroke-width="3" stroke-linecap="round" opacity=".55"/>' +
    '<path d="M1.1 -0.9 L-0.4 0.1" stroke="#fff" stroke-width="2" stroke-linecap="round"/>' +
    star(1.15, -0.95, 0.32, 0.13, '#ffe58a') +
    star(-1.2, -1, 0.12, 0.05, '#fff6c8') + star(0.2, 0.9, 0.1, 0.04, '#fff6c8') + star(1.4, 0.4, 0.09, 0.04, '#ffe58a') +
    '<rect x="-2.2" y="1.65" width="4.4" height="0.2" rx="0.05" fill="#e0a92e"/></g>');
}
function decoAnimal(){
  return onRight('<g transform="translate(5.9 2.5)">' +
    '<polygon points="-0.85,-0.55 -0.7,-1.35 -0.15,-0.9" fill="#f7c59f"/><polygon points="0.85,-0.55 0.7,-1.35 0.15,-0.9" fill="#f7c59f"/>' +
    '<polygon points="-0.72,-0.7 -0.66,-1.12 -0.38,-0.88" fill="#ffc2d6"/><polygon points="0.72,-0.7 0.66,-1.12 0.38,-0.88" fill="#ffc2d6"/>' +
    '<circle r="1" fill="#f7c59f"/><circle r="0.8" fill="#fffaf0"/>' +
    '<circle cx="0" cy="-0.62" r="0.06" fill="#d9a777"/><circle cx="0.62" cy="0" r="0.06" fill="#d9a777"/><circle cx="0" cy="0.62" r="0.06" fill="#d9a777"/><circle cx="-0.62" cy="0" r="0.06" fill="#d9a777"/>' +
    '<circle cx="-0.38" cy="0.3" r="0.1" fill="#ffc2d6"/><circle cx="0.38" cy="0.3" r="0.1" fill="#ffc2d6"/>' +
    '<path d="M0 0 L0 -0.5 M0 0 L0.35 0.12" stroke="#5a3a4a" stroke-width="2" stroke-linecap="round"/><circle r="0.07" fill="#5a3a4a"/></g>');
}
function decoSweets(){
  return onRight('<g transform="translate(5.9 2.4)">' +
    '<rect x="-0.06" y="0.8" width="0.12" height="1.6" fill="#fff" stroke="#f0d0dc" stroke-width="1"/>' +
    '<circle r="1" fill="#ffb7cf"/><circle r="0.72" fill="none" stroke="#fff" stroke-width="3"/><circle r="0.4" fill="none" stroke="#fff" stroke-width="3"/>' +
    '<polygon points="-0.06,1.05 -0.5,0.8 -0.5,1.3" fill="#a8dcc8"/><polygon points="0.06,1.05 0.5,0.8 0.5,1.3" fill="#a8dcc8"/>' +
    '<path d="M0 0 L0 -0.55 M0 0 L0.4 0.15" stroke="#5a3a4a" stroke-width="2" stroke-linecap="round"/><circle r="0.08" fill="#5a3a4a"/></g>');
}
function decoStar(){
  var p = [[-0.9,-0.5],[-0.4,-0.7],[0.1,-0.3],[0.6,-0.6],[0.85,0.1],[0.2,0.5],[-0.5,0.4]];
  var line = p.map(function(q){ return q[0] + ',' + q[1]; }).join(' ');
  var dots = p.map(function(q){ return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="0.08" fill="#fff6b0"/>'; }).join('');
  return onRight('<g transform="translate(5.9 2.5)">' +
    '<rect x="-1.3" y="-1.1" width="2.6" height="2.2" rx="0.1" fill="url(#g_gold)"/>' +
    '<rect x="-1.15" y="-0.95" width="2.3" height="1.9" fill="#2a3170"/>' +
    '<polyline points="' + line + '" fill="none" stroke="#cdd6ff" stroke-width="1.5"/>' + dots + '</g>');
}

/* ---------- ラグ ---------- */
function rugAnimal(){
  var cl = '';
  [[4.8,5.2],[6.6,4.9],[5.6,6.8],[6.9,6.4]].forEach(function(c){
    for (var i = 0; i < 3; i++){
      var a = i * Math.PI * 2 / 3;
      cl += '<circle cx="' + fx((c[0] + Math.cos(a)*0.18)*100)/100 + '" cy="' + fx((c[1] + Math.sin(a)*0.18)*100)/100 + '" r="0.17" fill="#8cc97a"/>';
    }
  });
  return onFloor('<circle cx="5.75" cy="5.75" r="2.5" fill="#9fd18d"/><circle cx="5.75" cy="5.75" r="2.25" fill="#c4e8b4"/>' + cl);
}
function rugSweets(){
  var sc = '', dots = '';
  for (var i = 0; i < 16; i++){
    var a = i * Math.PI / 8;
    sc += '<circle cx="' + fx((5.75 + Math.cos(a)*2.3)*100)/100 + '" cy="' + fx((5.75 + Math.sin(a)*2.3)*100)/100 + '" r="0.42" fill="#e8b97a"/>';
  }
  [[5,5],[6.5,5],[5,6.5],[6.5,6.5],[5.75,5.75]].forEach(function(d){ dots += '<circle cx="' + d[0] + '" cy="' + d[1] + '" r="0.12" fill="#c98f4e"/>'; });
  return onFloor(sc + '<circle cx="5.75" cy="5.75" r="2.3" fill="#f0c88f"/>' + dots);
}
function rugStar(){
  return onFloor('<circle cx="5.75" cy="5.75" r="2.5" fill="#f5d36a"/><circle cx="5.75" cy="5.75" r="2.25" fill="#ffe58a"/>' +
    '<circle cx="5" cy="5.3" r="0.4" fill="#f5d36a"/><circle cx="6.5" cy="6.4" r="0.55" fill="#f5d36a"/><circle cx="6.6" cy="5" r="0.25" fill="#f5d36a"/>');
}

/* ---------- ベッド ---------- */
function bed(c){
  var s = '';
  s += box(0.3, 0, 0, 3, 0.4, 2.4, c.head);
  if (c.headDeco) s += '<g transform="' + mPlaneV(0.4) + '">' + c.headDeco + '</g>';
  s += box(0.3, 0.4, 0, 3, 4.2, 0.7, c.frame);
  s += box(0.4, 0.5, 0.7, 2.8, 4.0, 0.45, c.mattress || '#fff8f0');
  s += box(0.8, 0.65, 1.15, 2.0, 0.9, 0.3, '#ffffff');
  s += box(0.35, 1.8, 0.7, 2.9, 2.9, 0.6, c.blanket);
  if (c.topDeco) s += onFloor(c.topDeco, 1.3);
  if (c.after) s += c.after;
  return s;
}
function dotsOnBlanket(col, r){
  var s = '';
  for (var u = 0.8; u < 3.2; u += 0.8) for (var v = 2.2; v < 4.6; v += 0.8) s += '<circle cx="' + fx(u*100)/100 + '" cy="' + fx(v*100)/100 + '" r="' + r + '" fill="' + col + '"/>';
  return s;
}
function bedAnimal(){
  return bed({head:'#fff3d6', frame:'#d9b48a', blanket:'#bfe8d0',
    headDeco:'<ellipse cx="1.2" cy="-2.95" rx="0.32" ry="0.72" fill="#fff"' + EDGE + '/><ellipse cx="1.2" cy="-2.95" rx="0.15" ry="0.48" fill="#ffc2d6"/>' +
             '<ellipse cx="2.4" cy="-2.95" rx="0.32" ry="0.72" fill="#fff"' + EDGE + '/><ellipse cx="2.4" cy="-2.95" rx="0.15" ry="0.48" fill="#ffc2d6"/>' +
             '<path d="M1.8 -1.1 C1.5 -1.35 1.55 -1.7 1.8 -1.55 C2.05 -1.7 2.1 -1.35 1.8 -1.1Z" fill="#ffb7cf"/>',
    topDeco: dotsOnBlanket('#fff', 0.13)});
}
function bedSweets(){
  var sp = '', cols = ['#ff7fa8','#8fd9c4','#ffe58a','#a9c9ff','#fff'];
  var k = 0;
  for (var u = 0.7; u < 3.2; u += 0.55) for (var v = 2.1; v < 4.6; v += 0.6){
    sp += '<rect x="' + fx(u*100)/100 + '" y="' + fx(v*100)/100 + '" width="0.28" height="0.08" rx="0.04" fill="' + cols[k++ % cols.length] + '" transform="rotate(' + ((k*47)%180) + ' ' + fx(u*100)/100 + ' ' + fx(v*100)/100 + ')"/>';
  }
  return bed({head:'#ffd6e6', frame:'#8a5a3c', blanket:'#ffb7cf',
    headDeco:'<path d="M0.3 -2.4 L3.3 -2.4 L3.3 -2 Q3.1 -1.6 2.9 -2 Q2.6 -1.5 2.3 -2 Q2 -1.7 1.7 -2 Q1.4 -1.5 1.1 -2 Q0.8 -1.7 0.6 -2 Q0.45 -1.8 0.3 -2Z" fill="#fff"/>',
    topDeco: sp,
    after: sprite(1.8, 0.2, 2.4, 22, 22, '<path d="M11 21 C3 15 3 6 11 8 C19 6 19 15 11 21Z" fill="#ff5f7e"/><path d="M6 7 L11 3 L16 7 L11 9Z" fill="#7cc98a"/><circle cx="8" cy="13" r="1" fill="#ffe58a"/><circle cx="13" cy="15" r="1" fill="#ffe58a"/>')});
}
function bedStar(){
  var st = '';
  [[1,2.4],[2.5,2.8],[1.6,3.7],[2.9,4.2],[0.8,4.3]].forEach(function(q){ st += star(q[0], q[1], 0.2, 0.09, '#ffe58a'); });
  return bed({head:'#4a55a0', frame:'#6b74c4', blanket:'#c9b8ff', mattress:'#f3f0ff',
    headDeco: crescent(1.8, -3, 0.62, '#ffe58a') + star(2.6, -2.9, 0.14, 0.06, '#fff6c8') + star(0.9, -1.3, 0.12, 0.05, '#ffe58a') + star(2.7, -1, 0.1, 0.045, '#fff6c8'),
    topDeco: st});
}

/* ---------- ソファ ---------- */
function sofa(c){
  var s = '';
  if (c.before) s += c.before;
  s += box(0, 5.8, 0, 0.7, 3.4, 2.3, c.back);
  s += box(0, 5.4, 0, 2.6, 0.4, 1.5, c.arm);
  s += box(0, 5.8, 0, 2.6, 3.4, c.cream ? 0.85 : 1.0, c.seat);
  if (c.cream) s += box(0, 5.8, 0.85, 2.6, 3.4, 0.15, c.cream);
  s += box(0.75, 6.0, 1.0, 1.75, 3.0, 0.22, c.cushion);
  s += box(0, 9.2, 0, 2.6, 0.45, 1.5, c.arm);
  if (c.after) s += c.after;
  return s;
}
function puff(u, v, z, r){
  return sprite(u, v, z, r*2, r*2, '<circle cx="' + r + '" cy="' + r + '" r="' + r + '" fill="#fff" stroke="#dfe4ff" stroke-width="1"/>');
}
function sofaAnimal(){
  var ear = '<circle cx="10" cy="10" r="9" fill="#c98f5a" stroke="rgba(90,58,74,.28)"/><circle cx="10" cy="10" r="5" fill="#f3d3b0"/>';
  return sofa({back:'#c98f5a', arm:'#b9804c', seat:'#d9a777', cushion:'#f3d3b0',
    before: sprite(0.35, 6.25, 2.05, 20, 20, ear) + sprite(0.35, 8.75, 2.05, 20, 20, ear)});
}
function sofaSweets(){
  return sofa({back:'#ffc2d6', arm:'#d6c4ff', seat:'#bfeedd', cream:'#fffaf0', cushion:'#ffd6e6'});
}
function sofaStar(){
  return sofa({back:'#eef0ff', arm:'#e4e8ff', seat:'#f4f6ff', cushion:'#ffffff',
    after: puff(0.35, 6.1, 2.0, 11) + puff(0.35, 7.1, 2.1, 13) + puff(0.35, 8.2, 2.05, 12) + puff(0.35, 9.0, 1.95, 10) +
           puff(1.3, 5.6, 1.3, 10) + puff(1.3, 9.4, 1.3, 10)});
}

/* ---------- テーブル ---------- */
var TC = [5.75, 5.75];
function tableAnimal(){
  var t = P(TC[0], TC[1], 1.3);
  return cyl(TC[0], TC[1], 0, 1.2, 1.3, '#b07a4a', '#e8c08a') +
    '<ellipse cx="' + fx(t[0]) + '" cy="' + fx(t[1]) + '" rx="' + fx(1.2247*0.75*S) + '" ry="' + fx(0.7071*0.75*S) + '" fill="none" stroke="#c99b6b" stroke-width="1.5"/>' +
    '<ellipse cx="' + fx(t[0]) + '" cy="' + fx(t[1]) + '" rx="' + fx(1.2247*0.4*S) + '" ry="' + fx(0.7071*0.4*S) + '" fill="none" stroke="#c99b6b" stroke-width="1.5"/>';
}
function tableSweets(){
  var t = P(TC[0], TC[1], 1.0), sp = '', cols = ['#fff','#8fd9c4','#ffe58a','#a9c9ff'];
  for (var i = 0; i < 12; i++){
    var a = i * Math.PI / 6 + 0.2, rr = (i % 2 ? 0.95 : 0.7);
    var x = t[0] + Math.cos(a) * 1.2247 * rr * S, y = t[1] + Math.sin(a) * 0.7071 * rr * S;
    sp += '<rect x="' + fx(x) + '" y="' + fx(y) + '" width="6" height="2" rx="1" fill="' + cols[i % 4] + '" transform="rotate(' + (i*37 % 180) + ' ' + fx(x) + ' ' + fx(y) + ')"/>';
  }
  return cyl(TC[0], TC[1], 0, 1.3, 1.0, '#e3b071', '#ff9cbd') + sp +
    '<ellipse cx="' + fx(t[0]) + '" cy="' + fx(t[1]) + '" rx="' + fx(1.2247*0.35*S) + '" ry="' + fx(0.7071*0.35*S) + '" fill="#c98f4e"/>';
}
function tableStar(){
  return box(4.8, 4.8, 0, 0.25, 0.25, 1.1, '#8f84d6') + box(6.45, 4.8, 0, 0.25, 0.25, 1.1, '#8f84d6') +
    box(4.8, 6.45, 0, 0.25, 0.25, 1.1, '#8f84d6') + box(6.45, 6.45, 0, 0.25, 0.25, 1.1, '#8f84d6') +
    box(4.55, 4.55, 1.1, 2.4, 2.4, 0.25, '#b9a8ff') + onFloor(star(5.75, 5.75, 0.95, 0.42, '#ffe58a'), 1.35);
}
var TABLE_TOP = {an_table:1.3, sw_table:1.0, st_table:1.35};

/* ---------- ライト ---------- */
var LAMP = [9.2, 0.9];
function lampAnimal(){
  return sprite(LAMP[0], LAMP[1], 0, 56, 130,
    '<circle cx="28" cy="58" r="30" fill="url(#g_glow)"/>' +
    '<ellipse cx="28" cy="127" rx="14" ry="4" fill="#d9b48a"/><rect x="24" y="60" width="8" height="67" rx="3" fill="#fff3d6" stroke="rgba(90,58,74,.25)"/>' +
    '<path d="M6 64 Q28 18 50 64Z" fill="#ff8a8a" stroke="rgba(90,58,74,.25)"/>' +
    '<circle cx="18" cy="50" r="4" fill="#fff"/><circle cx="31" cy="40" r="5" fill="#fff"/><circle cx="41" cy="55" r="3.5" fill="#fff"/>');
}
function lampSweets(){
  return sprite(LAMP[0], LAMP[1], 0, 56, 130,
    '<circle cx="28" cy="34" r="30" fill="url(#g_glow)"/>' +
    '<ellipse cx="28" cy="127" rx="13" ry="4" fill="#ffc2d6"/><rect x="26" y="40" width="4" height="87" fill="#fff" stroke="#f0d0dc"/>' +
    '<polygon points="13,34 3,25 3,43" fill="#ffe58a"/><polygon points="43,34 53,25 53,43" fill="#ffe58a"/>' +
    '<circle cx="28" cy="34" r="15" fill="#ff9cbd" stroke="rgba(90,58,74,.25)"/>' +
    '<path d="M28 34 m-9 0 a9 9 0 1 1 9 9 a6 6 0 1 1 -6 -6" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>');
}
function lampStar(){
  return sprite(LAMP[0], LAMP[1], 0, 56, 130,
    '<circle cx="28" cy="32" r="32" fill="url(#g_glow)"/>' +
    '<ellipse cx="28" cy="127" rx="12" ry="4" fill="#8f84d6"/><rect x="26.5" y="44" width="3" height="83" fill="#8f84d6"/>' +
    star(28, 32, 20, 9, '#ffe58a', ' stroke="#f2c14e" stroke-width="1.5" stroke-linejoin="round"'));
}
function chandelier(){
  var t = P(TC[0], TC[1], 7.2), w = 96;
  var crys = '';
  [12, 30, 48, 66, 84].forEach(function(x, i){
    var y = i % 2 ? 58 : 52;
    crys += '<line x1="' + x + '" y1="' + (y-12) + '" x2="' + x + '" y2="' + y + '" stroke="#e0a92e" stroke-width="1"/>' +
            '<path d="M' + x + ' ' + y + ' l-4 6 l4 8 l4 -8z" fill="#cfeaff" stroke="#9fc8ee" stroke-width=".8"/>';
  });
  return '<g transform="translate(' + fx(t[0] - w/2) + ' ' + fx(t[1]) + ')">' +
    '<circle cx="48" cy="40" r="44" fill="url(#g_glow)"/>' +
    '<line x1="48" y1="0" x2="48" y2="22" stroke="#e0a92e" stroke-width="2"/>' +
    '<path d="M8 38 Q48 62 88 38" fill="none" stroke="url(#g_gold)" stroke-width="5" stroke-linecap="round"/>' +
    '<ellipse cx="48" cy="30" rx="12" ry="9" fill="url(#g_gold)"/>' +
    '<rect x="6" y="26" width="5" height="12" fill="#fffaf0"/><rect x="85" y="26" width="5" height="12" fill="#fffaf0"/><rect x="45.5" y="12" width="5" height="10" fill="#fffaf0"/>' +
    '<path d="M8.5 20 q-2 3 0 5 q2 -2 0 -5z" fill="#ffb84d"/><path d="M87.5 20 q-2 3 0 5 q2 -2 0 -5z" fill="#ffb84d"/>' +
    crys + star(20, 14, 5, 2, '#fff6c8') + star(78, 10, 4, 1.6, '#fff6c8') + '</g>';
}

/* ---------- こもの ---------- */
function smallAt(ctx, w, h, inner){
  if (ctx && ctx.tableTop) return sprite(TC[0], TC[1], ctx.tableTop, w, h, inner);
  return sprite(8.3, 8.0, 0, w, h, inner);
}
function smallAnimal(ctx){
  return smallAt(ctx, 40, 50,
    '<ellipse cx="13" cy="16" rx="7" ry="12" fill="#7cc98a" transform="rotate(-25 13 16)"/><ellipse cx="27" cy="16" rx="7" ry="12" fill="#8fd9a0" transform="rotate(25 27 16)"/>' +
    '<circle cx="20" cy="9" r="5" fill="#ff9cbd"/><circle cx="20" cy="9" r="2" fill="#ffe58a"/>' +
    '<rect x="7" y="26" width="26" height="6" rx="2" fill="#ee9d6e"/><path d="M9 32 L31 32 L28 49 L12 49Z" fill="#e0895a" stroke="rgba(90,58,74,.25)"/>');
}
function smallSweets(ctx){
  return smallAt(ctx, 34, 56,
    '<rect x="21" y="0" width="3" height="16" rx="1.5" fill="#e3b071" transform="rotate(15 22 8)"/>' +
    '<circle cx="11" cy="14" r="6" fill="#fff"/><circle cx="19" cy="12" r="7" fill="#fff"/><circle cx="25" cy="15" r="5" fill="#fff"/>' +
    '<path d="M17 8 C11 4 13 -1 17 2 C21 -1 23 4 17 8Z" fill="#ff5f7e"/>' +
    '<path d="M5 17 L29 17 L22 40 L12 40Z" fill="#fff" stroke="#f0d0dc" stroke-width="1.2"/>' +
    '<path d="M7 22 L27 22 L25.4 27 L8.6 27Z" fill="#ffb7cf"/><path d="M8.6 27 L25.4 27 L23.8 32 L10.2 32Z" fill="#fff6e0"/><path d="M10.2 32 L23.8 32 L22.4 37 L11.6 37Z" fill="#c98f4e"/>' +
    '<rect x="15.5" y="40" width="3" height="10" fill="#fff" stroke="#f0d0dc" stroke-width="1"/><ellipse cx="17" cy="52" rx="9" ry="3" fill="#fff" stroke="#f0d0dc" stroke-width="1"/>');
}
function smallStar(ctx){
  return smallAt(ctx, 40, 52,
    '<path d="M6 21 A14 14 0 0 0 34 21" fill="none" stroke="#c9a227" stroke-width="2.5"/>' +
    '<circle cx="20" cy="20" r="14" fill="#7fb8ff" stroke="rgba(90,58,74,.25)"/>' +
    '<path d="M11 13 Q16 9 19 14 Q17 19 12 18Z" fill="#8fd98f"/><path d="M22 22 Q29 19 30 25 Q26 31 22 27Z" fill="#8fd98f"/>' +
    '<rect x="18.5" y="34" width="3" height="10" fill="#c9a227"/><ellipse cx="20" cy="47" rx="11" ry="4" fill="#c9a227"/>');
}
function smallTrophy(ctx){
  return smallAt(ctx, 44, 54,
    '<circle cx="22" cy="20" r="20" fill="url(#g_glow)"/>' +
    '<path d="M10 10 Q0 10 3 19 Q6 26 14 25" fill="none" stroke="#e0a92e" stroke-width="3"/><path d="M34 10 Q44 10 41 19 Q38 26 30 25" fill="none" stroke="#e0a92e" stroke-width="3"/>' +
    '<path d="M9 5 L35 5 Q35 28 22 31 Q9 28 9 5Z" fill="url(#g_gold)" stroke="#c99520" stroke-width="1"/>' +
    star(22, 15, 6, 2.6, '#fff6c8') +
    '<rect x="19" y="31" width="6" height="8" fill="#e0a92e"/><rect x="11" y="39" width="22" height="9" rx="2" fill="#a86f3c"/><rect x="15" y="41.5" width="14" height="4" rx="1" fill="#ffe9a0"/>');
}
function smallSakura(){
  var bl = '';
  [[30,40,22],[58,34,24],[44,22,22],[72,52,18],[18,58,16],[50,54,20]].forEach(function(c){
    bl += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="#ffc2d6"/>';
  });
  var pet = '';
  [[22,30],[60,22],[78,44],[40,48],[12,52],[66,62],[46,14],[30,66]].forEach(function(c){
    pet += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="2.5" fill="#fff"/>';
  });
  return sprite(8.4, 8.3, 0, 92, 130,
    '<path d="M40 130 L44 74 Q36 66 26 64 Q40 64 46 70 Q50 60 60 56 Q54 66 52 76 L56 130Z" fill="#a8744a" stroke="rgba(90,58,74,.25)"/>' +
    bl + '<circle cx="46" cy="40" r="22" fill="#ffb0c8"/>' + pet +
    '<ellipse cx="48" cy="128" rx="26" ry="5" fill="rgba(255,176,200,.5)"/>');
}

/* ---------- アイテム いちらん ---------- */
var ITEMS = [
  {id:'base_wall',  theme:'base', slot:'wall',  name:'しろい かべ',   fill:'url(#p_base_wall)', base:true},
  {id:'base_floor', theme:'base', slot:'floor', name:'もくめの ゆか', fill:'url(#p_base_floor)', base:true},

  {id:'an_wall',   theme:'animal', slot:'wall',   name:'こはなの かべがみ',   fill:'url(#p_an_wall)'},
  {id:'an_floor',  theme:'animal', slot:'floor',  name:'きの ゆか',           fill:'url(#p_an_floor)'},
  {id:'an_rug',    theme:'animal', slot:'rug',    name:'クローバーの ラグ',   draw:rugAnimal},
  {id:'an_window', theme:'animal', slot:'window', name:'おはなばたけの まど', draw:winAnimal},
  {id:'an_deco',   theme:'animal', slot:'deco',   name:'ねこの とけい',       draw:decoAnimal},
  {id:'an_bed',    theme:'animal', slot:'bed',    name:'うさみみ ベッド',     draw:bedAnimal},
  {id:'an_sofa',   theme:'animal', slot:'sofa',   name:'くまの ソファ',       draw:sofaAnimal},
  {id:'an_table',  theme:'animal', slot:'table',  name:'きりかぶ テーブル',   draw:tableAnimal},
  {id:'an_light',  theme:'animal', slot:'light',  name:'きのこ ランプ',       draw:lampAnimal},
  {id:'an_small',  theme:'animal', slot:'small',  name:'おはなの うえきばち', draw:smallAnimal},

  {id:'sw_wall',   theme:'sweets', slot:'wall',   name:'いちごミルクの かべがみ', fill:'url(#p_sw_wall)'},
  {id:'sw_floor',  theme:'sweets', slot:'floor',  name:'チョコの ゆか',           fill:'url(#p_sw_floor)'},
  {id:'sw_rug',    theme:'sweets', slot:'rug',    name:'ビスケットの ラグ',       draw:rugSweets},
  {id:'sw_window', theme:'sweets', slot:'window', name:'クッキーの まど',         draw:winSweets},
  {id:'sw_deco',   theme:'sweets', slot:'deco',   name:'キャンディの とけい',     draw:decoSweets},
  {id:'sw_bed',    theme:'sweets', slot:'bed',    name:'ケーキの ベッド',         draw:bedSweets},
  {id:'sw_sofa',   theme:'sweets', slot:'sofa',   name:'マカロン ソファ',         draw:sofaSweets},
  {id:'sw_table',  theme:'sweets', slot:'table',  name:'ドーナツ テーブル',       draw:tableSweets},
  {id:'sw_light',  theme:'sweets', slot:'light',  name:'キャンディ ランプ',       draw:lampSweets},
  {id:'sw_small',  theme:'sweets', slot:'small',  name:'いちごパフェ',            draw:smallSweets},

  {id:'st_wall',   theme:'star', slot:'wall',   name:'ほしぞらの かべがみ', fill:'url(#p_st_wall)'},
  {id:'st_floor',  theme:'star', slot:'floor',  name:'よぞらの ゆか',       fill:'url(#p_st_floor)'},
  {id:'st_rug',    theme:'star', slot:'rug',    name:'まんげつの ラグ',     draw:rugStar},
  {id:'st_window', theme:'star', slot:'window', name:'おつきさまの まど',   draw:winStar},
  {id:'st_deco',   theme:'star', slot:'deco',   name:'せいざの え',         draw:decoStar},
  {id:'st_bed',    theme:'star', slot:'bed',    name:'みかづきの ベッド',   draw:bedStar},
  {id:'st_sofa',   theme:'star', slot:'sofa',   name:'くもの ソファ',       draw:sofaStar},
  {id:'st_table',  theme:'star', slot:'table',  name:'ほしの テーブル',     draw:tableStar},
  {id:'st_light',  theme:'star', slot:'light',  name:'ほしの ランプ',       draw:lampStar},
  {id:'st_small',  theme:'star', slot:'small',  name:'ちきゅうぎ',          draw:smallStar},

  /* はやさの とくべつ アイテム（⭐では でない） */
  {id:'sp_chandelier', theme:'special', slot:'light',  name:'キラキラ シャンデリア', draw:chandelier,  hanging:true,
   hint:'1かいの もんだいを ぜんぶ パッとで こたえる'},
  {id:'sp_shooting',   theme:'special', slot:'window', name:'ながれぼしの まど',     draw:winShooting,
   hint:'ぜんぶ せいかいで へいきん 1びょう いない'},
  {id:'sp_trophy',     theme:'special', slot:'small',  name:'きんの トロフィー',     draw:smallTrophy,
   hint:'9もん ぜんぶを「ばっちり」に する'},
  {id:'sp_sakura',     theme:'special', slot:'small',  name:'さくらの き',           draw:smallSakura, big:true,
   hint:'7にち つづけて あそぶ'}
];
var ITEM_BY_ID = {};
ITEMS.forEach(function(it){ ITEM_BY_ID[it.id] = it; });

function itemSVG(it, ctx){
  if (!it) return '';
  if (it.fill) return '';
  return it.draw(ctx || {});
}

/* ---------- へや ぜんたい ---------- */
function renderRoom(room, buddyImg){
  var g = function(slot){ var id = room[slot]; return id ? ITEM_BY_ID[id] : null; };
  var wall = g('wall') || ITEM_BY_ID.base_wall, floor = g('floor') || ITEM_BY_ID.base_floor;
  var table = g('table'), small = g('small'), light = g('light'), sofaIt = g('sofa');
  var tableTop = table ? TABLE_TOP[table.id] : 0;
  var s = [];
  /* ゆかの あつみ */
  s.push(poly([[N,-0.35,-0.6],[N,N,-0.6],[N,N,0],[N,-0.35,0]], '#e2cdb9'));
  s.push(poly([[-0.35,N,-0.6],[N,N,-0.6],[N,N,0],[-0.35,N,0]], '#efdccb'));
  /* かべ */
  s.push(onLeft('<rect width="' + N + '" height="' + H + '" fill="' + wall.fill + '"/><rect width="' + N + '" height="' + H + '" fill="rgba(90,40,60,.07)"/><rect y="' + (H-0.35) + '" width="' + N + '" height="0.35" fill="rgba(255,255,255,.7)"/>'));
  s.push(onRight('<rect width="' + N + '" height="' + H + '" fill="' + wall.fill + '"/><rect y="' + (H-0.35) + '" width="' + N + '" height="0.35" fill="rgba(255,255,255,.75)"/>'));
  /* かべの ふち（ドールハウスの きりくち） */
  s.push(poly([[-0.35,N,0],[0,N,0],[0,N,H],[-0.35,N,H]], '#f6e8ef'));
  s.push(poly([[N,-0.35,0],[N,0,0],[N,0,H],[N,-0.35,H]], '#efdde6'));
  s.push(poly([[0,N,H],[0,0,H],[-0.35,-0.35,H],[-0.35,N,H]], '#ffffff'));
  s.push(poly([[0,0,H],[N,0,H],[N,-0.35,H],[-0.35,-0.35,H]], '#ffffff'));
  /* ゆか */
  s.push(onFloor('<rect width="' + N + '" height="' + N + '" fill="' + floor.fill + '"/>'));
  s.push(itemSVG(g('window')));
  s.push(itemSVG(g('deco')));
  s.push(itemSVG(g('rug')));
  s.push(itemSVG(g('bed')));
  if (light && !light.hanging) s.push(itemSVG(light));
  s.push(itemSVG(table));
  if (small) s.push(itemSVG(small, {tableTop: small.big ? 0 : tableTop}));
  s.push(itemSVG(sofaIt));
  if (buddyImg){
    var bp = sofaIt ? P(1.4, 7.5, 1.05) : P(6.6, 8.9, 0);
    var bw = 74;
    s.push('<image href="' + buddyImg + '" x="' + fx(bp[0] - bw/2) + '" y="' + fx(bp[1] - bw + 6) + '" width="' + bw + '" height="' + bw + '" preserveAspectRatio="xMidYMax meet"/>');
  }
  if (light && light.hanging) s.push(itemSVG(light));
  return '<svg class="iso room-svg" viewBox="0 20 360 356" xmlns="http://www.w3.org/2000/svg">' + s.join('') + '</svg>';
}

/* ---------- サムネイル（コレクション・えらぶ ところ） ---------- */
var thumbCache = {};
var measure = null;
function thumb(it){
  if (thumbCache[it.id]) return thumbCache[it.id];
  var out;
  if (it.fill){
    out = '<svg class="iso" viewBox="0 0 3 3"><rect width="3" height="3" rx="0.25" fill="' + it.fill + '"/></svg>';
  } else {
    var inner = it.draw({});
    if (!measure){
      measure = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      measure.setAttribute('width', '400'); measure.setAttribute('height', '400');
      measure.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden';
      document.body.appendChild(measure);
    }
    measure.innerHTML = '<g>' + inner + '</g>';
    var b = measure.firstChild.getBBox(), pad = Math.max(b.width, b.height) * 0.08 + 2;
    var side = Math.max(b.width, b.height) + pad * 2;
    var x = b.x + b.width/2 - side/2, y = b.y + b.height/2 - side/2;
    out = '<svg class="iso" viewBox="' + fx(x) + ' ' + fx(y) + ' ' + fx(side) + ' ' + fx(side) + '">' + inner + '</svg>';
  }
  thumbCache[it.id] = out;
  return out;
}

function installDefs(){
  var d = document.createElement('div');
  d.innerHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true">' + DEFS + '</svg>';
  document.body.appendChild(d.firstChild);
}

window.Room = {THEMES:THEMES, SLOTS:SLOTS, ITEMS:ITEMS, ITEM_BY_ID:ITEM_BY_ID, NEED:NEED,
               renderRoom:renderRoom, thumb:thumb, installDefs:installDefs};
})();
