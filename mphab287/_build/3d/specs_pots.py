# Aspect réel de chaque excipient (état physique, couleur, contenant)
L = lambda col, visq=False, ambre=False: dict(c='liq', col=col, visq=visq, ambre=ambre)
P = lambda col, grain=.5, ambre=False, capBlanc=True: dict(c='bocal', k='poudre', col=col, grain=grain, ambre=ambre, capBlanc=capBlanc)
X = lambda k, col, capBlanc=False: dict(c='bocal', k=k, col=col, capBlanc=capBlanc)
SPECS = {
 'x0': L('#d6ebf4'), 'x1': L('#e4edf1'), 'x2': L('#e1edf3'), 'x3': L('#e9e6ef', True), 'x4': L('#efe6c4', True),
 'x5': dict(c='cg', col='#efe8c0'), 'x6': L('#eceff1'), 'x7': X('cristal', '#fbfaf4', True), 'x8': P('#fbfbf7', .4),
 'x9': X('granule', '#f6f1e2', True), 'x10': X('cristal', '#f6ecea'), 'x11': X('flocon', '#fbfbf8', True), 'x12': X('granule', '#fbfaf5', True),
 'x13': X('cristal', '#f4f4ef'), 'x14': dict(c='cg', col='#efe9c6'), 'x15': P('#f1e8d0', .4, False, False),
 'x16': X('flocon', '#fbfaf6', True), 'x17': X('pastille', '#f1ecd9'), 'x18': dict(c='pot', col='#f5f0e3', transl=False),
 'x19': L('#f0df98', True), 'x20': L('#a8641a', True), 'x21': L('#c8952f', True), 'x22': L('#e8c04c', True),
 'x23': X('pastille', '#f6f3ea', True), 'x24': dict(c='pot', col='#d6a43a', transl=False), 'x25': L('#f0e4b2', True),
 'x26': L('#b8701f', True), 'x27': X('cristal', '#fbfbf6', True), 'x28': X('cristal', '#fbf6e2', True),
 'x29': X('cristal', '#ffffff', True), 'x30': X('cristal', '#f8f8f6'), 'x31': P('#fbfbf8', .5), 'x32': X('flocon', '#f9f9f6', True),
 'x33': P('#fcfbf7', .8), 'x34': P('#f1ece0', .9), 'x35': P('#eee8d8', .8), 'x36': X('granule', '#f2ead2'), 'x37': P('#f3ecd5', .7),
 'x38': P('#e2d4b2', .7), 'x39': P('#ffffff', .95), 'x40': dict(c='pot', col='#ecd77e', transl=True),
 'x41': P('#f4f7fa', 1.0), 'x42': P('#eee6d2', .7), 'x43': L('#e3eef1'), 'x44': L('#e7efec'), 'x45': X('cristal', '#fdfdfb', True),
 'x46': L('#ebe5cc', True), 'x47': X('pastille', '#efe3bd'), 'x48': L('#f2eedb', True), 'x49': P('#fdfdfd', .3), 'x50': P('#f3f3f1', .2),
 'x51': X('flocon', '#fbfbf9'), 'x52': P('#f2f6fa', 1.0), 'x53': P('#fbfaf5', .6), 'x54': X('eclat', '#dcb879'),
 'x55': P('#f6f1e4', .8), 'x56': X('cristal', '#fdfdfc', True), 'x57': P('#f6f4ef', .5), 'x58': P('#f3eee0', .6), 'x59': P('#efe8d4', .6),
 'x60': X('granule', '#efe9d8', True), 'x61': X('eclat', '#d49a3a'), 'x62': X('granule', '#f7f5ee', True), 'x63': X('pastille', '#fafafa', True),
 'x64': L('#ebe8f0', True), 'x65': X('cristal', '#ffffff', True), 'x66': dict(c='bocal', k='couches', cols=['#2a5bd7', '#c8102e', '#f2b705']),
 'x67': dict(c='gaz', col='#2f6fb3'),
}
for i, k in enumerate(SPECS): SPECS[k]['seed'] = i + 3
NIV = [.4, .6, .8, 1.0]
