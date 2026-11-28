from pathlib import Path
from PIL import Image,ImageOps,ImageDraw,ImageFilter,ImageColor
from urllib.request import Request,urlopen
from io import BytesIO
from scipy import ndimage
import numpy as np
import math, json, hashlib, random
from concurrent.futures import ThreadPoolExecutor

ROOT=Path(__file__).resolve().parents[1]
items=json.loads((ROOT/'data/cham-festival-campaigns.json').read_text(encoding='utf-8-sig'))
cache=ROOT/'.qa'/'banner-source'; cache.mkdir(parents=True,exist_ok=True)
W,H=1200,680
PALETTE={
 'christmas':('#ad102c','#ed3049','#fbd47b','#0b5d48'),
 'tet':('#b71720','#f15323','#ffd76b','#7b1724'),
 'women-march':('#a9125b','#ed5c91','#fff0ae','#70204e'),
 'women-october':('#54228d','#9d57d1','#ffe6a2','#ed83ae'),
 'teachers':('#133f98','#3979d9','#ffe27a','#f0f6ff'),
 'midautumn':('#40205f','#80559c','#ffca65','#f17843'),
 'valentine':('#bc1849','#f14d76','#ffe5c8','#971941'),
 'school':('#1549ac','#3987e7','#ffdc45','#f8f1d5'),
 'summer':('#007a82','#25c2b6','#ffdb57','#edf9d4'),
 'graduation':('#173e67','#3969a5','#f4c96d','#f3e6c6'),
}
def rgb(c):return ImageColor.getrgb(c)
def rgba(c,a=255):return (*rgb(c),a)
def lerp(a,b,t):return tuple(round(x*(1-t)+y*t) for x,y in zip(a,b))
def backdrop(base,bright):
    a,b=rgb(base),rgb(bright)
    x,y=np.meshgrid(np.arange(W),np.arange(H))
    t=np.clip((x/W)*.75+(1-y/H)*.2,0,1)[...,None]
    ar=np.array(a)[None,None,:]*(1-t)+np.array(b)[None,None,:]*t
    return Image.fromarray(ar.astype('uint8')).convert('RGBA')
def fetch(p):
    url=p['url'];path=cache/(hashlib.sha256(url.encode()).hexdigest()+'.img')
    if not path.exists():
        with urlopen(Request(url+('&' if '?' in url else '?')+'width=900',headers={'User-Agent':'Mozilla/5.0'}),timeout=30) as r: raw=r.read()
        Image.open(BytesIO(raw)).verify();path.write_bytes(raw)
    im=ImageOps.exif_transpose(Image.open(path)).convert('RGBA')
    bg=Image.new('RGBA',im.size,'white');bg.alpha_composite(im)
    return bg.convert('RGB')
def star(d,x,y,r,c,n=4,inner=.26):
    pts=[]
    for i in range(n*2):
        a=-math.pi/2+i*math.pi/n
        rr=r if i%2==0 else r*inner
        pts.append((x+rr*math.cos(a),y+rr*math.sin(a)))
    d.polygon(pts,fill=c)
def flower(d,x,y,r,c,center,n=5):
    for j in range(n):
        a=j*math.tau/n
        px=x+math.cos(a)*r*.58;py=y+math.sin(a)*r*.58
        rr=r*.44
        d.ellipse((px-rr,py-rr,px+rr,py+rr),fill=c)
    d.ellipse((x-r*.22,y-r*.22,x+r*.22,y+r*.22),fill=center)
def heart(d,x,y,r,c):
    pts=[]
    for i in range(181):
        t=i*math.tau/180
        pts.append((x+r*(16*math.sin(t)**3)/32,y-r*(13*math.cos(t)-5*math.cos(2*t)-2*math.cos(3*t)-math.cos(4*t))/32))
    d.polygon(pts,fill=c)
def gift(d,x,y,w,h,c,bow):
    d.rounded_rectangle((x,y,x+w,y+h),radius=7,fill=c)
    d.rectangle((x+w*.44,y,x+w*.56,y+h),fill=bow)
    d.rectangle((x,y+h*.15,x+w,y+h*.28),fill=bow)
    d.ellipse((x+w*.1,y-h*.32,x+w*.5,y+h*.07),outline=bow,width=8)
    d.ellipse((x+w*.5,y-h*.32,x+w*.9,y+h*.07),outline=bow,width=8)
def lantern(d,x,y,w,h,c,gold):
    d.line((x+w/2,0,x+w/2,y),fill=gold,width=3)
    d.rounded_rectangle((x,y,x+w,y+h),radius=w*.43,fill=c,outline=gold,width=3)
    for k in [.25,.5,.75]:
        xx=x+w*k;d.line((xx,y+13,xx,y+h-13),fill=gold,width=2)
    d.rectangle((x+w*.25,y-7,x+w*.75,y+9),fill=gold)
    d.rectangle((x+w*.25,y+h-8,x+w*.75,y+h+7),fill=gold)
    d.line((x+w*.5,y+h,x+w*.5,y+h+32),fill=gold,width=3)
def foliage(d,x,y,scale,c):
    for i in range(8):
        angle=-1.4+i*.27
        xx=x+math.cos(angle)*scale; yy=y+math.sin(angle)*scale
        d.line((x,y,xx,yy),fill=c,width=5)
        for j in range(1,6):
            t=j/6;px=x+(xx-x)*t;py=y+(yy-y)*t
            for s in [-1,1]:
                a=angle+s*.55;d.line((px,py,px+math.cos(a)*scale*.25,py+math.sin(a)*scale*.25),fill=c,width=4)
def decor(canvas,key,p):
    base,bright,gold,extra=p
    l=Image.new('RGBA',canvas.size);d=ImageDraw.Draw(l)
    # Custom festive graphics, no repeated product-card layout.
    if key=='christmas':
        d.ellipse((295,-85,1190,780),fill=rgba(extra,255))
        for x,y,r in [(88,80,37),(1090,122,58),(210,543,19),(1110,550,30),(620,56,18)]:star(d,x,y,r,rgba(gold))
        foliage(d,100,190,240,rgba(extra));foliage(d,1135,680,235,rgba('#155f4c'))
        for x,y in [(130,290),(1090,215),(1040,350)]:d.ellipse((x-23,y-23,x+23,y+23),fill=rgba(gold));d.line((x,y-50,x,y-23),fill=rgba(gold),width=3)
        gift(d,65,508,160,130,rgba('#f0b94e'),rgba('#a81733'));gift(d,965,530,148,112,rgba('#a81733'),rgba(gold))
    elif key=='tet':
        d.ellipse((225,-125,1210,860),fill=rgba('#f4bb52'))
        for x,y,w,h in [(40,80,115,150),(990,70,148,200),(1120,20,75,105)]:lantern(d,x,y,w,h,rgba(base),rgba(gold))
        for x,y,r in [(85,455,44),(125,525,32),(1100,510,44),(1035,575,32),(65,570,24)]:flower(d,x,y,r,rgba('#ffdd78'),rgba('#9f202a'))
        for j in range(4):d.arc((20+j*18,500+j*10,410+j*10,800+j*10),190,330,fill=rgba(gold,150),width=3)
    elif key in ['women-march','women-october']:
        d.ellipse((300,-100,1250,850),fill=rgba('#f8c7cc' if key=='women-march' else '#dec5f5'))
        for x,y,r in [(82,118,54),(155,78,34),(1100,123,67),(1080,538,53),(130,560,68),(1010,615,35)]:
            flower(d,x,y,r,rgba('#f7b8d0' if key=='women-march' else '#edb7e8'),rgba(gold),6)
        for x,y in [(30,330),(1125,380)]:d.line((x,y,x+45,y+120),fill=rgba('#f6dca7'),width=4)
        for x,y,r in [(230,128,23),(970,55,20),(200,520,24)]:star(d,x,y,r,rgba(gold))
    elif key=='teachers':
        d.rounded_rectangle((320,-50,1180,660),radius=310,fill=rgba('#e7c55a'))
        for x,y in [(30,120),(1135,520),(1090,84)]:star(d,x,y,26,rgba(gold))
        for x in range(0,1200,100):d.line((x,0,x,680),fill=(255,255,255,18),width=2)
        for y in range(0,680,100):d.line((0,y,1200,y),fill=(255,255,255,18),width=2)
        d.polygon([(62,550),(100,532),(290,655),(265,680)],fill=rgba('#edaf33'))
        d.polygon([(62,550),(48,530),(100,532)],fill=rgba('#f7d69b'))
    elif key=='midautumn':
        d.ellipse((335,25,985,675),fill=rgba(gold))
        for x,y in [(75,62),(1130,70),(100,560),(1070,525)]:star(d,x,y,26,rgba(gold))
        lantern(d,55,140,115,175,rgba(extra),rgba(gold));lantern(d,1000,105,135,188,rgba('#b43555'),rgba(gold))
        for x,y in [(80,630),(1040,625)]:
            d.arc((x-95,y-85,x+95,y+45),180,360,fill=rgba(gold),width=5)
    elif key=='valentine':
        heart(d,740,355,880,rgba('#f9b2b9'))
        for x,y,r in [(95,95,95),(1050,110,116),(135,550,122),(1110,560,85)]:heart(d,x,y,r,rgba(gold,210))
        for x,y,r in [(210,65,20),(1030,400,24),(350,600,18)]:star(d,x,y,r,rgba(gold))
        gift(d,70,490,135,126,rgba('#9d1d42'),rgba(gold))
    elif key=='school':
        d.ellipse((350,-170,1260,740),fill=rgba(gold))
        for x in range(20,1200,85):d.line((x,0,x,680),fill=(255,255,255,24),width=2)
        for y in range(20,680,85):d.line((0,y,1200,y),fill=(255,255,255,24),width=2)
        for x,y,r in [(130,90,48),(1060,85,28),(1030,580,38),(100,540,31)]:star(d,x,y,r,rgba(gold if x<300 else '#fff6c9'))
        d.polygon([(25,340),(190,270),(210,298),(45,370)],fill=rgba('#ef8a48'));d.polygon([(25,340),(45,370),(5,373)],fill=rgba('#f7d9ad'))
    elif key=='summer':
        d.ellipse((560,-130,1170,480),fill=rgba(gold))
        for j in range(4):
            pts=[(x,round(510+j*50+28*math.sin(x/125+j*.7))) for x in range(0,1201,15)]
            d.line(pts,fill=rgba('#e4f6c1',150),width=5)
        foliage(d,1150,680,220,rgba('#176b62'));foliage(d,65,680,150,rgba('#a7e3ad'))
    else:
        d.ellipse((275,-100,1195,820),fill=rgba('#d5ad54'))
        for x,y,r in [(75,95,35),(1075,75,30),(1040,570,40),(150,555,25)]:star(d,x,y,r,rgba(gold),5,.45)
        d.polygon([(40,195),(155,135),(280,195),(155,255)],fill=rgba('#122d4f'))
        d.polygon([(95,210),(95,245),(155,270),(215,245),(215,210),(155,237)],fill=rgba('#122d4f'))
        d.line((275,195,275,265),fill=rgba(gold),width=5)
    canvas.alpha_composite(l)

def cutout(im):
    # Conservative flood fill: remove connected neutral light background only.
    im=ImageOps.contain(im,(950,950),Image.Resampling.LANCZOS)
    a=np.array(im,dtype=np.int16);h,w=a.shape[:2]
    edge=np.concatenate((a[:5].reshape(-1,3),a[-5:].reshape(-1,3),a[:,:5].reshape(-1,3),a[:,-5:].reshape(-1,3)))
    bg=np.median(edge,axis=0)
    if np.min(bg)<180 or np.max(bg)-np.min(bg)>27:return None
    dist=np.max(np.abs(a-bg),axis=2)
    neutral=(a.max(axis=2)-a.min(axis=2))<36
    candidate=(dist<48)&(a.min(axis=2)>170)&neutral
    seed=np.zeros((h,w),bool);seed[0]=candidate[0];seed[-1]=candidate[-1];seed[:,0]=candidate[:,0];seed[:,-1]=candidate[:,-1]
    removed=ndimage.binary_propagation(seed,mask=candidate)
    alpha=(~removed).astype('uint8')*255
    # Reject dubious masks: only use when substantial background and a coherent object remain.
    ratio=(alpha>0).mean()
    if not .07<ratio<.78:return None
    lab,n=ndimage.label(alpha>0)
    counts=np.bincount(lab.ravel());counts[0]=0
    main=counts.argmax()
    if counts[main]<.7*(alpha>0).sum():return None
    keep=lab==main
    # Leave holes (such as bag handles) intact, and remove tiny detached background specks.
    alpha=Image.fromarray(keep.astype('uint8')*255).filter(ImageFilter.GaussianBlur(.65))
    im=im.convert('RGBA');im.putalpha(alpha)
    bbox=alpha.getbbox();return im.crop(bbox) if bbox else None

def shadow_paste(canvas,im,x,y,offset=15,blur=22):
    sh=Image.new('RGBA',canvas.size);sil=Image.new('RGBA',im.size,(32,16,26,0));sil.putalpha(im.getchannel('A').point(lambda a:int(a*.36)))
    sh.alpha_composite(sil,(round(x+9),round(y+offset)));canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(blur)))
    canvas.alpha_composite(im,(round(x),round(y)))
def photo(canvas,im,box,shape='arch',angle=0,contain=False):
    x,y,w,h=box
    pic=ImageOps.fit(im,(w,h),Image.Resampling.LANCZOS) if not contain else ImageOps.pad(im,(w,h),color='#f7f2e7',method=Image.Resampling.LANCZOS)
    mask=Image.new('L',(w,h));d=ImageDraw.Draw(mask)
    if shape=='circle':d.ellipse((0,0,w-1,h-1),fill=255)
    elif shape=='arch':
        d.rounded_rectangle((0,0,w-1,h-1),radius=min(w//2,h//2),fill=255);d.rectangle((0,h//2,w-1,h-1),fill=255)
    else:d.rounded_rectangle((0,0,w-1,h-1),radius=28,fill=255)
    pic=pic.convert('RGBA');pic.putalpha(mask)
    if angle:
        pic=pic.rotate(angle,Image.Resampling.BICUBIC,expand=True);x+=(w-pic.width)/2;y+=(h-pic.height)/2
    shadow_paste(canvas,pic,x,y)
def product(canvas,im,box,fallback='round',angle=0):
    x,y,w,h=box;obj=cutout(im)
    if obj is None:return photo(canvas,im,box,fallback,angle,True)
    obj=ImageOps.contain(obj,(w,h),Image.Resampling.LANCZOS)
    if angle:obj=obj.rotate(angle,Image.Resampling.BICUBIC,expand=True)
    shadow_paste(canvas,obj,x+(w-obj.width)/2,y+(h-obj.height)/2,20,20)
def stage(canvas,x,y,w,h,color):
    d=ImageDraw.Draw(canvas);d.rounded_rectangle((x,y,x+w,y+h),radius=24,fill=rgba(color));d.ellipse((x,y-26,x+w,y+28),fill=rgba(color))
def compose(canvas,imgs,key,p):
    a,b,c=imgs;gold=p[2]
    if key=='christmas':
        photo(canvas,a,(390,48,660,540),'arch')
        product(canvas,b,(135,306,420,278),'round',-8)
    elif key=='tet':
        photo(canvas,a,(260,104,800,470),'round')
        product(canvas,b,(750,365,330,260),'round',3)
    elif key=='women-march':
        photo(canvas,b,(580,61,470,540),'arch')
        product(canvas,a,(216,192,350,400),'round',-6)
        product(canvas,c,(755,377,250,260),'round',8)
    elif key=='women-october':
        photo(canvas,a,(470,50,550,565),'arch',-4,True)
        photo(canvas,b,(230,230,285,370),'round',6,True)
        product(canvas,c,(780,400,340,230),'round',-8)
    elif key=='teachers':
        photo(canvas,a,(400,60,415,555),'arch',-5)
        photo(canvas,b,(720,282,405,275),'round',5)
        product(canvas,c,(130,335,285,230),'round',-5)
    elif key=='midautumn':
        photo(canvas,b,(370,65,585,510),'circle')
        product(canvas,c,(130,398,350,225),'round',-8)
    elif key=='valentine':
        product(canvas,b,(440,56,600,590),'circle',-8)
        product(canvas,a,(214,185,325,380),'round',6)
        photo(canvas,c,(805,380,280,230),'round',-9)
    elif key=='school':
        product(canvas,a,(480,35,600,605),'arch',-6)
        product(canvas,b,(106,150,350,330),'round',-9)
        product(canvas,c,(185,425,365,180),'round',9)
    elif key=='summer':
        product(canvas,a,(460,65,590,560),'arch',-5)
        product(canvas,b,(85,250,440,280),'round',-10)
        product(canvas,c,(770,425,345,210),'round',6)
    else:
        photo(canvas,a,(440,42,550,578),'arch',-5,True)
        photo(canvas,c,(170,255,315,350),'round',8,True)
        photo(canvas,b,(820,369,280,236),'round',-7)
def build(item):
    key=item['key'];p=PALETTE[key]
    canvas=backdrop(p[0],p[1]);decor(canvas,key,p)
    imgs=[fetch(x) for x in item['photos']]
    compose(canvas,imgs,key,p)
    out=ROOT/'assets'/('cham-festival-'+key+'.webp')
    canvas.convert('RGB').save(out,'WEBP',quality=84,method=6)
    print(out.name,out.stat().st_size,flush=True)
    return out
with ThreadPoolExecutor(max_workers=4) as pool: files=list(pool.map(build,items))
sheet=Image.new('RGB',(1000,5*300),'#fff');d=ImageDraw.Draw(sheet)
for i,p in enumerate(files):
    im=Image.open(p).resize((490,278),Image.Resampling.LANCZOS);x=(i%2)*500+5;y=(i//2)*300+5
    sheet.paste(im,(x,y));d.text((x,y+280),p.stem,fill='#171717')
sheet.save(ROOT/'.qa'/'cham-festival-contact.jpg',quality=85)
print('DONE',len(files),sum(p.stat().st_size for p in files))
