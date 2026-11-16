import os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src'))
s=open('shell.html').read()
d=open('expl.js').read()+'\n'+open('data1.js').read()+'\n'+open('data2.js').read()+'\n'+open('data3.js').read()+'\n'+''.join(open(f'hw{i}.js').read()+'\n' for i in range(1,6))
a=open('logic.js').read()+open('ui.js').read().replace('<div class="score num">${big}</div>','<div class="score num" style="${big.length > 6 ? \'font-size:clamp(52px,10vw,96px)\' : \'\'}">${esc(big)}</div>')+open('share.js').read()
s=s.replace('/*DATA*/',d).replace('/*APP*/',a)
open('../index.html','w').write(s)
