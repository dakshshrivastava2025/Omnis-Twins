import struct
import json

with open('car_anatomy.glb', 'rb') as f:
    f.seek(12)
    jl, jt = struct.unpack('<II', f.read(8))
    json_bytes = f.read(jl)
    d = json.loads(json_bytes.decode('utf-8', errors='ignore').rstrip('\x00 '))
    nodes = d.get('nodes', [])
    
    def print_node(idx, depth=0):
        n = nodes[idx]
        name = n.get('name', '')
        mesh = n.get('mesh')
        children = n.get('children', [])
        print("  " * depth + f"{idx}: {name} (mesh: {mesh})")
        for c in children:
            print_node(c, depth + 1)

    # find roots (nodes not children of any node)
    all_children = set()
    for n in nodes:
        all_children.update(n.get('children', []))
    roots = [i for i in range(len(nodes)) if i not in all_children]
    print("Tree hierarchy:")
    for r in roots:
        print_node(r)
