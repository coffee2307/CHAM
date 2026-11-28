from pathlib import Path
import importlib.util,sys,json
from PIL import Image,ImageOps,ImageDraw,ImageFilter
import numpy as np
from scipy import ndimage
import onnxruntime as ort
from urllib.request import Request,urlopen

ROOT=Path(__file__).resolve().parents[1]
Q=ROOT/'.qa'
# Load the existing campaign renderer without executing its batch entry point.
spec=importlib.util.spec_from_file_location('campaigns',ROOT/'scripts/build-cham-festivals.py')
campaigns=importlib.util.module_from_spec(spec);spec.loader.exec_module(campaigns)
model=Q/'studio'/'u2netp.onnx'
model.parent.mkdir(parents=True,exist_ok=True)
if not model.exists():
    with urlopen(Request('https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2netp.onnx',headers={'User-Agent':'Mozilla/5.0'}),timeout=60) as r:
        model.write_bytes(r.read())
opts=ort.SessionOptions();opts.intra_op_num_threads=3
sess=ort.InferenceSession(str(model),sess_options=opts,providers=['CPUExecutionProvider'])
input_name=sess.get_inputs()[0].name
def neural(im):
    ar=np.asarray(im.resize((320,320),Image.Resampling.LANCZOS),dtype=np.float32)/255
    ar=(ar-np.array([.485,.456,.406],np.float32))/np.array([.229,.224,.225],np.float32)
    v=sess.run(None,{input_name:ar.transpose(2,0,1)[None]})[0][0,0]
    v=(v-v.min())/max(1e-6,v.max()-v.min())
    m=np.asarray(Image.fromarray(np.uint8(v*255)).resize(im.size,Image.Resampling.LANCZOS),dtype=np.float32)/255
    a=np.clip((m-.16)/.70,0,1)
    a[a<.04]=0;a[a>.97]=1
    return a
def white_mask(im,fill=True):
    ar=np.asarray(im,dtype=np.float32)
    # The original product photos have a white seamless background. Do not
    # classify light-colored textile or straw texture as exterior background.
    delta=255-ar.min(axis=2)
    foreground=delta>17
    labels,n=ndimage.label(foreground)
    sizes=np.bincount(labels.ravel());sizes[0]=0
    keep=sizes>=max(7,im.width*im.height*.0001);keep[0]=False
    fg=keep[labels]
    fg=ndimage.binary_closing(fg,iterations=1)
    if fill:
        fg=ndimage.binary_fill_holes(fg)
    else:
        holes=ndimage.binary_fill_holes(fg)&~fg
        lab,n=ndimage.label(holes);sizes=np.bincount(lab.ravel());sizes[0]=0
        small=(sizes<im.width*im.height*.0015)&(sizes>0)
        fg|=small[lab]
    # Edge alpha is derived from the background contrast, with subpixel smoothing.
    fg=ndimage.binary_erosion(fg,iterations=1,border_value=0)
    soft=np.asarray(Image.fromarray(np.uint8(fg)*255).filter(ImageFilter.GaussianBlur(.65)),dtype=np.float32)/255
    soft[soft<.035]=0
    return soft
def extract(im,kind):
    if kind=='pencil':
        # Select the product area, excluding the separate header above it.
        im=im.crop((0,round(im.height*.27),im.width,round(im.height*.85)))
        a=neural(im)
    elif kind=='bag':
        a=white_mask(im,False)
    elif kind=='hat':
        a=white_mask(im,True)
    elif kind=='fan':
        # Select one complete fan from the lower-left of the reference photo.
        im=im.crop((round(im.width*.018),round(im.height*.47),round(im.width*.48),round(im.height*.97)))
        a=white_mask(im,True)
    else:
        a=neural(im)
        # Fill internal holes, so white labels and paper on notebooks remain intact.
        inside=ndimage.binary_fill_holes(a>.52)
        a=np.maximum(a,inside.astype(np.float32)*.98)
    alpha=Image.fromarray(np.uint8(a*255))
    bbox=alpha.point(lambda v:255 if v>45 else 0).getbbox()
    if not bbox:raise ValueError(kind+' empty cutout')
    # Neutralize white anti-aliasing on the boundary, without modifying the opaque object.
    pix=np.asarray(im,dtype=np.float32)
    opacity=np.asarray(alpha,dtype=np.float32)/255
    edge=(opacity>.12)&(opacity<.98)
    pix[edge]=np.clip((pix[edge]-255*(1-opacity[edge,None]))/np.maximum(.12,opacity[edge,None]),0,255)
    im=Image.fromarray(np.uint8(pix)).convert('RGBA');im.putalpha(alpha)
    return im.crop(bbox)
def put(canvas,obj,box,angle=0):
    x,y,w,h=box
    obj=ImageOps.contain(obj,(w,h),Image.Resampling.LANCZOS)
    if angle:obj=obj.rotate(angle,Image.Resampling.BICUBIC,expand=True)
    campaigns.shadow_paste(canvas,obj,x+(w-obj.width)/2,y+(h-obj.height)/2,13,14)
def build(key):
    item=next(x for x in campaigns.items if x['key']==key)
    p=campaigns.PALETTE[key]
    canvas=campaigns.backdrop(p[0],p[1]);campaigns.decor(canvas,key,p)
    a,b,c=[campaigns.fetch(p) for p in item['photos']]
    if key=='school':
        # Leave room for all three silhouettes, including straps, labels and tassels.
        put(canvas,extract(b,'notebooks'),(105,85,365,330),-6)
        put(canvas,extract(a,'backpack'),(490,72,575,532),-3)
        put(canvas,extract(c,'pencil'),(105,420,390,155),4)
    else:
        put(canvas,extract(b,'hat'),(95,230,410,290),-5)
        put(canvas,extract(a,'bag'),(430,62,505,545),-2)
        put(canvas,extract(c,'fan'),(895,390,245,230),6)
    out=ROOT/'assets'/('cham-festival-'+key+'.webp')
    canvas.convert('RGB').save(out,'WEBP',quality=88,method=6)
    print('REPAIRED',key,out.stat().st_size,flush=True)
for key in ['school','summer']:build(key)
