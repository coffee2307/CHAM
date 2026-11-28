from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, random
ROOT=Path(__file__).resolve().parents[1]
W,H=1200,750
FONT=Path(r'C:\Windows\Fonts\arialbd.ttf')
PAL={
 'memory':('#6939cc','#ad79ff','#ffe67c'),
 'quiz':('#1478c5','#55cafa','#ffe66f'),
 'match':('#087d70','#51d6ae','#ffdc71'),
 'word':('#da7319','#ffbb46','#fff0ab'),
 'speed':('#c93855','#ff7b6b','#ffe173'),
 'pack':('#3458bb','#8199ff','#ffd06c'),
 'wheel':('#912797','#e17bdb','#ffe081'),
 'hero':('#3c36a3','#7573ee','#ffe67c')
}
def rgb(v):return tuple(int(v[i:i+2],16) for i in (1,3,5))
def font(n):return ImageFont.truetype(str(FONT),n)
def star(d,x,y,r,fill):
 pts=[]
 for i in range(8):
  a=i*math.pi/4-math.pi/2; rr=r if i%2==0 else r*.28
  pts.append((x+math.cos(a)*rr,y+math.sin(a)*rr))
 d.polygon(pts,fill=fill)
def base(key):
 a,b,c=PAL[key];im=Image.new('RGB',(W,H));d=ImageDraw.Draw(im)
 aa,bb=rgb(a),rgb(b)
 for y in range(H):
  t=y/H;d.line((0,y,W,y),fill=tuple(round(x+(z-x)*t) for x,z in zip(aa,bb)))
 im=im.convert('RGBA');layer=Image.new('RGBA',im.size);d=ImageDraw.Draw(layer)
 d.ellipse((265,-155,1340,920),fill=(255,255,255,24))
 d.ellipse((450,-60,1200,760),outline=(255,255,255,45),width=4)
 for x,y,r in [(125,120,35),(1070,160,30),(110,620,26),(1060,625,37)]:star(d,x,y,r,c)
 for x,y in [(220,90),(990,90),(85,395),(1110,390),(220,650),(975,670)]:
  d.ellipse((x-6,y-6,x+6,y+6),fill=(255,255,255,160))
 im.alpha_composite(layer);return im
def shadow(im,obj,x,y,angle=0):
 if angle:obj=obj.rotate(angle,Image.Resampling.BICUBIC,expand=True)
 x,y=int(x-obj.width/2),int(y-obj.height/2)
 sil=Image.new('RGBA',obj.size,(22,14,67,0));sil.putalpha(obj.getchannel('A').point(lambda a:int(a*.34)))
 sh=Image.new('RGBA',im.size);sh.alpha_composite(sil,(x+9,y+20));im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(17)))
 im.alpha_composite(obj,(x,y))
def tile(w,h,color='#fffdf4',edge='#33245e'):
 im=Image.new('RGBA',(w,h));d=ImageDraw.Draw(im)
 d.rounded_rectangle((2,11,w-3,h-2),radius=34,fill=edge)
 d.rounded_rectangle((2,2,w-3,h-14),radius=34,fill=color,outline=edge,width=5)
 return im
def label(d,xy,t,n,fill='#33245e'):
 d.text(xy,t,font=font(n),fill=fill,anchor='mm',stroke_width=0)
def pot(d,x,y,s,color='#f09b59',outline='#5b3a62'):
 def xy(a,b):return(x+a*s,y+b*s)
 d.ellipse((*xy(-.58,.24),*xy(.58,.45)),fill='#ead8cc')
 d.rounded_rectangle((*xy(-.43,-.45),*xy(.43,-.16)),radius=int(.12*s),fill=color,outline=outline,width=max(2,int(s*.035)))
 d.ellipse((*xy(-.57,-.2),*xy(.57,.40)),fill=color,outline=outline,width=max(2,int(s*.035)))
 d.arc((*xy(-.41,-.13),*xy(.41,.28)),20,160,fill='#fff2bd',width=max(2,int(s*.05)))
 d.ellipse((*xy(-.37,-.43),*xy(.37,-.28)),fill=outline)
def basket(d,x,y,s):
 d.arc((x-s*.36,y-s*.63,x+s*.36,y+s*.2),180,360,fill='#633f37',width=int(s*.10))
 d.rounded_rectangle((x-s*.56,y-s*.18,x+s*.56,y+s*.42),radius=int(s*.14),fill='#f2b968',outline='#633f37',width=5)
 for i in range(1,6):
  xx=x-s*.56+i*s*.186;d.line((xx,y-s*.13,xx,y+s*.36),fill='#aa6d3e',width=4)
 for i in range(1,4):
  yy=y-s*.18+i*s*.15;d.line((x-s*.5,yy,x+s*.5,yy),fill='#aa6d3e',width=4)
def card_face(kind,back=False):
 obj=tile(300,370,'#b9a1ff' if back else '#fff7dc','#483092');d=ImageDraw.Draw(obj)
 if back:
  d.rounded_rectangle((27,28,273,330),radius=24,outline='#7757d3',width=5)
  star(d,150,175,84,'#ffe77d')
  d.ellipse((132,157,168,193),fill='#6944cb')
 elif kind=='pot':pot(d,150,194,187)
 else:basket(d,150,193,175)
 return obj
def memory(im):
 shadow(im,card_face('pot',True),365,335,18)
 shadow(im,card_face('pot'),605,343,-7)
 shadow(im,card_face('pot'),855,415,-18)
def quiz(im):
 obj=tile(440,440,'#fff8e5','#185aa1');d=ImageDraw.Draw(obj)
 label(d,(220,202),'?',260,'#286bd4')
 shadow(im,obj,600,350,7)
 for i,(x,y,t,col) in enumerate([(300,490,'A','#ffdf73'),(900,480,'B','#b0f5d5'),(900,210,'C','#ffb5ac')]):
  o=tile(178,166,col,'#19588e');label(ImageDraw.Draw(o),(89,77),t,88,'#184a86');shadow(im,o,x,y,(-10 if i==0 else 9))
def match(im):
 d=ImageDraw.Draw(im)
 for pts,col in [([(380,250),(540,250),(660,500),(820,500)],'#ffdc71'), ([(380,500),(540,500),(660,250),(820,250)],'#b5ffdf')]:
  d.line(pts,fill='#075e59',width=35,joint='curve');d.line(pts,fill=col,width=24,joint='curve')
 for x,y,k in [(310,250,'pot'),(310,500,'basket'),(890,250,'basket'),(890,500,'pot')]:
  o=tile(225,200,'#fff7d9','#176d64');dr=ImageDraw.Draw(o)
  (pot if k=='pot' else basket)(dr,112,104,125);shadow(im,o,x,y,0)
def word(im):
 o=tile(580,530,'#fff5d5','#a95218');d=ImageDraw.Draw(o)
 letters=['D','U','A','T','R','E','G','O','M','C','O','I','M','A','Y','X']
 for i,t in enumerate(letters):
  x=35+(i%4)*130;y=29+(i//4)*119
  col='#ffd14c' if i in (0,1,2,12,13,14) else '#fffdf1'
  d.rounded_rectangle((x,y,x+116,y+105),radius=18,fill=col,outline='#d88f36',width=4)
  label(d,(x+58,y+54),t,58,'#8b451b')
 shadow(im,o,600,370,-7)
def speed(im):
 d=ImageDraw.Draw(im)
 for y,x0,x1 in [(220,180,480),(350,90,390),(495,210,470)]:
  d.line((x0,y,x1,y),fill='#ffd96d',width=18)
 o=Image.new('RGBA',(500,545));d=ImageDraw.Draw(o)
 d.rounded_rectangle((188,8,312,88),radius=23,fill='#ffe17d',outline='#8a344a',width=7)
 d.rounded_rectangle((355,73,421,142),radius=13,fill='#fff1b7',outline='#8a344a',width=7)
 d.ellipse((20,70,480,530),fill='#ffe17d',outline='#8a344a',width=9)
 d.ellipse((54,104,446,496),fill='#fff9dc',outline='#e0a54e',width=7)
 for i in range(12):
  a=i*math.tau/12;d.line((250+math.sin(a)*166,300-math.cos(a)*166,250+math.sin(a)*182,300-math.cos(a)*182),fill='#a44853',width=6)
 d.line((250,300,328,169),fill='#d6434f',width=14);d.ellipse((230,280,270,320),fill='#8a344a')
 shadow(im,o,660,370,-9)
def pack(im):
 o=Image.new('RGBA',(670,540));d=ImageDraw.Draw(o)
 # Open carton with tape and protective paper; graphic illustration, not photo.
 d.polygon([(85,211),(327,117),(575,210),(329,306)],fill='#ba7839',outline='#673d49',width=7)
 d.polygon([(85,211),(329,306),(329,515),(85,414)],fill='#ffca69',outline='#673d49',width=7)
 d.polygon([(329,306),(575,210),(575,414),(329,515)],fill='#e29a4f',outline='#673d49',width=7)
 d.polygon([(85,211),(18,137),(244,52),(327,117)],fill='#ffe297',outline='#673d49',width=7)
 d.polygon([(327,117),(418,43),(650,126),(575,210)],fill='#ffdc8a',outline='#673d49',width=7)
 d.polygon([(329,306),(575,210),(648,285),(401,382)],fill='#ffd789',outline='#673d49',width=7)
 d.polygon([(85,211),(329,306),(254,381),(12,287)],fill='#ffdf9b',outline='#673d49',width=7)
 d.rounded_rectangle((382,393,490,436),radius=6,fill='#fff7da')
 shadow(im,o,600,388,-3)
def wheel(im):
 o=Image.new('RGBA',(560,560));d=ImageDraw.Draw(o)
 colors=['#ffe272','#f7b4cd','#87e6c8','#b2a2ff','#ffb476','#cce6ff']
 d.ellipse((6,6,554,554),fill='#fff9e5',outline='#54245b',width=9)
 for i,col in enumerate(colors):d.pieslice((30,30,530,530),i*60-90,(i+1)*60-90,fill=col,outline='#783a80',width=5)
 for i in range(6):
  a=(i*60-60)*math.pi/180;star(d,280+math.cos(a)*175,280+math.sin(a)*175,30,'#fffdf1')
 d.ellipse((217,217,343,343),fill='#fff4cb',outline='#793b80',width=6);star(d,280,280,43,'#b93fa8')
 d.polygon([(245,6),(315,6),(280,95)],fill='#e24567',outline='#713a67',width=5)
 shadow(im,o,600,370,-9)
def build(key):
 im=base(key)
 {'memory':memory,'quiz':quiz,'match':match,'word':word,'speed':speed,'pack':pack,'wheel':wheel,'hero':memory}[key](im)
 p=ROOT/'assets'/('cham-play-'+key+'.webp');im.convert('RGB').save(p,'WEBP',quality=87,method=6)
 print(p.name,p.stat().st_size)
if __name__=='__main__':
 for k in PAL:build(k)
