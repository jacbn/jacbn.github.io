import turtle as t, math, itertools, time, tkinter as tk, numpy as np
s = t.Screen()
t.speed(3)
t.tracer(0,0)
s.tracer(0,0)
circles = {}
negatives = []
queue = []
offsetBiggestCircleFound = False




DETAIL = 1 #recommended 3, higher detail = more circles drawn at smaller scales. max 5.




def makeCircle(radius, centre=(0,0), n=[]):
    pos = t.pos()
    t.ht()
    t.seth(0)
    t.up()
    t.goto(centre[0], centre[1]-radius)
    t.down()
    t.circle(radius)
    t.up()
    t.goto(pos)
    if n: circles[(radius, centre)] = n
    

def getPosition(r1, pos1, r2, pos2, r3, pos3, reverse=False):
    """Using http://arxiv.org/pdf/math/0101066v1.pdf, we can calculate the position of the circle bounded by 3 others."""
    if r1 > 5-DETAIL and r2 > 5-DETAIL and r3 > 5-DETAIL:
        if r1 == 360: r1 = -360
        if r2 == 360: r2 = -360
        if r3 == 360: r3 = -360
        c1,c2,c3 = 1/r1, 1/r2, 1/r3
        p1,p2,p3 = complex(pos1[0], pos1[1]), complex(pos2[0], pos2[1]), complex(pos3[0], pos3[1])

        r4 = calcRadius(r1,r2,r3, reverse)
        if r4 == None:
            return None, None
        c4 = 1/r4
        p4pos = (2*np.sqrt(c1*p1*(c2*p2 + c3*p3) + c2*p2*c3*p3) + c1*p1 + c2*p2 + c3*p3)/c4
        p4neg = (-2*np.sqrt(c1*p1*(c2*p2 + c3*p3) + c2*p2*c3*p3) + c1*p1 + c2*p2 + c3*p3)/c4

        if reverse:
            p4 = p4pos if p4pos.real * p4pos.real + p4pos.imag * p4pos.imag < p4neg.real * p4neg.real + p4neg.imag * p4neg.imag else p4neg
        else:
            p4 = p4pos if p4pos.real * p4pos.real + p4pos.imag * p4pos.imag > p4neg.real * p4neg.real + p4neg.imag * p4neg.imag else p4neg

        return r4, (p4.real, p4.imag)
    else:
        return None, None

    
def calcRadius(r1,r2,r3, reverse):
    """Uses Descartes' Theorem to calculate the radius of the circle bounded by 3 others."""
    a,b,c = (1/r1) if r1 != 360 else (-1/r1), 1/r2, 1/r3
    global offsetBiggestCircleFound
    if reverse and not offsetBiggestCircleFound:
        if sum(sorted([i[0] for i in list(circles.keys()) if abs(i[0]) != 360])[:1]) > 180:
            
            offsetBiggestCircleFound = True
            return None
        return 1/(a + b + c - 2 * math.sqrt(abs(a*b + b*c + c*a)))
    else:
        return 1/(a + b + c + 2 * math.sqrt(abs(a*b + b*c + c*a)))

    


def genQuart(i):
    r, c = getPosition(*i[0], *i[1], *i[2])
    if r == None and c == None or (c[0], c[1]) in [i[1] for i in list(circles.keys())]:
        return
    makeCircle(r, (c[0], c[1]), [i[0], i[1], i[2]])
    circles[i[0]].append((r,c))
    if circleOffset.get() == 180:
        m = np.tan(math.radians(circleOrient.get())) #this should be +45 more than the +315 used below - hence, +360, so nothing.
        mm = m*m
        det = 1/(1+mm)
        makeCircle(r, (det*(c[0]*(1-mm) + c[1]*2*m), det*(c[0]*2*m + c[1] * (mm-1))))
    else:
        if not offsetBiggestCircleFound:
            r, c = getPosition(*i[0], *i[1], *i[2], True)
            if r == None and c == None:
                return
            makeCircle(r, (c[0], c[1]), [i[0], i[1], i[2]])



def nextIteration():
    for i in circles.keys():
        for j in circles[i]:
            l = list(set(circles[i]).intersection(set(circles[j])))
            if i in l:
                l.remove(i)
            for k in range(len(l)):
                m = l[k]
                if sum([1 for each in queue if each in [(i,j,m),(i,m,j),(j,i,m),(j,m,i),(m,j,i),(m,i,j)]]) == 0:
                    queue.append((i,j,m))

    for i in queue:
        genQuart([i[0], i[1], i[2]])
    t.update()
    s.update()
    queue.clear()


def changeStartSettings(event=None):
    a = circleSize.get()
    b = 360-a
    t.reset()
    circles.clear()
    negatives.clear()
    queue.clear()
    x = np.cos(math.radians(circleOrient.get()+315))/np.sqrt(2) - np.sin(math.radians(circleOrient.get()+315))/np.sqrt(2)
    y = np.sin(math.radians(circleOrient.get()+315))/np.sqrt(2) + np.cos(math.radians(circleOrient.get()+315))/np.sqrt(2)
    
    makeCircle(360, (0,0),                   [(a, ((a-360)*x,(a-360)*y)),    (b, (a*x,a*y))])
    makeCircle(a, ((a-360)*x,(a-360)*y),     [(360, (0,0)),                  (b, (a*x,a*y))])
    makeCircle(b, (a*x,a*y),                 [(360, (0,0)),                  (a, ((a-360)*x,(a-360)*y))])


def changeStartConditions(event=None):
    global offsetBiggestCircleFound
    offsetBiggestCircleFound = False
    
    t.reset()
    circles.clear()
    negatives.clear()
    queue.clear()
    
    r1 = 360
    r2 = circleSize.get()
    offset = circleOffset.get()
    r3 = (offset/180) * (r1-r2)

    x = ((r2+r3)**2 - (r1-r3)**2 - (r1-r2)**2)
    x /= 2*(r1-r2)
    y = ((r1-r3)**2 - x**2)**0.5

    
    sin, cos = getCircleOrient(315) #315 ensures the circles start horizontally
    tx = (cos - sin)/np.sqrt(2) #rotation
    ty = (sin + cos)/np.sqrt(2) #matrix (normalised)

    sin, cos = getCircleOrient(0)
    makeCircle(360, (0,0),                        [(r2, ((r2-360)*tx,(r2-360)*ty)),    (r3, (x*cos - y*sin, x*sin + y*cos))])
    makeCircle(r2, ((r2-360)*tx,(r2-360)*ty),     [(360, (0,0)),                       (r3, (x*cos - y*sin, x*sin + y*cos))])
    makeCircle(r3, (x*cos - y*sin, x*sin + y*cos),                        [(360, (0,0)),                       (r2, ((r2-360)*tx,(r2-360)*ty))])



def getCircleOrient(modifiedAngle):
    return np.sin(math.radians(circleOrient.get()+modifiedAngle)), np.cos(math.radians(circleOrient.get()+modifiedAngle))


root = tk.Tk()
tk.Button(root, text="Next iteration", font=("Consolas", 25), command=nextIteration).grid()
circleSize = tk.Scale(root, from_=1, to=359, orient="horizontal", length=300, command=changeStartConditions, label="Start Size")
circleSize.set(180)
circleSize.grid()
circleOrient = tk.Scale(root, from_=0, to=359, orient="horizontal", length=300, command=changeStartConditions, label="Start Rotation")
circleOrient.grid()
circleOffset = tk.Scale(root, from_=0, to=180, orient="horizontal", length=300, command=changeStartConditions, label="Start Offset")
circleOffset.set(180)
circleOffset.grid()

root.mainloop()






















