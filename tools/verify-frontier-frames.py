"""Validate untrimmed sprite frames against the declared transparent safety margin.
Requires Pillow in the development environment. Never edits artwork.
"""
from pathlib import Path
from PIL import Image
import json,hashlib
root=Path(__file__).resolve().parent.parent
assets=root/'public/stick-frontier/assets'
m=json.loads((assets/'manifest.json').read_text())
size=m['frame']['width'];pad=m['frame']['padding'];columns=m['framesPerState']
sheets=[(name,len(m['states'])) for unit in m['units'].values() for name in unit.values()]
sheets += [(name,len(m['worker']['states'])) for name in m['worker']['files'].values()]
report={'version':m['version'],'frame':[size,size],'pivot':m['frame']['pivot'],'requiredPadding':pad,'frames':[],'failures':[],'sources':{}}
for name,rows in sheets:
    report['sources'][name]=hashlib.sha256((assets/name).read_bytes()).hexdigest()
    im=Image.open(root/'work/frontier-png'/name.replace('.svg','.png')).convert('RGBA')
    assert im.size==(size*columns,size*rows),(name,im.size)
    for row in range(rows):
        for frame in range(columns):
            cell=im.crop((frame*size,row*size,(frame+1)*size,(row+1)*size))
            box=cell.getchannel('A').getbbox()
            margin=min(box[0],box[1],size-box[2],size-box[3]) if box else -1
            record={'sheet':name,'row':row,'frame':frame,'bounds':box,'padding':margin}
            report['frames'].append(record)
            if margin<pad:report['failures'].append(record)
report['checkedFrames']=len(report['frames'])
report['minimumPadding']=min(f['padding'] for f in report['frames'])
(assets/'character-bounds.json').write_text(json.dumps(report,ensure_ascii=False,separators=(',',':'))+'\n')
print(f"Checked {report['checkedFrames']} frames; minimum padding {report['minimumPadding']}px; failures {len(report['failures'])}.")
if report['failures']:
    for item in report['failures'][:15]:print(item)
    raise SystemExit(1)
