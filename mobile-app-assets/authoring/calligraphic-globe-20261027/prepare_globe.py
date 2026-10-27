from pathlib import Path
from PIL import Image,ImageDraw
import hashlib,json,shutil,numpy as np
ROOT=Path(__file__).parent
raw=ROOT/'raw/globe-original.png';image=Image.open(raw).convert('RGBA');a=np.asarray(image).copy();noise=(a[:,:,3]>0)&(a[:,:,3]<=2);a[noise]=0
image=Image.fromarray(a)
# Uniform centered scale only: match the existing family's 162/192 significant silhouette span.
a=np.asarray(image.getchannel('A'));ys,xs=np.nonzero(a>32);extent=max(xs.max()-xs.min()+1,ys.max()-ys.min()+1);factor=(162/192)*image.width/extent
side=round(image.width*factor)
master=Image.new('RGBA',image.size);shrunk=image.convert('RGBa').resize((side,side),Image.Resampling.BILINEAR).convert('RGBA');master.alpha_composite(shrunk,((image.width-side)//2,(image.height-side)//2))
master.save(ROOT/'final/globe-master.png')
final=master.convert('RGBa').resize((192,192),Image.Resampling.LANCZOS).convert('RGBA');rgba=np.asarray(final).copy();rgba[rgba[:,:,3]==0,:3]=0;final=Image.fromarray(rgba)
final.save(ROOT/'final/globe.webp','WEBP',lossless=True,exact=True,method=6)
decoded=Image.open(ROOT/'final/globe.webp').convert('RGBA');assert np.array_equal(np.asarray(final),np.asarray(decoded))
assert decoded.size==(192,192)
alpha=np.asarray(decoded.getchannel('A'));assert not max(alpha[:8,:8].max(),alpha[-8:,:8].max(),alpha[:8,-8:].max(),alpha[-8:,-8:].max())
ys,xs=np.nonzero(alpha>32)
checker=Image.new('RGBA',(576,576),'#d5d6dc');d=ImageDraw.Draw(checker)
for y in range(0,576,24):
 for x in range(0,576,24):
  if(x//24+y//24)%2:d.rectangle((x,y,x+23,y+23),fill='#a2a5b0')
checker.alpha_composite(master.resize((576,576),Image.Resampling.BILINEAR));checker.convert('RGB').save(ROOT/'review/checker.png')
# Actual CSS alpha-mask simulations: no invented linework, RGB is irrelevant to the website masks.
contact=Image.new('RGB',(920,280),'#f8fafc');draw=ImageDraw.Draw(contact)
for i,name in enumerate(['book','map','fountainPen','globe']):
 source=Image.open(ROOT/('final/globe.webp' if name=='globe' else f'references/{name}.webp')).convert('RGBA')
 draw.text((i*230+12,10),name,fill='#152238')
 for j,size in enumerate([28,36,64,128]):
  mask=source.getchannel('A').resize((size,size),Image.Resampling.LANCZOS)
  tile=Image.new('RGBA',(size,size),'#3264bd');tile.putalpha(mask)
  x=i*230+12+(96 if size==128 else 0);y=[35,80,130,65][j]
  contact.paste(tile,(x,y),tile)
 draw.text((i*230+12,252),'28 / 36 / 64 / 128 px',fill='#152238')
contact.save(ROOT/'review/family-mask-sizes.png')
# Fully opaque backgrounds prove there is no baked black square or key tint.
preview=Image.new('RGB',(512,256),'white')
for i,bg in enumerate(['#f8fafc','#132239']):
 tile=Image.new('RGBA',(256,256),bg);ink=Image.new('RGBA',(192,192),'#6c9aff');ink.putalpha(decoded.getchannel('A'));tile.alpha_composite(ink,(32,32));preview.paste(tile.convert('RGB'),(256*i,0))
preview.save(ROOT/'review/mask-light-dark.png')
report={'date':'2026-10-27','tool':'built-in ImageGen','modelVersion':'tool-managed; not exposed','originalGeneratedPath':'/Users/griffinrutherford/.codex/generated_images/01a179c5-76c7-70e2-ab7c-0fdfe71c73a7/exec-f9785746-ce5c-4e70-aacb-11e43a599fe6.png','promptPath':'prompts/globe.txt','rawSize':image.size,'masterSize':master.size,'runtimeSize':decoded.size,'uniformScale':factor,'alphaNoiseFloor':2,'noisePixelsRemoved':int(noise.sum()),'runtimeCoverageAlphaAbove32':float(np.mean(alpha>32)),'runtimeAlphaBoundsAbove32':[int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)],'transparentCorners':True,'fullRgbaExactAfterWebp':True,'preparation':'Generated alpha retained except <=2 noise floor; centered uniform padding; premultiplied resampling; exact lossless WebP. No redrawn or added strokes.','reviewScope':'offline actual CSS-alpha-mask simulations at 28/36/64/128px; not browser/native screenshot','files':[]}
for p in [raw,ROOT/'final/globe-master.png',ROOT/'final/globe.webp',ROOT/'prompts/globe.txt',*sorted((ROOT/'references').glob('*'))]:report['files'].append({'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size})
(ROOT/'provenance.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
