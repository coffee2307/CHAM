from pathlib import Path
import re
base=Path(r'F:\CHAM')
files=list((base/'sections').glob('*.liquid'))+list((base/'snippets').glob('cham-*.liquid'))+[base/'layout'/'theme.liquid']
patterns=(r'CHẠM\s*/',r'\b\d{2}\s*[/—·]\s*[A-ZÀ-Ỵ]',r'↗',r'CUSTOM',r'CÁ NHÂN HÓA\s*/',r'\bABOUT US\b',r'\bOUR STORY\b',r'01—01',r'CHẠM 2\.0')
rg=re.compile('|'.join(patterns),re.I)
for p in files:
  lines=p.read_text(encoding='utf-8-sig').splitlines()
  found=[f'{i}: {line.strip()[:200]}' for i,line in enumerate(lines,1) if rg.search(line)]
  if found:
    print('\n'+str(p.relative_to(base)))
    for row in found[:20]:print('  '+row)
