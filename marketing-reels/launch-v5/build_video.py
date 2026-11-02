#!/usr/bin/env python3
"""UNMINDY Launch Video v5 - Fixed Motion Graphics"""

from moviepy import (
    TextClip, ImageClip, CompositeVideoClip,
    AudioFileClip, ColorClip
)

W, H = 1080, 1920
FPS = 30
DURATION = 35

FONT = 'DejaVuSans-Bold'

def txt(text, font_size=80, color='white', y=None):
    """Center text, optional fixed y"""
    clip = TextClip(
        text=text,
        font=FONT,
        font_size=font_size,
        color=color,
        size=(W, None),
        method='caption',
        text_align='center',
        margin=(0, 40)
    )
    if y is None:
        clip = clip.with_position('center')
    else:
        clip = clip.with_position(('center', y))
    return clip

def make_bg():
    """Solid black background"""
    return ColorClip(size=(W, H), color=(0, 0, 0)).with_duration(DURATION)

def build():
    print("Building video layers...")
    layers = []
    layers.append(make_bg())

    # === Scene 1: 0-4s - THE AVERAGE PERSON / 147x / DAILY UNLOCKS ===
    s1_label = txt("THE AVERAGE PERSON", font_size=48, color='#777777', y=int(H*0.22)).with_start(0.3).with_end(3.8)
    s1_stat = txt("147×", font_size=220, color='white', y=int(H*0.38)).with_start(0.6).with_end(3.8)
    s1_sub = txt("DAILY UNLOCKS", font_size=56, color='#777777', y=int(H*0.58)).with_start(1.5).with_end(3.8)
    layers.extend([s1_label, s1_stat, s1_sub])

    # === Scene 2: 4-9s - Most of it isn't even your choice ===
    s2 = txt("Most of it\nisn't even\nyour choice.", font_size=110, color='white', y=int(H*0.45)).with_start(4.0).with_end(8.8)
    layers.append(s2)

    # === Scene 3: 9-14s - Your brain is on autopilot ===
    s3_label = txt("THE PROBLEM", font_size=44, color='#777777', y=int(H*0.22)).with_start(9.3).with_end(13.8)
    s3_text = txt("Your brain\nis on autopilot.", font_size=120, color='white', y=int(H*0.42)).with_start(9.5).with_end(13.8)
    layers.extend([s3_label, s3_text])

    # === Scene 4: 14-22s - UNMINDY logo + tagline ===
    try:
        s4_logo = ImageClip('assets/pause-bars.png').with_start(14.3).with_end(21.5)
        s4_logo = s4_logo.with_position(('center', int(H*0.32))).resized(height=180)
        layers.append(s4_logo)
    except Exception as e:
        print(f"Logo load failed: {e}")

    s4_word = txt("UNMINDY", font_size=150, color='white', y=int(H*0.55)).with_start(14.8).with_end(21.5)
    s4_sub = txt("CATCHES YOU IN 3 SECONDS", font_size=52, color='#777777', y=int(H*0.72)).with_start(16.0).with_end(21.5)
    layers.extend([s4_word, s4_sub])

    # === Scene 5: 22-28s - Catch. Ask. Lock. ===
    s5_text = txt("Catch. Ask. Lock.", font_size=130, color='white', y=int(H*0.45)).with_start(22.2).with_end(27.8)
    layers.append(s5_text)

    # === Scene 6: 28-35s - CTA ===
    s6_word = txt("UNMINDY", font_size=170, color='white', y=int(H*0.38)).with_start(28.5).with_end(34.5)
    s6_tag = txt("Break the scroll.", font_size=72, color='white', y=int(H*0.58)).with_start(29.8).with_end(34.5)
    s6_url = txt("landing-nine-pi-85.vercel.app", font_size=48, color='#777777', y=int(H*0.68)).with_start(30.2).with_end(34.5)
    layers.extend([s6_word, s6_tag, s6_url])

    # Composite everything
    print("Compositing...")
    video = CompositeVideoClip(layers, size=(W, H)).with_duration(DURATION)

    # Audio
    print("Loading audio...")
    audio = AudioFileClip('assets/narration-timed.wav')
    video = video.with_audio(audio)

    # Render
    print("Rendering v5 fixed...")
    video.write_videofile(
        'unmindy-launch-v5.mp4',
        fps=FPS,
        codec='libx264',
        audio_codec='aac',
        threads=4,
        logger='bar'
    )
    print("Done!")

if __name__ == '__main__':
    build()
