from PIL import Image, ImageDraw

src = Image.open('assets/logo.png').convert('RGBA')
densities = {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}
base = 'android/app/src/main/res'

for d, size in densities.items():
    im = src.copy()
    im.thumbnail((int(size * 0.92), int(size * 0.92)), Image.LANCZOS)

    sq = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    sq.paste(im, ((size - im.width) // 2, (size - im.height) // 2), im)
    sq.save(f'{base}/mipmap-{d}/ic_launcher.png')

    rnd = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    rnd.paste(im, ((size - im.width) // 2, (size - im.height) // 2), im)
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size - 1, size - 1), fill=255)
    rnd.putalpha(Image.composite(rnd.split()[3], Image.new('L', (size, size), 0), mask))
    rnd.save(f'{base}/mipmap-{d}/ic_launcher_round.png')

print('icons written')
