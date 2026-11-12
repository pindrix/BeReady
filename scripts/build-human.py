#!/usr/bin/env python3
"""Build the clothed BE READY responder from MakeHuman CC0 data assets.
No MakeHuman program code is used. Inputs are documented in responder-license.json.
Usage: python scripts/build-human.py --source /tmp
"""
import argparse,collections,hashlib,io,json,math,struct
from pathlib import Path
import numpy as np
from PIL import Image

parser=argparse.ArgumentParser();parser.add_argument('--source',default='/tmp');args=parser.parse_args()
S=Path(args.source);OUT=Path(__file__).resolve().parents[1]/'assets/models';OUT.mkdir(parents=True,exist_ok=True)

def obj(path):
    positions=[];uv=[];faces=[];group='body'
    for line in Path(path).read_text().splitlines():
        p=line.split()
        if not p:continue
        if p[0]=='v':positions.append([float(x) for x in p[1:4]])
        elif p[0]=='vt':uv.append([float(x) for x in p[1:3]])
        elif p[0]=='g':group=' '.join(p[1:])
        elif p[0]=='f':faces.append((group,[(int(x.split('/')[0])-1,int(x.split('/')[1])-1 if len(x.split('/'))>1 and x.split('/')[1] else -1)for x in p[1:]]))
    return np.array(positions,dtype=float),np.array(uv,dtype=float),faces
base,baseuv,basefaces=obj(S/'mh-base.obj')
rig=json.loads((S/'default.mhskel').read_text());weights=json.loads((S/'default_weights.mhw').read_text())['weights'];names=list(rig['bones']);boneindex={n:i for i,n in enumerate(names)}
vertexweights=[collections.defaultdict(float)for _ in base]
for name,rows in weights.items():
    for vi,w in rows:vertexweights[vi][boneindex[name]]+=w

def mhclo(path):
    rows=[];deleted=set();mode='header';ratios=np.ones(3)
    for line in Path(path).read_text().splitlines():
        p=line.split()
        if not p or p[0].startswith('#'):continue
        if p[0] in ('x_scale','y_scale','z_scale'):
            axis={'x_scale':0,'y_scale':1,'z_scale':2}[p[0]];ratios[axis]=abs(base[int(p[1]),axis]-base[int(p[2]),axis])/float(p[3])
        elif p[0]=='verts':mode='verts'
        elif p[0]=='delete_verts':mode='delete'
        elif mode=='verts' and p[0].lstrip('-').isdigit():
            if len(p)==9:rows.append((list(map(int,p[:3])),list(map(float,p[3:6])),np.array(list(map(float,p[6:9])))*ratios))
            elif len(p)==1:rows.append(([int(p[0])],[1.],np.zeros(3)))
        elif mode=='delete':
            i=0
            while i<len(p):
                a=int(p[i]);i+=1
                if i<len(p)and p[i]=='-':b=int(p[i+1]);i+=2;deleted.update(range(a,b+1))
                else:deleted.add(a)
    fitted=np.array([(base[ids]*np.array(ws)[:,None]).sum(0)+off for ids,ws,off in rows]);skin=[]
    for ids,ws,off in rows:
        d=collections.defaultdict(float)
        for idx,w in zip(ids,ws):
            for b,bw in vertexweights[idx].items():d[b]+=w*bw
        skin.append(d)
    return fitted,skin,deleted

clothdir=S/'mh-system/clothes/male_casualsuit02';hairdir=S/'mh-system/hair/short04'
cloth,clothweights,hidden=mhclo(clothdir/'male_casualsuit02.mhclo');_,clothuv,clothfaces=obj(clothdir/'male_casualsuit02.obj')
hair,hairweights,_=mhclo(hairdir/'short04.mhclo');_,hairuv,hairfaces=obj(hairdir/'short04.obj')
eyes,eyeweights,_=mhclo(S/'mh-eyes.mhclo');_,eyeuv,eyefaces=obj(S/'mh-eyes.obj')
# Exclude hidden skin/feet/covered intimate anatomy from the asset itself, not just visibility flags.
visible=[]
for group,face in basefaces:
    if group!='body':continue
    ids=[i for i,u in face];center=base[ids].mean(0)
    if any(i in hidden for i in ids):continue
    if center[1]<-7.15:continue
    if -.8<center[1]<4.8 and abs(center[0])<1.3:continue
    visible.append((group,face))

# Original coordinate units are approximately decimetres; normalize complete body to 1.8m.
floor=float(base[:,1].min());top=float(max(base[:,1].max(),hair[:,1].max()));scale=1.8/(top-floor)
def metric(p):
    q=np.array(p,dtype=float).copy();q[...,1]-=floor;return q*scale
jointpos={name:metric(np.mean(base[ids],axis=0)).tolist()for name,ids in rig['joints'].items()}
heads={name:jointpos[b['head']]for name,b in rig['bones'].items()}
tails={name:jointpos[b['tail']]for name,b in rig['bones'].items()}

binary=bytearray();g={'asset':{'version':'2.0','generator':'BE READY CC0 asset builder','copyright':'MakeHuman data assets CC0-1.0; Data Collection AB, Joel Palmius, Jonas Hauquier. Derived civilian responder for BE READY.'},'scene':0,'scenes':[{'nodes':[]}],'nodes':[],'meshes':[],'skins':[],'materials':[],'textures':[],'images':[],'samplers':[{'magFilter':9729,'minFilter':9987,'wrapS':10497,'wrapT':10497}],'accessors':[],'bufferViews':[],'buffers':[{'byteLength':0}]}
def view(data,target=None):
    while len(binary)%4:binary.append(0)
    at=len(binary);binary.extend(data);row={'buffer':0,'byteOffset':at,'byteLength':len(data)}
    if target:row['target']=target
    g['bufferViews'].append(row);return len(g['bufferViews'])-1

def accessor(data,typ,component,target=None,bounds=False):
    dtype={5126:'<f4',5123:'<u2',5125:'<u4'}[component];a=np.asarray(data,dtype=dtype);row={'bufferView':view(a.tobytes(),target),'componentType':component,'count':len(a),'type':typ}
    if bounds:row.update({'min':a.min(0).tolist(),'max':a.max(0).tolist()})
    g['accessors'].append(row);return len(g['accessors'])-1

def texture(path,alpha=False,normal=False,size=1024):
    im=Image.open(path).convert('RGBA'if alpha else'RGB');im.thumbnail((size,size),Image.Resampling.LANCZOS);buffer=io.BytesIO();im.save(buffer,format='PNG'if alpha or normal else'JPEG',quality=93,optimize=True)
    g['images'].append({'bufferView':view(buffer.getvalue()),'mimeType':'image/png'if alpha or normal else'image/jpeg'});g['textures'].append({'source':len(g['images'])-1,'sampler':0});return len(g['textures'])-1

def mat(name,color,roughness=.8,tex=None,normal=None,alpha=False):
    row={'name':name,'pbrMetallicRoughness':{'baseColorFactor':color,'metallicFactor':0,'roughnessFactor':roughness},'doubleSided':alpha}
    if tex is not None:row['pbrMetallicRoughness']['baseColorTexture']={'index':tex}
    if normal is not None:row['normalTexture']={'index':normal,'scale':.55}
    if alpha:row.update({'alphaMode':'MASK','alphaCutoff':.35})
    g['materials'].append(row);return len(g['materials'])-1
skintex=texture(S/'mh-system/skins/young_caucasian_male/young_lightskinned_male_diffuse.png')
clothtex=texture(clothdir/'male_casualsuit02_diffuse.png');clothnormal=texture(clothdir/'male_casualsuit02_normal.png',normal=True)
hairtex=texture(hairdir/'short04_diffuse.png',alpha=True);eyetex=texture(S/'mh-brown-eye.png',alpha=True)
skinmat=mat('Skin',[1,1,1,1],.65,skintex);clothmat=mat('Casual_Outfit',[1,1,1,1],.85,clothtex,clothnormal);hairmat=mat('Hair',[.28,.22,.18,1],.9,hairtex,alpha=True);eyemat=mat('Eyes',[1,1,1,1],.25,eyetex,alpha=True);shoemat=mat('Shoes',[.07,.085,.1,1],.72);solemat=mat('Soles',[.18,.2,.21,1],.9)

# Bone bind axes are identity; relative translations and inverse-bind matrices retain the original mesh orientation.
for name in names:
    b=rig['bones'][name];parent=b['parent'];world=np.array(heads[name]);relative=world-(np.array(heads[parent])if parent else 0)
    children=[boneindex[n]for n in names if rig['bones'][n]['parent']==name]
    g['nodes'].append({'name':name,'translation':relative.tolist(),**({'children':children}if children else{})})
roots=[boneindex[n]for n in names if rig['bones'][n]['parent']is None]
ib=[]
for name in names:
    m=np.eye(4);m[:3,3]=-np.array(heads[name]);ib.append(m.T.flatten())
g['skins'].append({'name':'Responder_Skeleton','joints':list(range(len(names))),'skeleton':roots[0],'inverseBindMatrices':accessor(ib,'MAT4',5126)})

def mesh(name,positions,uv,faces,weights,material):
    normals=np.zeros_like(positions)
    for group,face in faces:
        ids=[i for i,u in face]
        for j in range(1,len(ids)-1):
            a,b,c=ids[0],ids[j],ids[j+1];n=np.cross(positions[b]-positions[a],positions[c]-positions[a]);normals[a]+=n;normals[b]+=n;normals[c]+=n
    norm=np.linalg.norm(normals,axis=1);norm[norm<1e-10]=1;normals/=norm[:,None]
    positions=metric(positions);unique={};p=[];n=[];t=[];joints=[];ws=[];indices=[]
    for group,face in faces:
        mapped=[]
        for vi,ti in face:
            key=(vi,ti)
            if key not in unique:
                unique[key]=len(p);p.append(positions[vi]);n.append(normals[vi]);t.append([uv[ti,0],1-uv[ti,1]]if ti>=0 else[0,0])
                rows=sorted(weights[vi].items(),key=lambda x:x[1],reverse=True)[:4];rows=[(b,max(0,w))for b,w in rows if w>0];total=sum(w for b,w in rows)
                if not total:rows=[(boneindex['root'],1.)];total=1
                js=[b for b,w in rows];vv=[w/total for b,w in rows]
                joints.append(js+[0]*(4-len(js)));ws.append(vv+[0]*(4-len(vv)))
            mapped.append(unique[key])
        for k in range(1,len(mapped)-1):indices.extend([mapped[0],mapped[k],mapped[k+1]])
    prim={'attributes':{'POSITION':accessor(p,'VEC3',5126,34962,True),'NORMAL':accessor(n,'VEC3',5126,34962),'TEXCOORD_0':accessor(t,'VEC2',5126,34962),'JOINTS_0':accessor(joints,'VEC4',5123,34962),'WEIGHTS_0':accessor(ws,'VEC4',5126,34962)},'indices':accessor(indices,'SCALAR',5125,34963),'material':material}
    g['meshes'].append({'name':name,'primitives':[prim]});g['nodes'].append({'name':name,'mesh':len(g['meshes'])-1,'skin':0});return len(g['nodes'])-1,len(indices)//3

mesh_nodes=[];counts={}
for data in [('Body',base,baseuv,visible,vertexweights,skinmat),('Clothing',cloth,clothuv,clothfaces,clothweights,clothmat),('Hair',hair,hairuv,hairfaces,hairweights,hairmat),('Eyes',eyes,eyeuv,eyefaces,eyeweights,eyemat)]:
    node,triangles=mesh(*data);mesh_nodes.append(node);counts[data[0]]=triangles

# Closed civilian shoes, with a shaped toe box and rubber sole. Rigid weighting to the foot keeps them stable.
for side,sign in [('L',1),('R',-1)]:
    center=np.array(heads['foot.'+side]);xx=center[0];rings=[(-.07,.035,.13),(-.025,.061,.145),(.06,.066,.105),(.15,.063,.08),(.22,.045,.055),(.245,.012,.04)];verts=[]
    for z,width,height in rings:
        for k in range(12):
            a=2*math.pi*k/12;verts.append([xx+math.cos(a)*width,(math.sin(a)+1)*height/2,center[2]+z])
    faces=[]
    for r in range(len(rings)-1):
        for k in range(12):faces.append(('shoe',[(r*12+k,-1),(r*12+(k+1)%12,-1),((r+1)*12+(k+1)%12,-1),((r+1)*12+k,-1)]))
    faces.append(('shoe',[(k,-1)for k in reversed(range(12))]));faces.append(('shoe',[((len(rings)-1)*12+k,-1)for k in range(12)]))
    # mesh() applies metric; reverse normalization for this procedural part already authored in metres.
    vv=np.array(verts)/scale;vv[:,1]+=floor;ww=[{boneindex['foot.'+side]:1.}for _ in vv]
    node,triangles=mesh('Shoe_'+side,vv,np.zeros((1,2)),faces,ww,shoemat);mesh_nodes.append(node);counts['Shoe_'+side]=triangles

g['nodes'].append({'name':'Responder','children':roots+mesh_nodes});g['scenes'][0]['nodes']=[len(g['nodes'])-1]
g['buffers'][0]['byteLength']=len(binary)
jsonbytes=json.dumps(g,separators=(',',':')).encode();jsonbytes+=b' '*(4-len(jsonbytes)%4 if len(jsonbytes)%4 else 0)
binary+=b'\0'*(-len(binary)%4);total=12+8+len(jsonbytes)+8+len(binary)
(OUT/'responder.glb').write_bytes(struct.pack('<III',0x46546C67,2,total)+struct.pack('<II',len(jsonbytes),0x4E4F534A)+jsonbytes+struct.pack('<II',len(binary),0x004E4942)+binary)
meta={'coordinateSystem':'Y-up, +Z front','height':1.8,'originalFloor':floor,'sourceScale':scale,'boneRestRotations':'identity','bones':{n:{'head':heads[n],'tail':tails[n],'parent':rig['bones'][n]['parent']}for n in names},'triangles':counts}
(OUT/'responder-rig.json').write_text(json.dumps(meta,indent=2)+'\n')
license={'license':'CC0-1.0','sources':[{'asset':'base mesh, skeleton, skin weights','url':'https://github.com/makehumancommunity/makehuman/tree/master/makehuman/data','licenseEvidence':'Each asset header and LICENSE.ASSETS.md explicitly release data as CC0.'},{'asset':'skin, casual outfit, hair, eyes','url':'https://github.com/Makehuman-2/MH2_Asset_Repository_CCO/releases/tag/CC0','licenseEvidence':'Official CC0 system archive; authored mesh/material headers explicitly CC0 September 2020.'}],'adaptations':'Original authored topology/UV/texture and skeleton; fitted via asset barycentric mappings; covered body regions excluded, civilian footwear generated; textures resized to 1024. No MakeHuman program code bundled.','triangles':counts,'bytes':total,'inputs':{str(path.relative_to(S)):{'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}for path in [S/'mh-base.obj',S/'default.mhskel',S/'default_weights.mhw',clothdir/'male_casualsuit02.obj',clothdir/'male_casualsuit02.mhclo',clothdir/'male_casualsuit02_diffuse.png',clothdir/'male_casualsuit02_normal.png',hairdir/'short04.obj',hairdir/'short04.mhclo',hairdir/'short04_diffuse.png',S/'mh-eyes.obj',S/'mh-eyes.mhclo',S/'mh-brown-eye.png',S/'mh-system/skins/young_caucasian_male/young_lightskinned_male_diffuse.png']}}
(OUT/'responder-license.json').write_text(json.dumps(license,indent=2)+'\n')
print(json.dumps({'file':str(OUT/'responder.glb'),'bytes':total,'triangles':counts,'bones':len(names),'height':1.8}))
