import struct
import json

with open('car_anatomy.glb', 'rb') as f:
    f.seek(12)
    jl, _ = struct.unpack('<II', f.read(8))
    json_bytes = f.read(jl)
    bin_header = f.read(8)
    bl, bt = struct.unpack('<II', bin_header)
    bin_data = f.read(bl)
    
    d = json.loads(json_bytes.decode('utf-8', errors='ignore').rstrip('\x00 '))
    accessors = d.get('accessors', [])
    bufferViews = d.get('bufferViews', [])
    meshes = d.get('meshes', [])
    nodes = d.get('nodes', [])
    
    for i, n in enumerate(nodes):
        mesh_idx = n.get('mesh')
        if mesh_idx is not None:
            m = meshes[mesh_idx]
            pos_acc_idx = m['primitives'][0]['attributes']['POSITION']
            acc = accessors[pos_acc_idx]
            bv = bufferViews[acc['bufferView']]
            offset = bv.get('byteOffset', 0) + acc.get('byteOffset', 0)
            
            # read min and max or calculate bbox from vertices
            min_v = acc.get('min')
            max_v = acc.get('max')
            if min_v and max_v:
                cx = (min_v[0] + max_v[0]) / 2
                cy = (min_v[1] + max_v[1]) / 2
                cz = (min_v[2] + max_v[2]) / 2
                print(f"Node {i:2d}: mesh={mesh_idx} ({n.get('name')}) center=({cx:.2f}, {cy:.2f}, {cz:.2f}) min=({min_v[0]:.2f},{min_v[1]:.2f},{min_v[2]:.2f}) max=({max_v[0]:.2f},{max_v[1]:.2f},{max_v[2]:.2f})")
