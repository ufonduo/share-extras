import os
import sys
from decimal import sep

TRANSLATIONS_FILE = 'glossary.txt'
NEWLINE = '\r\n'

def main(argv):
    f = open(TRANSLATIONS_FILE)
    translations = {}
    with open(path) as f:
        for line in f:
            if not line.startswith('#'):
                cmpts = line.split(' || ')
                if len(cmpts > 1):
                    translations[cmpts[0].strip()] = cmpts[1].strip()
    translate(argv[0], translations)

def translate(path, translations):
    if os.path.isdir(path):
        for child in os.listdir(path):
            translate(path + os.sep + child)
    elif os.path.isfile(path):
        newtext = ''
        with open(path) as f:
            for line in f:
                if not line.startswith('#') and line.strip() != '':
                    if '=' in line:
                        (k, sep, v) = line.partition('=')
                        for (old, new) in translations.items():
                            v = v.replace(old, new)
                            newtext = newtext + k + sep + v
                    elif ' ' in line:
                        (k, sep, v) = line.partition(' ')
                        for (old, new) in translations.items():
                            v = v.replace(old, new)
                            newtext = newtext + k + sep + v
                else:
                    newtext = newtext + line
        # Write new text to file
        f = open(path, 'w')
        f.write(newtext)
        f.close()        

if __name__ == 'main':
    main(sys.argv)