from html.parser import HTMLParser
from pathlib import Path
root=Path(__file__).resolve().parents[1]/'dist'
class Page(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.refs=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'):self.ids.append(a['id'])
  for k in ('href','src'):
   if k in a:self.refs.append(a[k])
pages={}
for p in root.glob('*.html'):
 page=Page();page.feed(p.read_text(encoding="utf-8"));assert len(page.ids)==len(set(page.ids)),f'Duplicate ids: {p.name}';pages[p.name]=page
for name,p in pages.items():
 for ref in p.refs:
  if ':' in ref or ref.startswith('//'):continue
  target,_,anchor=ref.partition('#');target=target or name
  assert (root/target).is_file(),f'{name}: missing {ref}'
  if anchor:assert target in pages and anchor in pages[target].ids,f'{name}: missing anchor {ref}'
for n in ['prism','project','aegis','phoenix','cloud','itcraft']:assert (root/'assets'/f'{n}.webp').is_file()
for n in ['prismsuite','projectone','aegisone','phoenixodr','sovereign-cloud']:assert (root/f'{n}.html').is_file()
assert 'from \'three\'' not in (root/'vendor/RoomEnvironment.js').read_text(encoding="utf-8")
assert 'from \'three\'' not in (root/'vendor/RoundedBoxGeometry.js').read_text(encoding="utf-8")
print(f'PASS: {len(pages)} pages; local links, anchors, logos and local Three.js imports.')
