"""Animated SVG visuals for the inner pages (no raster images). Pure SVG + CSS/SMIL, no JavaScript."""
import math

def _fig(label,caption,steps,svg):
    chips=''.join(f'<span style="--i:{i}">{s}</span>' for i,s in enumerate(steps))
    return f'<figure class="brand-stage brand-anim" role="img" aria-label="{label}"><svg class="anim-svg" viewBox="0 0 600 460" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">{svg}</svg><figcaption><span>{caption}</span><div>{chips}</div></figcaption></figure>'

def _slab(cx,cy,w,h,th,cls):
    top=f'{cx-w},{cy} {cx},{cy-h} {cx+w},{cy} {cx},{cy+h}'
    l=f'{cx-w},{cy} {cx},{cy+h} {cx},{cy+h+th} {cx-w},{cy+th}'
    r=f'{cx+w},{cy} {cx},{cy+h} {cx},{cy+h+th} {cx+w},{cy+th}'
    inner=f'{cx-w*.55},{cy} {cx},{cy-h*.55} {cx+w*.55},{cy} {cx},{cy+h*.55}'
    return f'<g class="slab {cls}"><polygon class="sl-l" points="{l}"/><polygon class="sl-r" points="{r}"/><polygon class="sl-t" points="{top}"/><polygon class="sl-i" points="{inner}"/></g>'

def story():
    s='<defs><radialGradient id="stFloor"><stop offset="0" stop-color="#b6f4a3" stop-opacity=".35"/><stop offset="1" stop-color="#b6f4a3" stop-opacity="0"/></radialGradient><linearGradient id="stBeam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#b6f4a3" stop-opacity="0"/><stop offset=".5" stop-color="#b6f4a3" stop-opacity=".9"/><stop offset="1" stop-color="#eaffe2" stop-opacity="0"/></linearGradient></defs>'
    s+='<ellipse cx="300" cy="400" rx="230" ry="46" fill="url(#stFloor)"/>'
    s+='<g class="st-grid">'+''.join(f'<polygon points="{300-w},{385} {300},{385-w*.5} {300+w},{385} {300},{385+w*.5}"/>' for w in (80,150,220))+'</g>'
    s+='<rect class="st-beam" x="298" y="110" width="4" height="280" fill="url(#stBeam)"/>'
    s+=_slab(300,335,130,64,26,'s1')+_slab(300,245,130,64,26,'s2')+_slab(300,155,130,64,26,'s3')
    s+='<g class="st-orb"><circle class="o1" cx="300" cy="82" r="11"/><circle class="o2" cx="300" cy="82" r="11"/><circle class="o3" cx="300" cy="82" r="22"/></g>'
    s+='<g class="st-dots">'+''.join(f'<circle cx="{x}" cy="{y}" r="{r}" style="--d:{d}s;--x:{dx}px"/>' for x,y,r,d,dx in [(190,380,2.4,0,10),(240,390,3,1.4,-8),(360,385,2.6,.7,12),(410,375,2,2.1,-10),(300,395,3.2,2.8,6),(150,360,2,3.4,8),(450,360,2.4,1.9,-6),(270,380,2,3.9,-12)])+'</g>'
    return _fig('Glass layers rising on a strong foundation','Strong foundations. New possibilities.',['Deep experience','Modern technology','Lasting impact'],s)

def partners():
    cx,cy=300,225;pr=112;sr=196
    links=[];pulses=[];nodes=[];t=0
    for k in range(6):
        a=math.radians(k*60-90);px,py=cx+pr*math.cos(a),cy+pr*math.sin(a)
        links.append(f'<line x1="{cx}" y1="{cy}" x2="{px:.1f}" y2="{py:.1f}"/>')
        pulses.append((f'M{cx} {cy} L{px:.1f} {py:.1f}',0,k*.25))
        nodes.append(f'<g class="pn" style="--d:{k*.4}s"><circle class="pn-r" cx="{px:.1f}" cy="{py:.1f}" r="13"/><circle class="pn-c" cx="{px:.1f}" cy="{py:.1f}" r="6"/></g>')
        for j,off in enumerate((-21,0,21)):
            b=math.radians(k*60-90+off);sx,sy=cx+sr*math.cos(b),cy+sr*math.sin(b)
            links.append(f'<line class="l2" x1="{px:.1f}" y1="{py:.1f}" x2="{sx:.1f}" y2="{sy:.1f}"/>')
            pulses.append((f'M{px:.1f} {py:.1f} L{sx:.1f} {sy:.1f}',1,k*.25+j*.12))
            nodes.append(f'<circle class="sn" cx="{sx:.1f}" cy="{sy:.1f}" r="5.5" style="--d:{(k*3+j)*.23}s"/>')
    s='<defs><radialGradient id="ptHub"><stop offset="0" stop-color="#eaffe2"/><stop offset=".6" stop-color="#b6f4a3"/><stop offset="1" stop-color="#2f8f5a"/></radialGradient></defs>'
    s+='<g class="pt-links">'+''.join(links)+'</g>'
    s+='<circle class="pt-ring" cx="300" cy="225" r="112"/><circle class="pt-ring r2" cx="300" cy="225" r="196"/>'
    for path,phase,off in pulses:
        kt='0;.5;1' ;kp='0;1;1' if phase==0 else '0;0;1'
        s+=f'<circle class="pulse" r="3.4" opacity="0"><animateMotion dur="4.8s" begin="{off:.2f}s" repeatCount="indefinite" path="{path}" keyPoints="{kp}" keyTimes="{kt}" calcMode="linear"/><animate attributeName="opacity" dur="4.8s" begin="{off:.2f}s" repeatCount="indefinite" values="{"0;1;0;0" if phase==0 else "0;0;1;0"}" keyTimes="0;.12;.5;1" calcMode="linear"/></circle>' if False else f'<circle class="pulse" r="3.4" opacity="0"><animateMotion dur="4.8s" begin="{off:.2f}s" repeatCount="indefinite" path="{path}" keyPoints="{kp}" keyTimes="{kt}" calcMode="linear"/><animate attributeName="opacity" dur="4.8s" begin="{off:.2f}s" repeatCount="indefinite" values="{"1;1;0" if phase==0 else "0;1;0"}" keyTimes="0;.5;1"/></circle>'
    s+=''.join(nodes)
    s+='<g class="pt-hub"><circle class="hb-spin" cx="300" cy="225" r="48"/><circle cx="300" cy="225" r="32" fill="url(#ptHub)"/><path d="M300 207l17 7v11c0 10-7 16-17 20-10-4-17-10-17-20v-11z" fill="none" stroke="#06130f" stroke-width="3" stroke-linejoin="round"/></g>'
    return _fig('A hub connecting partners and local businesses','Built on connection.',['Connect','Create value','Grow together'],s)

def careers():
    xs=[60+i*100 for i in range(5)];hs=[50,100,150,200,250];base=410
    s='<defs><linearGradient id="cgStep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b6f4a3" stop-opacity=".35"/><stop offset="1" stop-color="#b6f4a3" stop-opacity=".02"/></linearGradient></defs>'
    for i,(x,h) in enumerate(zip(xs,hs)):
        s+=f'<g class="cg-step" style="--d:{i*.5}s"><rect x="{x}" y="{base-h}" width="92" height="{h}" rx="6" fill="url(#cgStep)"/><line x1="{x}" y1="{base-h}" x2="{x+92}" y2="{base-h}"/></g>'
    pts=[(x+46,base-h-18) for x,h in zip(xs,hs)]
    d=f'M{pts[0][0]-60} {pts[0][1]+20}'
    prev=(pts[0][0]-60,pts[0][1]+20)
    for p in pts:
        cx_=(prev[0]+p[0])/2;cy_=min(prev[1],p[1])-70
        d+=f' Q{cx_:.0f} {cy_:.0f} {p[0]} {p[1]}';prev=p
    s+=f'<path class="cg-trail" d="{d}"/>'
    s+=f'<g class="cg-hopper"><circle r="15"/><circle r="6" class="core"/><animateMotion dur="7s" repeatCount="indefinite" path="{d}" keyPoints="0;1;1" keyTimes="0;.86;1" calcMode="linear"/></g>'
    tx,ty=pts[-1]
    s+=f'<g class="cg-star" transform="translate({tx} {ty-56})"><path d="M0 -18l5 12 13 1-10 8 3 13-11-7-11 7 3-13-10-8 13-1z"/></g>'
    s+='<g class="cg-brk b1"><path d="M30 0l-18 18 18 18M60 0l18 18-18 18"/></g><g class="cg-brk b2"><path d="M22 0l-14 14 14 14M46 0l14 14-14 14"/></g>'
    return _fig('A staircase of growth with a hopping spark climbing it','Grow with us.',['Learn','Build','Lead'],s)

def contact():
    cx,cy=300,215
    sats=[(-60,175),(-8,200),(48,165),(110,185),(165,170),(215,195)]
    s='<defs><radialGradient id="ctCore"><stop offset="0" stop-color="#eaffe2"/><stop offset=".7" stop-color="#b6f4a3"/><stop offset="1" stop-color="#2f8f5a"/></radialGradient></defs>'
    s+=''.join(f'<circle class="ct-static" cx="{cx}" cy="{cy}" r="{r}"/>' for r in (70,125,185))
    s+=''.join(f'<circle class="ct-wave" cx="{cx}" cy="{cy}" r="20" style="--d:{d}s"/>' for d in (0,1.5,3))
    for i,(a,r) in enumerate(sats):
        x=cx+r*math.cos(math.radians(a));y=cy+r*math.sin(math.radians(a))
        s+=f'<line class="ct-link" x1="{cx}" y1="{cy}" x2="{x:.1f}" y2="{y:.1f}"/><circle class="ct-sat" cx="{x:.1f}" cy="{y:.1f}" r="7" style="--d:{i*.7}s"/>'
        s+=f'<circle class="pulse" r="3.2" opacity="0"><animateMotion dur="4.2s" begin="{i*.55:.2f}s" repeatCount="indefinite" path="M{cx} {cy} L{x:.1f} {y:.1f}"/><animate attributeName="opacity" dur="4.2s" begin="{i*.55:.2f}s" repeatCount="indefinite" values="0;1;1;0" keyTimes="0;.1;.8;1"/></circle>'
    s+=f'<g class="ct-core"><circle cx="{cx}" cy="{cy}" r="34" fill="url(#ctCore)"/><path d="M{cx-17} {cy+1}l34-15-12 31-7-11z" fill="#06130f"/></g>'
    return _fig('Signals radiating outward from a message','Let’s start a conversation.',['Say hello','We listen','We plan'],s)
