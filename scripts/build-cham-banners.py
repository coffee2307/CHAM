from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFilter
from urllib.request import Request, urlopen
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
import json, hashlib

ROOT = Path(__file__).resolve().parents[1]
items = json.loads((ROOT/'data/cham-banner-collections.json').read_text(encoding='utf-8-sig'))
cache = ROOT/'.qa'/'banner-source'
cache.mkdir(parents=True, exist_ok=True)
W,H = 1200,680

def fetch(url):
    path=cache/(hashlib.sha256(url.encode()).hexdigest()+'.img')
    if not path.exists():
        req=Request(url+'&width=900' if '?' in url else url+'?width=900', headers={'User-Agent':'Mozilla/5.0'})
        with urlopen(req, timeout=35) as resp: raw=resp.read()
        Image.open(BytesIO(raw)).verify()
        path.write_bytes(raw)
    im=ImageOps.exif_transpose(Image.open(path))
    if im.mode=='RGBA':
        bg=Image.new('RGBA',im.size,'#f7f3eb');bg.alpha_composite(im);im=bg
    return im.convert('RGB')

def card(canvas, im, rect, bg):
    x,y,w,h=rect
    # Preserve actual product proportions; gently crop only near-identical aspect ratios.
    canvas.paste(bg,(x,y,x+w,y+h))
    iw,ih=im.size
    if .82 < (iw/ih)/(w/h) < 1.24:
        pic=ImageOps.fit(im,(w,h),Image.Resampling.LANCZOS)
        canvas.paste(pic,(x,y))
    else:
        pic=ImageOps.contain(im,(w-12,h-12),Image.Resampling.LANCZOS)
        canvas.paste(pic,(x+(w-pic.width)//2,y+(h-pic.height)//2))

def build(pair):
    i,item=pair
    photos=[fetch(p['url']) for p in item['photos']]
    canvas=Image.new('RGB',(W,H),item['color'])
    # Different compositions alternate between vertical stacks and three editorial panels.
    if i%3==0:
        rects=[(18,18,742,644),(774,18,408,315),(774,347,408,315)]
    elif i%3==1:
        rects=[(434,18,748,644),(18,18,402,315),(18,347,402,315)]
    else:
        rects=[(18,18,568,644),(600,18,582,315),(600,347,582,315)]
    for im,rect in zip(photos,rects): card(canvas,im,rect,'#f8f5ee')
    out=ROOT/'assets'/('cham-banner-'+item['key']+'.webp')
    canvas.save(out,'WEBP',quality=84,method=6)
    print(out.name, out.stat().st_size, flush=True)
    return out

with ThreadPoolExecutor(max_workers=4) as pool:
    files=list(pool.map(build,enumerate(items)))
# Contact sheet for review; not published.
sheet=Image.new('RGB',(960,5*290),'#faf8f3')
draw=ImageDraw.Draw(sheet)
for i,p in enumerate(files):
    im=Image.open(p).resize((470,266),Image.Resampling.LANCZOS)
    x=(i%2)*480+5;y=(i//2)*290+5
    sheet.paste(im,(x,y));draw.text((x,y+268),p.stem,fill='#292820')
sheet.save(ROOT/'.qa'/'cham-banner-contact.jpg',quality=88)
print('DONE',len(files),sum(p.stat().st_size for p in files),flush=True)
