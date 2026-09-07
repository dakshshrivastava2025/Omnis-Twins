import struct
import json

with open('car_anatomy.glb', 'rb') as f:
    f.seek(12)
    jl, jt = struct.unpack('<II', f.read(8))
    d = json.loads(f.read(jl).decode('utf-8', errors='ignore').rstrip('\x00 '))
    nodes = d.get('nodes', [])
    for i, n in enumerate(nodes):
        trans = n.get('translation', [0,0,0])
        print(f"Node {i:2d}: name='{n.get('name')}', pos=({trans[0]:.2f}, {trans[1]:.2f}, {trans[2]:.2f})")
