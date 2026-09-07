import struct
import json

with open('public/car_anatomy.glb', 'rb') as f:
    f.seek(12)
    jl, _ = struct.unpack('<II', f.read(8))
    d = json.loads(f.read(jl).decode('utf-8', errors='ignore').rstrip('\x00 '))
    materials = d.get('materials', [])
    print(f'Materials count: {len(materials)}')
    for i, m in enumerate(materials):
        print(f"Mat {i}: name='{m.get('name')}', pbr={m.get('pbrMetallicRoughness')}")
