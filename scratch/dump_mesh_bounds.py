import struct
import json

with open('public/car_anatomy.glb', 'rb') as f:
    f.seek(12)
    jl, _ = struct.unpack('<II', f.read(8))
    json_bytes = f.read(jl)
    d = json.loads(json_bytes.decode('utf-8', errors='ignore').rstrip('\x00 '))
    accessors = d.get('accessors', [])
    meshes = d.get('meshes', [])

    for m in meshes:
        pos_idx = m['primitives'][0]['attributes']['POSITION']
        acc = accessors[pos_idx]
        print(f"{m.get('name')}: min={acc.get('min')} max={acc.get('max')}")
