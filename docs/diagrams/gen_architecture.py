#!/usr/bin/env python3
"""Parley architecture (.excalidraw), hand-drawn reference style.
Shows the 0G-native flow: every NPC turn is live 0G Compute, memory is on 0G
Storage (encrypt-to-self), and each completed stage is anchored on 0G Chain.
0G is the spine — color-coded, with lib/og as the single seam. No external logos."""
import json, itertools

# ---- palette (Excalidraw hand-drawn palette) ----
BLACK = "#1e1e1e"
INK   = "#343a40"     # arrows / body
MUTE  = "#6b7280"     # subtitles / arrow labels
PAPER = "#fff9db"     # parley paper tint
BLUE_F,  BLUE_S  = "#a5d8ff", "#1971c2"      # player / browser
VIO_F,   VIO_S   = "#d0bfff", "#7048e8"      # app server
GREEN_F, GREEN_S = "#b2f2bb", "#2f9e44"      # 0G Compute (the engine)
CYAN_F,  CYAN_S  = "#99e9f2", "#0c8599"      # 0G Storage
GOLD_F,  GOLD_S  = "#ffec99", "#f08c00"      # 0G Chain / reward
OG_F,    OG_S    = "#fff3bf", "#e8590c"      # 0G container highlight
WHITE_F          = "#ffffff"

_seed = itertools.count(50001)
els, files = [], {}

def base(**kw):
    e = dict(strokeColor=BLACK, backgroundColor="transparent", fillStyle="solid",
             strokeWidth=2, strokeStyle="solid", roughness=1, opacity=100, angle=0,
             seed=next(_seed), version=1, versionNonce=next(_seed), isDeleted=False,
             groupIds=[], boundElements=[], link=None, locked=False)
    e.update(kw); return e

def rect(id, x, y, w, h, fill=WHITE_F, stroke=BLACK, sw=2, dash=False):
    els.append(base(type="rectangle", id=id, x=x, y=y, width=w, height=h,
                    backgroundColor=fill, strokeColor=stroke, strokeWidth=sw,
                    strokeStyle="dashed" if dash else "solid", roundness={"type": 3}))

def text(id, x, y, w, s, color=BLACK, size=16, align="center", font=1):
    h = round(size * 1.27 * (s.count("\n") + 1))
    els.append(base(type="text", id=id, x=x, y=y, width=w, height=h, text=s, originalText=s,
                    fontSize=size, fontFamily=font, textAlign=align, verticalAlign="top",
                    strokeColor=color, strokeWidth=1, roughness=0, containerId=None, lineHeight=1.27))

def arrow(id, pts, stroke=INK, sw=2.5, dash=False, end="arrow", start=None):
    x0, y0 = pts[0]
    els.append(base(type="arrow", id=id, x=x0, y=y0,
                    width=max(p[0] for p in pts)-min(p[0] for p in pts),
                    height=max(p[1] for p in pts)-min(p[1] for p in pts),
                    strokeColor=stroke, strokeWidth=sw, roughness=1,
                    strokeStyle="dashed" if dash else "solid",
                    points=[[p[0]-x0, p[1]-y0] for p in pts],
                    startBinding=None, endBinding=None,
                    startArrowhead=start, endArrowhead=end))

# a titled component box: colored card + bold title + body lines
def card(id, x, y, w, h, title, body, fill, stroke, tsize=18, bsize=13):
    rect(id, x, y, w, h, fill=fill, stroke=stroke, sw=2.5)
    text(id+"_t", x+14, y+12, w-28, title, color=BLACK, size=tsize, align="left")
    if body:
        text(id+"_b", x+14, y+12+tsize+10, w-28, body, color=INK, size=bsize, align="left")

# ============================================================ layout
W = 1560
# ---- title ----
text("title", 60, 30, 900, "PARLEY", color=OG_S, size=54, align="left")
text("tag", 64, 96, 1100, "Learn a language by living in it — every turn is live 0G inference.",
     color=MUTE, size=20, align="left")
text("og_badge", 1140, 40, 380, "built on 0G · Galileo testnet", color=OG_S, size=20, align="right")

# ---- LAYER 1: traveler (browser) ----
rect("L1", 60, 150, 1440, 170, fill=BLUE_F, stroke=BLUE_S, sw=2.5)
text("L1h", 78, 162, 700, "TRAVELER · the browser app (Next.js + React)", color=BLUE_S, size=20, align="left")
card("c_scene", 90, 200, 340, 100, "The Scene", "talk to the local\n(push-to-talk mic / type)", WHITE_F, BLUE_S)
card("c_atlas", 450, 200, 300, 100, "The Atlas", "5 stages / levels\nIntroductions → …", WHITE_F, BLUE_S)
card("c_phrase", 770, 200, 300, 100, "Phrasebook", "words you used,\nspaced repetition", WHITE_F, BLUE_S)
card("c_pass", 1090, 200, 390, 100, "Passport · verified record", "stamps + the on-chain\nproof of each stage", PAPER, GOLD_S)
text("wallet", 1090, 305, 390, "↳ MetaMask signs storage + anchor", color=MUTE, size=13, align="left")

# ---- LAYER 2: server routes + the seam ----
rect("L2", 60, 372, 1080, 150, fill=VIO_F, stroke=VIO_S, sw=2.5)
text("L2h", 78, 384, 700, "APP SERVER · holds the 0G Router key", color=VIO_S, size=20, align="left")
card("c_chat", 90, 422, 300, 86, "/api/chat", "the local's reply", WHITE_F, VIO_S, bsize=13)
card("c_judge", 410, 422, 300, 86, "/api/judge", "grades the exchange", WHITE_F, VIO_S, bsize=13)
card("c_tr", 730, 422, 380, 86, "/api/translate", "tap-to-translate any line", WHITE_F, VIO_S, bsize=13)
# the seam
rect("seam", 1170, 372, 330, 150, fill="#fff0f6", stroke="#e64980", sw=2.5)
text("seam_t", 1186, 392, 300, "lib/og", color="#c2255c", size=22, align="left")
text("seam_b", 1186, 426, 300, "the ONLY seam to 0G.\nmock ⇄ live behind one\ntyped interface — UI never\nknows the difference.", color=INK, size=13, align="left")

# ---- LAYER 3: 0G (the spine) ----
rect("OGbox", 60, 590, 1440, 300, fill=OG_F, stroke=OG_S, sw=3)
text("OGh", 80, 604, 900, "0G · Decentralized-AI L1   —   three services do real, load-bearing work", color=OG_S, size=22, align="left")

card("c_compute", 90, 660, 430, 200, "0G Compute  (the engine)",
     "OpenAI-compatible Router →\nqwen2.5-omni-7b in a TEE.\n\n• every NPC turn = live inference\n• a separate judge call grades it\n• returns x_0g_trace attestation\n  (provider + request id)",
     GREEN_F, GREEN_S, bsize=14)
card("c_storage", 545, 660, 440, 200, "0G Storage  (memory & ownership)",
     "@0gfoundation/0g-ts-sdk.\n\n• scene transcripts uploaded,\n  encrypt-to-self (XChaCha20)\n• network sees only ciphertext\n• returns a real content root",
     CYAN_F, CYAN_S, bsize=14)
card("c_chain", 1010, 660, 470, 200, "0G Chain  (the verifiable record)",
     "Galileo testnet · chainId 16602.\n\n• keccak256(recordHash) anchored\n  as a tx the user signs\n• tamper-evident learning record\n• explorer-linked in the dev panel",
     GOLD_F, GOLD_S, bsize=14)

# ============================================================ arrows
# the live conversation loop: Scene → /api/chat → Compute → back
arrow("a1", [[260, 300], [240, 422]], stroke=VIO_S)                 # scene → chat
text("a1l", 70, 345, 170, "talk (turn)", color=MUTE, size=13, align="left")
arrow("a2", [[240, 508], [260, 660]], stroke=GREEN_S)               # chat → compute
text("a2l", 250, 560, 230, "live inference + judge", color=MUTE, size=13, align="left")
arrow("a3", [[470, 660], [430, 300]], stroke=GREEN_S, dash=True)    # compute → scene (reply)
text("a3l", 480, 470, 260, "reply + TEE attestation", color=GREEN_S, size=13, align="left")

# memory + anchor: wallet/Passport → Storage, Chain ; and back up to the record
arrow("a4", [[1230, 300], [820, 660]], stroke=CYAN_S)               # passport → storage
text("a4l", 980, 470, 220, "encrypted transcript", color=CYAN_S, size=13, align="left")
arrow("a5", [[1320, 300], [1230, 660]], stroke=GOLD_S)              # passport → chain
text("a5l", 1300, 470, 200, "anchor keccak(root)", color=GOLD_S, size=13, align="left")

# 0G outputs feed the verified record (dashed, "proof")
arrow("a6", [[760, 660], [1180, 320]], stroke=CYAN_S, dash=True)    # storage root → passport
arrow("a7", [[1245, 660], [1330, 320]], stroke=GOLD_S, dash=True)   # chain tx → passport

# footer key
text("key", 64, 910, 1400,
     "solid = request   ·   dashed = proof returned   ·   strip 0G out and there's an empty map: nothing to say, remember, or prove.",
     color=MUTE, size=15, align="left")

# ============================================================ write
doc = {"type": "excalidraw", "version": 2, "source": "parley", "elements": els,
       "appState": {"viewBackgroundColor": "#faf8f1", "gridSize": None}, "files": files}
out = __file__.rsplit("/", 1)[0] + "/parley-architecture.excalidraw"
json.dump(doc, open(out, "w"), indent=2)
print("wrote", out, "·", len(els), "elements")
