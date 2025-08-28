x=0
y=0
z=0

while x<=0:
    x=int(input("Ingresa el lado x:"))
while y<=0:    
    y=int(input("Ingresa el lado y:"))
while z<=0:    
    z=int(input("Ingresa el lado z:"))

if x+y > z and x+z >y and y+z > x:
    if x==y==z:
        print("Es un triangulo equilatero")
    elif x==y or y==z or z==x:
        print("Es un triangulo isoceles")
    else:
        print("Es un triangulo escaleno")     
else:
    print("no es un triangulo")           