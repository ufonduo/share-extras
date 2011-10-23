import os
import re
import sys

TRANSLATIONS_FILE = 'glossary.txt'
NEWLINE = '\n'

def main(argv):
    translations = []
    with open(TRANSLATIONS_FILE) as f:
        for line in f:
            if not line.startswith('#'):
                cmpts = line.split(' || ')
                if len(cmpts) > 1:
                    translations.append({'old': cmpts[0].strip(), 'new': cmpts[1].strip().partition(',')[0], 'auto': len(cmpts) < 3 or cmpts[2].strip() != 'Y'})
                    translations.append({'old': cmpts[0].strip().capitalize(), 'new': cmpts[1].strip().capitalize().partition(',')[0], 'auto': len(cmpts) < 3 or cmpts[2].strip() != 'Y'})
    translate('config', translations)

def translate(path, translations):
    #print path
    if os.path.isdir(path):
        for child in os.listdir(path):
            if not child.startswith('.'):
                translate(path + os.sep + child, translations)
    elif os.path.isfile(path) and path.endswith('.properties'):
        newtext = ''
        with open(path) as f:
            for line in f:
                newline = line.strip('\r\n')
                if not line.startswith('#') and line.strip() != '':
                    if '=' in line:
                        (k, sep, v) = line.partition('=')
                        for t in translations:
                            if t['old'] in v:
                                if t['auto']:
                                    oldv = v
                                    v = re.sub('\\b%s\\b' % (t['old']), t['new'], v)
                                    if v != oldv:
                                        print '%s AUTO translation of %s in string %s' % (path, t['old'], v)
                                        newline = k.strip() + sep + v.strip('\r\n')
                                else:
                                    #print 'Are you sure you want to make this change?'
                                    # TODO accept user input
                                    if re.search('\\b%s\\b' % (t['old']), v):
                                        print '%s SKIPPED translation of %s in string %s' % (path, t['old'], v)

                    elif ' ' in line:
                        (k, sep, v) = line.partition(' ')
                        for t in translations:
                            if t['old'] in v:
                                if t['auto']:
                                    oldv = v
                                    v = re.sub('\\b%s\\b' % (t['old']), t['new'], v)
                                    if oldv != v:
                                        print '%s AUTO translation of %s in string %s' % (path, t['old'], v)
                                        newline = k.strip() + sep + v.strip('\r\n')
                                else:
                                    #print 'Are you sure you want to make this change?'
                                    # TODO accept user input
                                    if re.search('\\b%s\\b' % (t['old']), v):
                                        print '%s SKIPPED translation of %s in string %s' % (path, t['old'], v)
                                        
                newtext += newline + NEWLINE
        
        # Write new text to file
        f = open(path, 'w')
        f.write(newtext)
        f.close()        

if __name__ == '__main__':
    main(sys.argv)