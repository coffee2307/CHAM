from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFilter, ImageColor, ImageEnhance
from urllib.request import Request, urlopen
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
import json, hashlib, math, random

ROOT = Path(__file__).resolve().parents[1]
items = json.loads((ROOT/'data/cham-banner-collections.json').read_text(encoding='utf-8-sig'))
cache = ROOT/'.qa'/'banner-source'
cache.mkdir(parents=True, exist_ok=True)
W,H = 1200,680
# Each campaign uses actual product photography, with a separate art direction.
THEMES={
 'study':('#1745b8','#3978ee','#ffe36a','notebook'),
 'disposable':('#00746b','#1bbba6','#c6f68b','leaves'),
 'coir':('#b84d10','#ee8d21','#ffe2a4','rings'),
 'ceramic':('#c03924','#f48144','#ffd5a9','arch'),
 'bamboo':('#ffbf25','#ffdc64','#7d4516','weave'),
 'grass':('#087247','#39a75e','#dcf18b','botanical'),
 'wood':('#683723','#ad6941','#f6c46d','grain'),
 'gifts':('#c51b4c','#f66580','#ffd17b','ribbon'),
 'vietnam':('#b31e2d','#e94b35','#ffce43','folk'),
 'yearend':('#08594f','#159784','#ffd45a','celebration'),
}

def fetch(url):
    path=cache/(hashlib.sha256(url.encode()).hexdigest()+'.img')
    if not path.exists():
        req=Request(url+'&width=900' if '?' in url else url+'?width=900',headers={'User-Agent':'Mozilla/5.0'})
        with urlopen(req, timeout=35) as resp: raw=resp.read()
        Image.open(BytesIO(raw)).verify()
        path.write_bytes(raw)
    im=ImageOps.exif_transpose(Image.open(path)).convert('RGBA')
    bg=Image.new('RGBA',im.size,'#f8f5ef');bg.alpha_composite(im)
    return bg.convert('RGB')

def rgb(c): return ImageColor.getrgb(c)
def mix(a,b,t): return tuple(round(a[i]*(1-t)+b[i]*t) for i in range(3))
def rgba(c,a): return (*rgb(c),a)
def gradient(base,bright):
    a,b=rgb(base),rgb(bright)
    im=Image.new('RGB',(W,H));d=ImageDraw.Draw(im)
    for x in range(W):
        t=(x/W)**1.25
        d.line((x,0,x,H),fill=mix(a,b,t))
    return im.convert('RGBA')

def star(d,x,y,r,color,n=4,inner=.25):
    pts=[]
    for i in range(n*2):
        t=-math.pi/2+i*math.pi/n
        rr=r if i%2==0 else r*inner
        pts.append((x+rr*math.cos(t),y+rr*math.sin(t)))
    d.polygon(pts,fill=color)

def art(canvas,base,bright,accent,style):
    layer=Image.new('RGBA',canvas.size);d=ImageDraw.Draw(layer)
    light=rgba(accent,110); faint=rgba(accent,40); white=(255,255,255,85)
    if style=='notebook':
        d.polygon([(120,680),(570,0),(1200,0),(1200,680)],fill=rgba(accent,36))
        for x in range(30,W,67):d.line((x,0,x,H),fill=(255,255,255,23),width=2)
        for y in range(30,H,67):d.line((0,y,W,y),fill=(255,255,255,23),width=2)
        d.ellipse((710,-105,1290,475),fill=rgba(accent,200))
        star(d,110,120,60,light);star(d,1120,615,45,white)
    elif style=='leaves':
        d.ellipse((245,-225,1135,665),fill=rgba(accent,145))
        for x,y,a in [(75,150,0),(1085,560,1),(1080,100,2)]:
            for j in range(5):
                yy=y+j*32
                d.ellipse((x-35,yy-20,x+65,yy+18),fill=rgba(accent,55+j*12))
            d.line((x+15,y-30,x+15,y+145),fill=white,width=4)
    elif style=='rings':
        for r in range(90,540,48):
            d.ellipse((795-r,350-r,795+r,350+r),outline=rgba(accent,52),width=4)
        d.ellipse((-110,390,350,850),fill=rgba(accent,150))
        for j in range(9):d.line((30+j*18,65,75+j*18,22),fill=light,width=5)
    elif style=='arch':
        d.rounded_rectangle((220,-155,1080,890),radius=390,fill=rgba(accent,165))
        d.arc((110,-200,1190,920),0,360,fill=white,width=4)
        d.arc((72,-235,1230,955),0,360,fill=white,width=3)
        star(d,105,510,60,light);star(d,1100,140,36,white)
    elif style=='weave':
        d.polygon([(570,0),(1200,0),(1200,680),(890,680)],fill=rgba(accent,38))
        for x in range(-500,1500,60):
            d.line((x,0,x+680,680),fill=rgba(accent,55),width=12)
            d.line((x,680,x+680,0),fill=rgba(accent,37),width=8)
        d.ellipse((260,-100,1070,710),fill=(255,239,166,190))
    elif style=='botanical':
        d.ellipse((390,-80,1320,820),fill=rgba(accent,100))
        for x,y,flip in [(60,75,1),(1100,520,-1)]:
            d.line((x,y,x+flip*120,y+170),fill=white,width=4)
            for j in range(6):
                px=x+flip*j*21;py=y+j*28
                d.ellipse((px-22,py-35,px+25,py+12),fill=rgba(accent,75))
    elif style=='grain':
        for j in range(16):
            points=[(x,round(20+j*44+28*math.sin(x/130+j*.4))) for x in range(-30,W+40,18)]
            d.line(points,fill=rgba(accent,46),width=3)
        d.rounded_rectangle((490,-95,1190,775),radius=340,fill=rgba(accent,105))
    elif style=='ribbon':
        d.polygon([(0,520),(1200,20),(1200,175),(0,675)],fill=rgba(accent,150))
        d.polygon([(200,0),(340,0),(1100,680),(960,680)],fill=rgba(accent,75))
        for x,y,r in [(110,80,34),(1100,560,55),(1020,105,22)]:star(d,x,y,r,white)
    elif style=='folk':
        d.ellipse((375,-120,1265,770),fill=rgba(accent,150))
        for i in range(8):
            x=36+i*158
            d.polygon([(x,20),(x+28,50),(x,80),(x-28,50)],outline=light,width=3)
            d.polygon([(x,600),(x+28,630),(x,660),(x-28,630)],outline=light,width=3)
        for r in [65,90,115]:d.arc((-r+100,-r+340,r+100,r+340),-70,70,fill=white,width=4)
    else:
        d.ellipse((280,-150,1180,760),fill=rgba(accent,118))
        for x,y,r in [(92,92,40),(1125,105,32),(80,585,22),(1110,590,50),(950,43,16)]:
            star(d,x,y,r,rgba(accent,230))
        rng=random.Random(42)
        for j in range(45):
            x,y=rng.randrange(W),rng.randrange(H)
            d.ellipse((x,y,x+5,y+5),fill=rgba(accent,100))
    canvas.alpha_composite(layer)

def frame(im,w,h,shape='round',mat='#fff7e7',border=10,mode='cover'):
    # Preserve product proportions. For wide or tall photos, contain on a matching mat.
    out=Image.new('RGBA',(w,h));d=ImageDraw.Draw(out)
    r=min(50,round(min(w,h)*.1))
    if shape=='circle':
        d.ellipse((0,0,w-1,h-1),fill=mat)
        inner=Image.new('L',(w-2*border,h-2*border));ImageDraw.Draw(inner).ellipse((0,0,inner.width-1,inner.height-1),fill=255)
    elif shape=='arch':
        d.rounded_rectangle((0,0,w-1,h-1),radius=w//2,fill=mat)
        d.rectangle((0,h//2,w-1,h-1),fill=mat)
        inner=Image.new('L',(w-2*border,h-2*border));q=ImageDraw.Draw(inner);q.rounded_rectangle((0,0,inner.width-1,inner.height-1),radius=inner.width//2,fill=255);q.rectangle((0,inner.height//2,inner.width-1,inner.height-1),fill=255)
    else:
        d.rounded_rectangle((0,0,w-1,h-1),radius=r,fill=mat)
        inner=Image.new('L',(w-2*border,h-2*border));ImageDraw.Draw(inner).rounded_rectangle((0,0,inner.width-1,inner.height-1),radius=max(4,r-border),fill=255)
    iw,ih=inner.size
    if mode=='contain' or not .7 < (im.width/im.height)/(iw/ih) < 1.45:
        pic=Image.new('RGB',(iw,ih),mat);p=ImageOps.contain(im,(iw,ih),Image.Resampling.LANCZOS);pic.paste(p,((iw-p.width)//2,(ih-p.height)//2))
    else:pic=ImageOps.fit(im,(iw,ih),Image.Resampling.LANCZOS)
    out.paste(pic.convert('RGBA'),(border,border),inner)
    return out

def place(canvas,im,rect,shape='round',mat='#fff7e7',angle=0,mode='cover',border=10):
    x,y,w,h=rect
    card=frame(im,w,h,shape,mat,border,mode)
    if angle:card=card.rotate(angle,Image.Resampling.BICUBIC,expand=True)
    x=round(x+(w-card.width)/2);y=round(y+(h-card.height)/2)
    shadow=Image.new('RGBA',card.size,(31,19,9,0));shadow.putalpha(card.getchannel('A').point(lambda a: round(a*.28)))
    ss=Image.new('RGBA',canvas.size);ss.paste(shadow,(x+9,y+16),shadow)
    canvas.alpha_composite(ss.filter(ImageFilter.GaussianBlur(19)))
    canvas.alpha_composite(card,(x,y))

# Different hierarchies and framing per collection; first entry is drawn furthest back.
# tuple: photo index, rectangle, shape, rotation, crop mode
LAYOUTS={
 'study':[(1,(50,70,385,340),'round',10,'contain'),(2,(108,409,310,225),'round',-8,'contain'),(0,(466,37,640,598),'arch',-3,'contain')],
 'disposable':[(1,(35,76,456,263),'round',-7,'cover'),(2,(72,374,410,246),'round',6,'contain'),(0,(505,48,595,595),'circle',0,'cover')],
 'coir':[(0,(25,122,550,485),'round',-4,'cover'),(2,(822,423,315,220),'round',6,'cover'),(1,(505,40,565,565),'circle',0,'cover')],
 'ceramic':[(2,(838,54,303,245),'round',7,'cover'),(1,(850,367,280,270),'round',-7,'contain'),(0,(69,66,769,550),'arch',0,'contain')],
 'bamboo':[(1,(50,54,378,345),'round',8,'contain'),(2,(73,406,343,220),'round',-6,'cover'),(0,(489,42,604,604),'circle',0,'contain')],
 'grass':[(2,(853,75,287,280),'round',8,'contain'),(1,(813,363,325,270),'round',-6,'contain'),(0,(92,36,681,606),'arch',0,'contain')],
 'wood':[(2,(877,74,275,280),'round',8,'contain'),(1,(814,376,335,252),'round',-5,'cover'),(0,(45,77,783,525),'round',-3,'cover')],
 'gifts':[(1,(40,105,374,400),'round',9,'contain'),(2,(792,250,354,370),'round',-10,'contain'),(0,(355,43,548,548),'circle',0,'cover')],
 'vietnam':[(2,(805,315,325,315),'round',-7,'contain'),(1,(767,35,365,276),'round',6,'cover'),(0,(57,55,710,565),'round',-3,'cover')],
 'yearend':[(1,(42,68,391,387),'round',7,'cover'),(2,(763,339,375,295),'round',-7,'cover'),(0,(400,51,555,585),'arch',0,'cover')],
}

def build(item):
    key=item['key'];base,bright,accent,style=THEMES[key]
    photos=[fetch(p['url']) for p in item['photos']]
    canvas=gradient(base,bright);art(canvas,base,bright,accent,style)
    for idx,rect,shape,angle,mode in LAYOUTS[key]:
        place(canvas,photos[idx],rect,shape,'#fff8e9',angle,mode,12)
    out=ROOT/'assets'/('cham-banner-'+key+'.webp')
    canvas.convert('RGB').save(out,'WEBP',quality=83,method=6)
    print(out.name,out.stat().st_size,flush=True)
    return out

with ThreadPoolExecutor(max_workers=4) as pool:
    files=list(pool.map(build,items))
sheet=Image.new('RGB',(1000,5*305),'#faf8f3');d=ImageDraw.Draw(sheet)
for i,p in enumerate(files):
    im=Image.open(p).resize((490,278),Image.Resampling.LANCZOS)
    x=(i%2)*500+5;y=(i//2)*305+5
    sheet.paste(im,(x,y));d.text((x,y+280),p.stem,fill='#292820')
sheet.save(ROOT/'.qa'/'cham-banner-contact.jpg',quality=88)
print('DONE',len(files),sum(p.stat().st_size for p in files),flush=True)
