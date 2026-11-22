from pathlib import Path
from urllib.request import Request,urlopen
from PIL import Image,ImageOps
import io,zipfile
url='https://opengameart.org/sites/default/files/FreeDinoSprite.zip'
data=urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=25).read()
z=zipfile.ZipFile(io.BytesIO(data))
root=Path(r'F:\CHAM\assets')
def make(kind,frames):
 ims=[]
 for i in frames:
  im=Image.open(io.BytesIO(z.read(f'png/{kind} ({i}).png'))).convert('RGBA')
  # preserve horizontal balance across states while maximizing detail
  crop=im.crop((0,0,535,472))
  bb=crop.getbbox()
  frame=crop.crop(bb)
  frame.thumbnail((220,230),Image.Resampling.LANCZOS)
  canvas=Image.new('RGBA',(256,256))
  x=(256-frame.width)//2;y=256-frame.height-6
  canvas.alpha_composite(frame,(x,y))
  ims.append(canvas)
 sheet=Image.new('RGBA',(256*len(ims),256))
 for idx,im in enumerate(ims):sheet.alpha_composite(im,(idx*256,0))
 name=f'cham-dino-{kind.lower()}.webp'
 sheet.save(root/name,'WEBP',quality=92,method=6)
 print(name,len(ims),(root/name).stat().st_size)
make('Run',range(1,9))
make('Jump',range(1,13))
make('Idle',range(1,11))
(root/'CHAM-GAME-ASSETS-LICENSE.txt').write_text('Free Dino Sprites by pzUH / GameArt2D, CC0 1.0. Original: https://opengameart.org/content/free-dino-sprites\nSprite frames extracted, cropped and resized for CHẠM. No additional license restrictions.\n',encoding='utf-8')
