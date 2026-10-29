"""Package original SVG, PNG exports and reproducible art sources. No third-party dependencies."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root=Path(__file__).resolve().parent.parent
assets=root/'public/stick-frontier/assets'
output=assets/'frontier-art-pack.zip'
with ZipFile(output,'w',compression=ZIP_DEFLATED,compresslevel=6) as z:
    for p in sorted(assets.iterdir()):
        if p.is_file() and p.suffix!='.zip' and not (p.suffix=='.png' and (root/'work/frontier-png'/p.name).exists()):
            z.write(p,'public/stick-frontier/assets/'+p.name)
    for name in ['build-frontier-assets.mjs','export-frontier-png.mjs','pack-frontier-assets.py','frontier-character-art.mjs','verify-frontier-frames.py','verify-frontier-source.mjs']:
        z.write(root/'tools'/name,'tools/'+name)
    z.write(root/'public/stick-frontier/character-layout.mjs','public/stick-frontier/character-layout.mjs')
    z.write(root/'public/stick-frontier/ASSET-GUIDE.md','ASSET-GUIDE.md')
    for p in sorted((root/'work/frontier-png').glob('*.png')):
        z.write(p,'png/'+p.name)
with ZipFile(output) as z:
    assert z.testzip() is None
    print(f'Pack: {len(z.namelist())} files, {output.stat().st_size:,} bytes; CRC checks passed.')
