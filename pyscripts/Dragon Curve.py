import tkinter as tk
import math
from PIL import Image

root = tk.Tk()
canvas = tk.Canvas(root, width=1280, height=720, bg="white")
canvas.grid()


startPos = (640, 360)
lineLength = 1

placedLines = [canvas.create_line(startPos[0], startPos[1], startPos[0], startPos[1]+lineLength, width=4)]

def cloneLines():
    clonedLines = []
    for line in placedLines:
        clonedLines.append(canvas.create_line(*canvas.coords(line), width=4))
    return clonedLines

def findAnchor(coords, anchor):
    theta = 270 * math.pi/180
    return [anchor[0] + math.cos(theta) * (coords[0] - anchor[0]) - math.sin(theta) * (coords[1] - anchor[1]), anchor[1] + math.sin(theta) * (coords[0] - anchor[0]) + math.cos(theta) * (coords[1] - anchor[1])]


def iterate(event=None):
    global anchor, iters, placedLines
    iters += 1
##    if iters > 3:
##        canvas.scale(tk.ALL, startPos[0], startPos[1], 0.9, 0.9)
    clonedLines = cloneLines()
    theta = 270 * math.pi/180
    for i in clonedLines:
        coords = canvas.coords(i)
        canvas.coords(i,
                      anchor[0] + math.cos(theta) * (coords[0] - anchor[0]) - math.sin(theta) * (coords[1] - anchor[1]),
                      anchor[1] + math.sin(theta) * (coords[0] - anchor[0]) + math.cos(theta) * (coords[1] - anchor[1]),
                      anchor[0] + math.cos(theta) * (coords[2] - anchor[0]) - math.sin(theta) * (coords[3] - anchor[1]),
                      anchor[1] + math.sin(theta) * (coords[2] - anchor[0]) + math.cos(theta) * (coords[3] - anchor[1]))

    placedLines += clonedLines

    anchor = findAnchor((startPos[0], startPos[1]+lineLength), anchor)


def zoom(event):
    print(event)
    factor = 1.005 ** event.delta
    canvas.scale(tk.ALL, event.x, event.y, factor, factor)

def save(event=None):
    canvas.postscript(file="dragoncurve.eps", colormode="color")
    img = Image.open("dragoncurve.eps")
    img.save("dragoncurve.png", "png")

anchor = startPos
iters = 0

tk.Button(root, text="Iterate", command=iterate).grid()
tk.Button(root, text="Save", command=save).grid()
canvas.bind('<ButtonPress-1>', lambda event: canvas.scan_mark(event.x, event.y))
canvas.bind("<B1-Motion>", lambda event: canvas.scan_dragto(event.x, event.y, gain=1))
canvas.bind("<MouseWheel>", zoom)


    
root.mainloop()
