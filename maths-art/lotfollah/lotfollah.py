import numpy as np
from matplotlib import pyplot as plt

plt.style.use("dark_background")

fig = plt.figure()
ax = plt.axes(xlim = (-360, 360), ylim = (-360, 360))

# -- USER DEFINED CONSTANTS -- #
SYMCOUNT = 12   #n>8 for proper patterns, 12 gives perfect squares
ITERATIONS = 8
STARTSIZE = 90
GAP = 0
# --           --           -- #

ANGLE = 2*np.pi/SYMCOUNT


def rotate(matrix, theta, origin = (0, 0)):
    if origin == (0, 0):
        rotmat = np.matrix([[np.cos(theta), -np.sin(theta)], [np.sin(theta), np.cos(theta)]])
        return np.matmul(rotmat, matrix)
    else:
        x, y = origin
        rotmat = np.matrix([[np.cos(theta), -np.sin(theta), -x * np.cos(theta) + y * np.sin(theta) + x],
                            [np.sin(theta), np.cos(theta), -x * np.sin(theta) - y * np.cos(theta) + y],
                            [0, 0, 1]])
        matrix3x1 = np.concatenate((matrix, np.matrix([[1]]) ))
        a = np.matmul(rotmat, matrix3x1)
        return np.delete(a, 2, 0)


def getCircleIntersection(P : tuple, Q : tuple, r : float):
    # P and Q of form (x, y)
    a1, b1 = P
    a2, b2 = Q 

    if np.isclose(b1, b2):
        x = (a1 + a2) / 2
        s = np.sqrt(r*r - ((a2 - a1)/2)**2)
        y1 = b1 + s
        y2 = b1 - s
        return (x, y1) if abs(y1) > abs(y2) else (x, y2)
    
        
    
    m = (a1 - a2)/(b2 - b1)
    c = (b1 + b2 - m*(a1 + a2))/2
    #y=mx+c is the perpendicular line through the midpoint of the two circles

    A = m * m + 1
    B = 2 * (m * (c - b1) - a1)
    C = a1 * a1 + b1 * b1 + c * c - 2 * b1 * c - r * r

    sqrt_discrim = np.sqrt(B*B - 4*A*C)
    if (B*B - 4*A*C < 0):
        print(P, Q, b1, b2, r)
        raise RuntimeError

    x1 = (-B + sqrt_discrim)/(2*A)
    x2 = (-B - sqrt_discrim)/(2*A)

    y1 = m*x1 + c
    y2 = m*x2 + c

    return (x1, y1) if x1*x1 + y1*y1 > x2*x2 + y2*y2 else (x2, y2)


def rotate_toTuple(matrix, theta, origin = (0, 0)):
    return tuple(map(lambda x: x[0], rotate(matrix, theta, origin).tolist()))


def iterate(centre, iters, firstIter = True):

    print(" -- Iteration", 1 + ITERATIONS - iters, "-- ")

    np_centre = np.matrix([[centre[0]], [centre[1]]])

    #need 4 circle coordinates -- @param centre is one, then three to the right (or left, or any mix of directions -- just 4 consecutive circles would work)
    centres = [centre, rotate_toTuple(np_centre, ANGLE), rotate_toTuple(np_centre, 2*ANGLE), rotate_toTuple(np_centre, 3*ANGLE), rotate_toTuple(np_centre, 4*ANGLE)]

    circleSize = np.hypot(centres[0][0] - centres[2][0], centres[0][1] - centres[2][1]).item(0)

    intersectT = getCircleIntersection(centres[1], centres[3], circleSize)
    intersectB = getCircleIntersection(centres[0], centres[4], circleSize)
    intersectL = getCircleIntersection(centres[0], centres[3], circleSize)
    intersectR = getCircleIntersection(centres[1], centres[4], circleSize)

    
    

    xvalues = [intersectT[0], intersectL[0], intersectB[0], intersectR[0], intersectT[0]]
    yvalues = [intersectT[1], intersectL[1], intersectB[1], intersectR[1], intersectT[1]]
    
    n = np.matrix([xvalues, yvalues])
    
    for i in range(SYMCOUNT):
        squareCoords = rotate(np.matrix([xvalues, yvalues]), i*ANGLE)
        plt.plot(*squareCoords[0].tolist(), *squareCoords[1].tolist())
    
    if firstIter:
        # draw inner circle. radius = abs(any of the intersectB's at the base layer)
        circ = plt.Circle((0, 0), np.hypot(*intersectB), color="white", fill=False)
        plt.gca().add_artist(circ)
        plt.axis("off")
        ax.set_aspect("equal")

    if iters > 1:
        iterate(intersectR, iters-1, False)


#calculate the first intersection position. we use the right intersection so that the right side of the quads in layer n touch the base of the quads in layer n+1 --> spiral.
rightIntersect = getCircleIntersection((0, STARTSIZE), rotate_toTuple(np.matrix([[0], [STARTSIZE]]), 3*ANGLE), STARTSIZE)

#run the main code
iterate(rightIntersect, ITERATIONS)



plt.show()