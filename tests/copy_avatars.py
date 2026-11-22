from pathlib import Path
from shutil import copy2
import json,re,xml.etree.ElementTree as ET
src=Path(r'F:\Oxyz Edu\apps\web\public\avatars')
dest=Path(r'F:\CHAM\assets')
files=sorted(src.glob('*.svg'))
mapping=[]
for f in files:
    data=f.read_text(encoding='utf-8')
    if re.search(r'<script\b|\bon\w+\s*=|<foreignObject\b',data,re.I):
        raise ValueError('Unsafe SVG '+f.name)
    ET.fromstring(data)
    if 'creativecommons.org/publicdomain/zero/1.0/' not in data and f.name != 'avatar-default.svg':
        raise ValueError('Missing CC0 provenance: '+f.name)
    name='cham-'+f.name
    copy2(f,dest/name)
    mapping.append(name)
snippets=Path(r'F:\CHAM\snippets')
body='<script type="application/json" id="cham-avatar-catalog">\n[\n'+',\n'.join('  {{ '+repr(n)+' | asset_url | json }}' for n in mapping)+'\n]\n</script>\n'
(snippets/'cham-avatar-data.liquid').write_text(body,encoding='utf-8',newline='\n')
(Path(r'F:\CHAM\tests')/'avatar-manifest.json').write_text(json.dumps(mapping,ensure_ascii=False,indent=2),encoding='utf-8')
print('COPIED',len(mapping),'TOTAL_BYTES',sum((dest/n).stat().st_size for n in mapping))
print('EXAMPLE',mapping[:4],mapping[-4:])
