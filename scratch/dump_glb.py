import struct
import json

with open('car_anatomy.glb', 'rb') as f:
    header = f.read(12)
    magic, version, length = struct.unpack('<4sII', header)
    print(f"Magic: {magic}, Version: {version}, Length: {length}")
    
    chunk_header = f.read(8)
    chunk_len, chunk_type = struct.unpack('<II', chunk_header)
    print(f"Chunk 0 Len: {chunk_len}, Type: {chunk_type:x}")
    
    json_bytes = f.read(chunk_len)
    raw_str = json_bytes.decode('utf-8', errors='ignore')
    # strip trailing null/space padding if any
    raw_str = raw_str.rstrip('\x00 ')
    d = json.loads(raw_str)
    with open('glb_nodes_new.txt', 'w') as out:
        for i, n in enumerate(d.get('nodes', [])):
            name = n.get('name', '')
            mesh = n.get('mesh')
            out.write(f"{i}: {name} (mesh: {mesh})\n")
    print(f"Total nodes written: {len(d.get('nodes', []))}")
