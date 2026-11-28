from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFilter, ImageColor
from urllib.request import Request,urlopen
from io import BytesIO
import json, hashlib, math, random
R=Path(__file__).resolve().parents[1]
data=json.loads((R/'data/cham-diy-campaign.json').read_text(encoding='utf-8-sig'))
cache=R/'.qa'/'banner-source';cache.mkdir(parents=True,exist_ok=True)
W,H=1200,680
def fetch(p):
    u=p['url'];f=cache/(hashlib.sha256(u.encode()).hexdigest()+'.img')
    if not f.exists():
        with urlopen(Request(u+'&width=900',headers={'User-Agent':'Mozilla/5.0'}),timeout=30) as r:raw=r.read()
        Image.open(BytesIO(raw)).verify();f.write_bytes(raw)
    return ImageOps.exif_transpose(Image.open(f)).convert('RGB')
# Workshop campaign: rich violet and warm paper, with handmade geometric motifs.
base=Image.new('RGBA',(W,H),'#512a91');d=ImageDraw.Draw(base)
a=ImageColor.getrgb('#512a91');b=ImageColor.getrgb('#9d60d5')
for x in range(W):
    t=x/W;d.line((x,0,x,H),fill=tuple(round(v*(1-t)+w*t) for v,w in zip(a,b))+(255,))
d.ellipse((305,-120,1295,865),fill='#ffd86a')
d.polygon([(0,560),(480,352),(685,680),(0,680)],fill='#e98166')
d.polygon([(910,0),(1200,0),(1200,230)],fill='#f5b959')
for x in range(20,1200,64):
    for y in range(20,680,64):
        if (x<270 or x>1090):d.ellipse((x,y,x+3,y+3),fill='#f5d9a0')
def star(x,y,r,color):
    pts=[]
    for i in range(8):
        t=i*math.pi/4-math.pi/2;rr=r if i%2==0 else r*.22
        pts.append((x+rr*math.cos(t),y+rr*math.sin(t)))
    d.polygon(pts,fill=color)
star(102,95,44,'#ffe28c');star(1085,102,37,'#fff6d7');star(1088,554,50,'#fff6d7');star(150,565,30,'#fff6d7')
# Stitching arcs and small illustrated brush marks give the campaign a workshop feel.
for r in [86,108,130]:d.arc((80-r,300-r,80+r,300+r),-90,100,fill='#dcb5f5',width=3)
for x,y in [(1082,290),(1110,328),(1050,351)]:
    d.line((x,y,x+55,y-22),fill='#694393',width=8)
# Images are sourced from the actual reference catalog and retained unaltered inside frames.
def card(im,box,angle=0,mat='#fff3dc',shape='round'):
    x,y,w,h=box;out=Image.new('RGBA',(w,h));draw=ImageDraw.Draw(out)
    draw.rounded_rectangle((0,0,w-1,h-1),radius=36,fill=mat)
    margin=12; iw,ih=w-2*margin,h-2*margin
    photo=ImageOps.contain(im,(iw,ih),Image.Resampling.LANCZOS)
    if .82<(im.width/im.height)/(iw/ih)<1.22: photo=ImageOps.fit(im,(iw,ih),Image.Resampling.LANCZOS)
    mask=Image.new('L',photo.size,0);ImageDraw.Draw(mask).rounded_rectangle((0,0,photo.width-1,photo.height-1),radius=18,fill=255)
    out.paste(photo,((w-photo.width)//2,(h-photo.height)//2),mask)
    if angle:out=out.rotate(angle,Image.Resampling.BICUBIC,expand=True);x+=(w-out.width)/2;y+=(h-out.height)/2
    x,y=round(x),round(y)
    sh=Image.new('RGBA',base.size);sil=Image.new('RGBA',out.size,(49,26,55,0));sil.putalpha(out.getchannel('A').point(lambda a:int(a*.35)))
    sh.alpha_composite(sil,(x+8,y+17));base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(17)));base.alpha_composite(out,(x,y))
photos=[fetch(data['photos'][i]) for i in [1,4,0]]
card(photos[0],(80,65,410,385),10)
card(photos[1],(140,360,365,275),-8)
card(photos[2],(485,45,626,588),-4)
out=R/'assets'/'cham-festival-diy.webp';base.convert('RGB').save(out,'WEBP',quality=84,method=6)
print('DIY BANNER',out.stat().st_size)
